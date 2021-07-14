import React, {useState} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/store";
import {PopUp} from "./PopUp";

export const HomeScreen = observer(() => {


    const controller = useStore("Controller");

    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const onCreateClick = () => {
        if(controller.checkField(name,"name")) {
            controller.handleCreateGame(name);
        };
    }

    const onJoinClick = () => {
        if(controller.checkField(name,"name")) {
            if(controller.checkField(code, "code")) {
                controller.handleJoinGame(name, code);
            };
        }
    }

    return (
        <div>
            {controller.emptyCodeMessage && <PopUp message={"Please, enter valid code"} type={"code"}/>}
            {controller.emptyNameMessage && <PopUp message={"Please, enter valid name"} type={"name"}/>}
            {controller.manyPlayersMessage && <PopUp message={"Too many players in the room!"} type={"players"}/>}
            {controller.wrongCodeMessage && <PopUp message={"Wrong game code!"} type={"room"}/>}
            <label>Name
                <input placeholder={"Your name"} onChange={event => setName(event.target.value)}></input>
            </label>
            <p></p>
            <button onClick={onCreateClick}>Create new game</button>
            <p>OR</p>
            <p>Join existing game</p>
            <input placeholder={'Code'} onChange={event => setCode(event.target.value)}></input>
            <button onClick={onJoinClick}>Join</button>
        </div>
    );
});