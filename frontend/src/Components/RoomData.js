import React, { useContext, useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataContext } from "./DataContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from "./Loader";
import { generateFromString } from 'generate-avatar';

const override = {
    display: 'block',
    margin: '0 auto',
    borderColor: 'red',
};

const RoomData = () => {
    const { user, setCurrRoom, setUser } = useContext(DataContext);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    function loadingStart() {
        setIsLoading(true);
    }
    function loadingStop() {
        setIsLoading(false);
    }

    useEffect(() => {

        toast.success(`Welcome to CodeCast ${user.name}`, {
            position: toast.POSITION.TOP_RIGHT
        });

    }, [])


    const getData = async (item) => {
        loadingStart();
        await axios.get(`${process.env.REACT_APP_BACKEND_URL + "rooms/fetch"}?id=${item.roomid}`
            , {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('user')}`
                }
            }).then((response) => {
                setCurrRoom(response.data);
                loadingStop();
                navigate('/room');
            })
            .catch((error) => {
                loadingStop();
                toast.error('Error Fetching Room', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    const createRoom = async () => {
        let roomName = document.getElementById('roomName').value;
        loadingStart();
        axios({
            method: 'post',
            url: process.env.REACT_APP_BACKEND_URL + 'rooms/create',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`
            },
            data: {
                name: roomName
            }

        })
            .then((response) => {
                setCurrRoom(response.data);
                loadingStop();
                navigate('/room');
            })
            .catch((error) => {
                loadingStop();
                toast.error('Error Creating Room', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    const joinRoom = async () => {
        let roomID = document.getElementById('roomID').value;
        loadingStart();
        axios({
            method: 'get',
            url: process.env.REACT_APP_BACKEND_URL + `rooms/fetch?id=${roomID}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`

            }
        })
            .then((response) => {
                setCurrRoom(response.data);
                loadingStop();
                navigate('/room');
            })
            .catch((error) => {
                loadingStop();
                toast.error('Room not found', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const deleteData = (item) => async () => {
        loadingStart();
        axios({
            method: 'delete',
            url: process.env.REACT_APP_BACKEND_URL + `rooms/delete`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('user')}`
            },
            data: {
                id: item._id
            }
        })
            .then((response) => {
                user.rooms = user.rooms.filter((item) => item._id !== response.data._id);
                loadingStop();
                toast.success('Room Deleted', {
                    position: toast.POSITION.TOP_RIGHT
                });
            })
            .catch((error) => {
                loadingStop();
                toast.error('Error Deleting Room', {
                    position: toast.POSITION.TOP_RIGHT
                });
                console.log(error)
            });
    }

    const copyRoomId = (e) => {
        const id = e.target.innerText;
        navigator.clipboard.writeText(id);
        toast.success('Room ID Copied ', {
            position: toast.POSITION.TOP_RIGHT
        });
    }

    useEffect(() => {

        if (user && !user.rooms.every(room => !room.updatedAt.includes("T"))) {
            user.rooms.forEach((item) => {
                let temp = item.updatedAt.replace('T', ' ').split(":");
                temp.pop();
                item.updatedAt = temp.join(":")
            })
            user.rooms.sort((a, b) => {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            })

            setUser({ ...user })
        }

        if (user) {
            document.querySelectorAll(".join-room input").forEach(input => {
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter")
                        e.target.nextElementSibling.click();
                })
            })
        }

    }, [user])

    return (
        isLoading ? (<Loader />) :
            (<div className="room-data">
                <button onClick={logout} className="logOut">Logout</button>
                <div className="userData">
                    {user.avatar ?
                        <img src={user.avatar} height={100} alt='user profile' />
                        : <img height={100} src={`data:image/svg+xml;utf8,${generateFromString(user.email + user.name)}`} alt="user profile" />
                    }
                    <h1>Welcome {user.name}</h1>
                </div>
                <div className="join-room">
                    <input id="roomName" placeholder="Enter Room Name" />
                    <button onClick={createRoom} >Create Room</button>
                    <input id="roomID" placeholder="Enter Room ID to join" />
                    <button onClick={joinRoom} >Join Room</button>
                </div>
                <table sx={{ minWidth: 650 }} aria-label="simple table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th align="right">Room ID</th>
                            <th align="right">Language</th>
                            <th align="right">Last Used</th>
                            <th align="right">Join Room</th>
                            <th align="right">Delete Room</th>
                        </tr>
                    </thead>
                    <tbody>

                        {user.rooms.map((item, index) => (
                            <tr key={index}>
                                <td component="th" scope="row">{item.name}</td>
                                <td align="right" onClick={copyRoomId}>{item.roomid}</td>
                                <td align="right">{item.language}</td>
                                <td align="right">{item.updatedAt}</td>
                                <td align="right">
                                    <button className="join-btn" onClick={() => getData(item)}>Join Room</button>
                                </td>
                                <td align="right">
                                    <button className="delete-btn" onClick={deleteData(item)}>Delete Room</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )

    )
}


export default RoomData;