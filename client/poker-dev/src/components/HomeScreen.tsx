import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/store";
import { PopUp } from "./PopUp";
import logo from "../assets/logo.png";

export const HomeScreen = observer(() => {
    const controller = useStore("Controller");

    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const onCreateClick = () => {
        if (controller.checkField(name, "name")) {
            controller.handleCreateGame(name);
        }
    };

    const onJoinClick = () => {
        if (controller.checkField(name, "name")) {
            if (controller.checkField(code, "code")) {
                controller.handleJoinGame(name, code);
            }
        }
    };

    return (
        <div>
            {controller.emptyCodeMessage && (
                <PopUp message={"Please, enter valid code"} type={"code"} />
            )}
            {controller.emptyNameMessage && (
                <PopUp message={"Please, enter valid name"} type={"name"} />
            )}
            {controller.manyPlayersMessage && (
                <PopUp
                    message={"Too many players in the room!"}
                    type={"players"}
                />
            )}
            {controller.wrongCodeMessage && (
                <PopUp message={"Wrong game code!"} type={"room"} />
            )}
            <img className={"logo-home"} src={logo} alt="Logo" />
            <div className={"create-form"}>
                <p className={"text-home"}>Create new game</p>
                <input
                    className={"input-home"}
                    placeholder={"Your name"}
                    onChange={(event) => setName(event.target.value)}
                ></input>
                <button className={"home-btn"} onClick={onCreateClick}>
                    Create
                </button>
            </div>
            <div className={"join-form"}>
                <p className={"text-home"}>Join existing game</p>
                <input
                    className={"input-home"}
                    placeholder={"Code"}
                    onChange={(event) => setCode(event.target.value)}
                ></input>
                <button className={"home-btn"} onClick={onJoinClick}>
                    Join
                </button>
            </div>
        </div>
    );
});
