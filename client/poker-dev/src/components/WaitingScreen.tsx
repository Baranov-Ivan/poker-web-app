import React from "react";
import { Controller } from "../store/controller";

interface WaitingScreenProps {
    controller: Controller;
}

export const WaitingScreen = ({
    controller,
}: WaitingScreenProps): JSX.Element => {
    return (
        <div className={"waiting-wrapper"}>
            <p>Waiting for opponent...</p>
            <p>
                Your game code is{" "}
                <span className={"gamecode"}>{controller.gameCode}</span>
            </p>
        </div>
    );
};
