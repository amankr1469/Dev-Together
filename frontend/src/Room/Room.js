import { useContext, useEffect, useState, useRef } from 'react';
import { DataContext } from '../Components/DataContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Ace from './Ace';
import { diff_match_patch } from 'diff-match-patch';
import defaultCode from './../static/default_code.json';
import axios from 'axios';
import VideoChat from './VideoChat';
import WhiteBoard from './WhiteBoard';
const dmp = new diff_match_patch();

const Room = () => {
    const { user, currRoom, socket } = useContext(DataContext);
    const navigate = useNavigate();
    const [language, setLanguage] = useState(currRoom ? currRoom.language : "javascript");
    let [code, setCode] = useState(currRoom ? currRoom.code : defaultCode[language ? language : "javascript"]);
    let roomid = currRoom ? currRoom.roomid : "";
    let name = user ? user.name : "";
    let roomName = currRoom ? currRoom.name : "";
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [inRoomUsers, setInRoomUsers] = useState([]);
    const [running, setRunning] = useState(false);
    const EditorRef = useRef(null);
    const [isWhiteBoard, setIsWhiteBoard] = useState(false);
    const userVideoRef = useRef(null);
    function updateRoom(patch) {
        socket.emit('update', { roomid, patch })
    }

    useEffect(() => {
        if (user === null || currRoom === null) {
            navigate('/');
        }
        socket.on('connect', () => {
            console.log('connected');
        })

        if (currRoom) {
            socket.emit('join', {
                name,
                roomName,
                roomid,
                code,
                language,
                token: localStorage.getItem('user'),
                input,
                output,
                avatar: user.avatar
            })
        }

        socket.on('join', ({ msg, room }) => {
            console.log("jonin gave me this data\n", room, "\n");
            toast(msg, {
                position: toast.POSITION.TOP_RIGHT
            });
            setCode(room.code);
            setLanguage(room.language);
            setInput(room.input);
            setOutput(room.output);
            setInRoomUsers(room.users);
            socket.off('join')
        })

        return () => {
            socket.off();
        }

    }, [])

    useEffect(() => {
        const resizeBtn = document.querySelector("#resize-editor");
        resizeBtn?.addEventListener("mousedown", (e) => {
            const startX = e.clientX;
            const initialWidth = document.querySelector("#editor").offsetWidth;
            console.log(initialWidth);
            document.body.addEventListener("mousemove", changeWidth);

            document.body.addEventListener("mouseup", () => {
                document.body.removeEventListener("mousemove", changeWidth);
            })

            document.body.addEventListener("mouseleave", () => {
                document.body.removeEventListener("mousemove", changeWidth);
            })

            function changeWidth(e) {
                const videoChat = document.querySelector(".video-chat");
                const editor = document.querySelector("#editor");
                const finalX = e.clientX;
                let editorWidth = initialWidth + finalX - startX;
                if (editorWidth < window.innerWidth * 0.5) {
                    editorWidth = window.innerWidth * 0.5;
                }
                editor.style.width = editorWidth + "px";
                let videoWidth = window.innerWidth - editorWidth - 50;
                if (videoWidth < window.innerWidth * 0.20)
                    videoWidth = window.innerWidth * 0.20;

                if (videoWidth > window.innerWidth * 0.35)
                    videoChat.classList.add("wide");
                else
                    videoChat.classList.remove("wide");
                videoChat.style.width = videoWidth + "px";

            }

        });

    }, [currRoom]);


    // if socket is connected then emit updateIO
    if (socket.connected) {
        {
            socket.off('userJoin')
            socket.on('userJoin', ({ msg, newUser }) => {
                // add user to inRoomUsers
                const arr = [];
                arr.push(newUser);
                for (let user of inRoomUsers)
                    arr.push(user);
                setInRoomUsers(arr);
                toast.success(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
        }

        {
            socket.off('userLeft')
            socket.on('userLeft', ({ msg, userId }) => {
                console.log('userLeft', msg)
                // remove user from inRoomUsers
                const arr = inRoomUsers.filter(user => user.id !== userId);
                setInRoomUsers(arr);
                console.log('userLeft', inRoomUsers)
                toast.error(msg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
        }
        {
            socket.off('update')
            socket.on('update', ({ patch }) => {
                // i have no idea why code is empty at this point so i have to do this ugly hack
                // console.log('Editor Ref', EditorRef.current.editor.getValue())
                code = EditorRef.current.editor.getValue();
                let [newCode, results] = dmp.patch_apply(patch, code);
                if (results[0] === true) {
                    const pos = EditorRef.current.editor.getCursorPosition();
                    let oldn = code.split('\n').length;
                    let newn = newCode.split('\n').length;
                    code = newCode;
                    setCode(newCode);
                    const newrow = pos.row + newn - oldn;
                    if (oldn != newn) {
                        EditorRef.current.editor.gotoLine(newrow, pos.column);
                    }
                }
                else {
                    console.log('error applying patch')
                    socket.emit('getRoom', { roomid })
                }
            })
        }
        {
            socket.off('getRoom')
            socket.on('getRoom', ({ room }) => {
                setCode(room.code);
                setLanguage(room.language);
                setInput(room.input);
                setOutput(room.output);
            })
        }
        {
            socket.off('updateIO')
            socket.on('updateIO', ({ newinput, newoutput, newlanguage }) => {
                // update IO
                console.log('updateIo', newinput, newoutput, newlanguage);
                setLanguage(newlanguage);
                setInput(newinput);
                setOutput(newoutput);
            })
        }
        {
            socket.off('error')
            socket.on('error', ({ error }) => {
                console.log('error from socket call', error)
            })
        }
    }

    const IOEMIT = (a, b, c) => {
        socket.emit('updateIO', {
            roomid,
            input: a,
            output: b,
            language: c
        })
    }

    const run = async () => {
        setRunning(true);
        const id = toast.loading("Compiling...")
        await axios({
            url: process.env.REACT_APP_BACKEND_URL + 'code/execute',
            method: 'post',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`
            },
            data: {
                code,
                input,
                language
            }
        })
            .then((res) => {
                toast.update(id, { render: "Compiled successfully", type: "success", isLoading: false, autoClose: 1000 });
                setRunning(false);
                let result = res.data.output ? res.data.output : res.data.error;
                setOutput(result)
                IOEMIT(input, result, language)
            })
            .catch((err) => {
                toast.update(id, { render: "Compilation failed", type: "error", isLoading: false, autoClose: 1500 });
                setRunning(false);
                console.log("error from axios", err)
            })
    }

    const closeCameraAndMircrophone = () => {
        if (userVideoRef.current.srcObject) {
            userVideoRef.current.srcObject.getAudioTracks()[0].stop();
            userVideoRef.current.srcObject.getVideoTracks()[0].stop();
            userVideoRef.current.srcObject.getVideoTracks()[0].enabled = false;
            userVideoRef.current.srcObject.getAudioTracks()[0].enabled = false;
        }

    }


    async function leaveRoom() {
        closeCameraAndMircrophone();
        socket.emit('leave', { roomid });
        socket.off();
        navigate('/');
    }

    if (currRoom && user) {
        return (
            <div className='room'>
                <button id="leave-room" className="active" onClick={leaveRoom}>Leave Room</button>
                <div className="users-joined">
                    {inRoomUsers.map((user) => (

                        <div className="user-joined" key={user.id}>
                            <img src={user.avatar} alt="" />
                            <div className="name">{user.name}</div>
                        </div>
                    ))}
                </div>
                <Ace
                    updateRoom={updateRoom}
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    roomName={roomName}
                    roomid={roomid}
                    EditorRef={EditorRef}
                    input={input}
                    setInput={setInput}
                    output={output}
                    setOutput={setOutput}
                    IOEMIT={IOEMIT}
                    run={run}
                    running={running}
                />
                <div id="resize-editor">
                    <div id="lines-resize"></div>
                </div>
                <VideoChat
                    socket={socket}
                    roomid={roomid}
                    user={user}
                    userVideo={userVideoRef}
                    closeIt={closeCameraAndMircrophone}
                />
                <WhiteBoard roomId={roomid} socket={socket} />
                <ToastContainer autoClose={2000} />
            </div >
        )
    }

    else return (null);

}


export default Room;