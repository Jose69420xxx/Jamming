import React from "react";
import LandingPage from "./LandingPage";

const AuthButton = () => {
    return (
        <div>
            <button onClick={LandingPage.handleAuth} type="button">Try Now</button>
        </div>
    )
}