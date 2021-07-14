import React from "react";
import {Controller} from "../store/controller";


interface WaitingScreenProps {
    controller: Controller;
}

export const WaitingScreen = ({controller} : WaitingScreenProps): JSX.Element =>  {
    return <>
        <h1>Waiting for opponent...</h1>
        <p>Your game code is {controller.gameCode}</p>
    </>
}