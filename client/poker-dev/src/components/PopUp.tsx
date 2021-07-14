import React from "react";
import {observer} from "mobx-react-lite";
import {useStore} from "../store/store";

interface PopUpProps {
    message: string,
    type: string,
}

export const PopUp = observer(({message, type}: PopUpProps) =>  {
    const controller = useStore("Controller");

    const handleOkClick = (): void => {
        switch(type) {
            case "name":
                controller.toggleEmptyNameMessage(false);
                return;
            case "code":
                controller.toggleEmptyCodeMessage(false);
                return;
            case "players":
                controller.toggleManyPlayersMessage(false);
                return;
            case "room":
                controller.toggleWrongCodeMessage(false);
                return;
            default:
                return;
        }
    }

    return (
        <div className={"modal"}>
            <div className={"modal-content"}>
                <p>{message}</p>
                <button onClick={handleOkClick}>Ok</button>
            </div>
        </div>
    );
});