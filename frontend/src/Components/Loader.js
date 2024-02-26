import { useEffect } from "react";

const Loader = () => {
    useEffect(() => {
        const loaderImg = document.querySelector("#loader #loader-front-img");
        const loaderImgLight = document.querySelector("#loader #loader-front-img-light");
        if (document.querySelector("#root").classList.contains("dark")) {
            loaderImg.style.width = document.querySelector("#loader #loader-back-img").offsetWidth + "px";
            loaderImgLight.style.width = document.querySelector("#loader #loader-back-img").offsetWidth + "px";
        } else {
            loaderImg.style.width = document.querySelector("#loader #loader-back-img-light").offsetWidth + "px";
            loaderImgLight.style.width = document.querySelector("#loader #loader-back-img-light").offsetWidth + "px";
        }
    }, []);
    return (
        <div id="loader">
            <img src="./app-logo.png" id="loader-back-img" alt="black and white "></img>
            <img src="./app-logo-light.png" id="loader-back-img-light" alt="black and white "></img>
            <div id="loader-front-image-container">
                <img src="./app-logo.png" id="loader-front-img" alt="colorful"></img>
                <img src="./app-logo-light.png" id="loader-front-img-light" alt="black and white "></img>
            </div>
        </div>
    )
}

export default Loader;