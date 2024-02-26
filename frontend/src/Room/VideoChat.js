// using webrtc and  peerjs creat audio chat.
import { Peer } from "peerjs";
import React, { useEffect, useRef, useState } from "react";
const VideoChat = ({ socket, roomid, user, userVideo, closeIt }) => {
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const remoteVideoRef = useRef(null);
    // const userVideo = useRef(null);
    const peerInstance = useRef(null);
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);
    const [screen, setScreen] = useState(false);
    const guestName = useRef(null);
    const peer = new Peer();

    // mute video audio or stop video
    const muteVideo = () => {
        setVideo(!video);
    }

    const muteAudio = () => {
        setAudio(!audio);
    }

    function quitVideoCall() {
        socket.emit("quit-video", { roomId: roomid, peerId });
        closeIt();
        peerInstance.current.destroy();
        setScreen(false);

    }

    function startCall() {
        socket.emit('Id', { roomid, peerId, name: user.name })
        setScreen(true);
        peerInstance.current = peer;
        document.querySelectorAll(".user-video").forEach(video => {
            video.classList.add("active");
        })
        console.log(peerId);
    }


    const call = () => {
        let getUserMedia = navigator.getUserMedia;

        getUserMedia({ video: true, audio: true }, (mediaStream) => {

            userVideo.current.srcObject = mediaStream;
            userVideo.current.play();

            if (remotePeerIdValue) {
                const call = peerInstance.current.call(remotePeerIdValue, mediaStream)

                call.on('stream', (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream
                    remoteVideoRef.current.play();
                });
                call.on('close', () => {
                    console.log("call closed")
                    userVideo.current.srcObject = null;
                    remoteVideoRef.current.srcObject = null;
                    peerInstance.current.destroy();

                });
            }

        });
    }

    useEffect(() => {

        peer.on('open', (id) => {
            setPeerId(id)
        });

        peer.on('call', (call) => {
            let getUserMedia = navigator.getUserMedia;

            getUserMedia({ video: true, audio: true }, (mediaStream) => {
                userVideo.current.srcObject = mediaStream;
                userVideo.current.play();
                call.answer(mediaStream)
                call.on('stream', function (remoteStream) {
                    remoteVideoRef.current.srcObject = remoteStream
                    remoteVideoRef.current.play();
                });
            });
        })

        socket.on('Id', (id) => {
            console.log(id.peerId);
            setRemotePeerIdValue(id.peerId);
            guestName.current = id.name;
        })
        socket.on('quit-video', (data) => {
            setRemotePeerIdValue('');
            guestName.current = '';
            remoteVideoRef.current.srcObject = null;
            remoteVideoRef.current.pause();
            remoteVideoRef.current.load();
        })

        peer.on("close", () => {
            console.log("peer closed")
        });

        peerInstance.current = peer;
    }, [])
    useEffect(() => {
        if (userVideo.current && screen) {
            userVideo.current.srcObject.getAudioTracks()[0].enabled = audio;
        }

        if (userVideo.current && screen) {
            userVideo.current.srcObject.getVideoTracks()[0].enabled = video;
        }
    }, [audio, video])

    useEffect(() => {
        const user = document.querySelectorAll(".user-video")[1];
        const guest = document.querySelectorAll(".user-video")[0];
        if (screen) {
            if (!remotePeerIdValue) {
                guest.querySelector(" .waiting-video").classList.add("active");
                guest.querySelector(".user-name").classList.remove("active");

            } else {
                guest.querySelector(" .waiting-video").classList.remove("active");
                guest.querySelector(".user-name").classList.add("active");
            }
            call();
            user.querySelector(".user-name").classList.add("active");
        } else {
            user.classList.remove("active");
            guest.classList.remove("active");
            guest.querySelector(" .waiting-video").classList.remove("active");
            guest.querySelector(".user-name").classList.remove("active");
            user.querySelector(".user-name").classList.remove("active");

        }
    }, [remotePeerIdValue, screen])

    return (
        <div className="video-chat">
            <div className="users">
                <div className="user-video">
                    <h1 className="waiting-video">Waiting for user to Join</h1>
                    <video ref={remoteVideoRef} />
                    <h2 className="user-name">{guestName.current}</h2>
                </div>
                <div className="user-video">
                    <video ref={userVideo} muted />
                    <h2 className="user-name">{user.name}</h2>
                </div>
            </div>
            {peerId ?
                (<div className="video-buttons">
                    {screen ?
                        <>
                            <button onClick={muteVideo} className={video ? "" : "muted"}>
                                {video ? <i className="fas fa-video"></i> : <i className="fas fa-video-slash"></i>}
                            </button>
                            <button onClick={muteAudio} className={audio ? " " : "muted"}>
                                {audio ? <i className="fas fa-microphone"></i> : <i className="fas fa-microphone-slash"></i>}
                            </button>
                            <button onClick={quitVideoCall}>
                                <i className="fas fa-phone"></i>
                            </button>

                        </> :
                        <button onClick={startCall}>Start Call</button>}
                </div>) : <h1>Loading</h1>}
        </div >
    );
};

export default VideoChat;