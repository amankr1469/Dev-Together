import { useEffect, useState, useContext } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import RoomData from './RoomData';
import { DataContext } from "./DataContext";
import Loader from "./Loader";
import { ToastContainer, toast } from "react-toastify";

const clientId = process.env.REACT_APP_CLIENT_ID;
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';


function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const { user, setUser } = useContext(DataContext);

    function loadingStart() {
        setIsLoading(true);
    }
    function loadingStop() {
        setIsLoading(false);
    }

    useEffect(() => {

        const token = localStorage.getItem('user');
        if (token) {
            loadingStart();
            axios({
                method: 'get',
                url: process.env.REACT_APP_BACKEND_URL + "users/fetch",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then((response) => {
                loadingStop();
                localStorage.setItem('user', response.data.token);
                setUser(response.data.user);
            }).catch((error) => {
                loadingStop();
                setUser(null);
                console.log("error in axios jwt call", error);
            });
        } else {

        }

    }, []);



    const onSuccess = (credentialResponse) => {
        console.log(credentialResponse)
        loadingStart();
        axios({
            method: 'post',
            url: process.env.REACT_APP_BACKEND_URL + "users/login",
            data: credentialResponse

        }).then((response) => {
            setUser(response.data.user);
            loadingStop();
            localStorage.setItem('user', response.data.token);
        }).catch((error) => {
            loadingStop();
            console.log("error in axios login call", error);
        });
    }

    function goToLogin() {
        document.getElementById("login-form").classList.add("active");
        document.getElementById("register-form").classList.remove('active');
        document.getElementById("error-message p").innerHTML = "";
        document.getElementById("error-message").classList.remove("active");
    }

    function goToRegister() {
        document.getElementById("login-form").classList.remove("active");
        document.getElementById("register-form").classList.add('active');
        document.getElementById("error-message p").innerHTML = "";
        document.getElementById("error-message").classList.remove("active");
    }

    function registerUser(e) {
        e.preventDefault();
        const passwordSame = document.getElementById("register-form").querySelector("#password").value === document.getElementById("register-form").querySelector("#passwordConfirm").value;
        if (passwordSame) {
            const data = {
                name: document.getElementById("register-form").querySelector("#name").value,
                email: document.getElementById("register-form").querySelector("#email").value,
                password: document.getElementById("register-form").querySelector("#password").value,
            }

            if (data.name === "" || data.email === "" || data.password === "") {
                showError("Please fill all the fields");
                return;
            }
            const url = process.env.REACT_APP_BACKEND_URL + "users/register"
            axios.post(url, data).then((response) => {
                console.log(response);
                setUser(response.data.user);
                localStorage.setItem('user', response.data.token);
            }).catch((error) => {
                showError(error.response.data.error);
            });
        } else {
            showError("Passwords do not match");
        }

    }

    function loginUser(e) {
        e.preventDefault();

        const data = {
            email: document.getElementById("login-form").querySelector("#email").value,
            password: document.getElementById("login-form").querySelector("#password").value,
        }

        if (data.email === "" || data.password === "") {
            showError("Please fill all the fields");
            return;
        }


        axios.post(process.env.REACT_APP_BACKEND_URL + "users/login", data).then((response) => {
            setUser(response.data.user);
            localStorage.setItem('user', response.data.token);
        }).catch((error) => {
            if (error.response.status === 400) {
                showError("Invalid  Credentials");
            }
        });
    }

    function showError(message) {
        toast.error(message);
        const box = document.querySelector(".login-register");
        box.classList.add("error");
        setTimeout(() => {
            box.classList.remove("error");
        }, 500);

        const errorMessage = document.querySelector(".login-register #error-message");
        errorMessage.children[0].innerHTML = message;
        errorMessage.classList.add("active");

        setTimeout(() => {
            errorMessage.classList.remove("active");
        }, 2500);


    }

    return (
        isLoading === true ? (<Loader />) : (
            user == null ? (
                <>
                    <div className="login-register">
                        <div id="logo-login">
                            <img src="./app-logo.png" alt="logo" />
                            <img src="./app-logo-light.png" alt="logo-light" />
                        </div>
                        <GoogleOAuthProvider clientId={clientId}>
                            <GoogleLogin id="googlelogin"
                                onSuccess={credentialResponse => {
                                    onSuccess(credentialResponse);
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                                useOneTap
                            />
                        </GoogleOAuthProvider>

                        <div id="login-form" className="active">
                            <h1>Login</h1>
                            <form onSubmit={loginUser}>
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" />
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" />
                                <input type="submit" value="Submit" />
                            </form>
                            <p>New User? <button onClick={goToRegister}>Register</button></p>

                        </div>
                        <div id="register-form">
                            <h1>Register</h1>
                            <form onSubmit={registerUser}>
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" name="name" />
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" />
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" />
                                <label htmlFor="password">Confirm Password</label>
                                <input type="password" id="passwordConfirm" name="password" />
                                <input type="submit" value="Submit" />
                            </form>
                            <p>Already have an account? <button onClick={goToLogin}>Login</button></p>

                        </div>
                        <div id="error-message" className="error">
                            <p></p>
                        </div>

                    </div>
                    <ToastContainer autoClose={2000} />
                </>
            ) : (
                <>
                    <RoomData />
                    <ToastContainer autoClose={2000} />
                </>
            ))

    );

}

export default Login;