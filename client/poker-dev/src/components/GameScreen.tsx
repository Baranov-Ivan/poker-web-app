import { observer } from "mobx-react-lite";
import { useStore } from "../store/store";
import { ControlPanel } from "./ControlPanel";

import React from "react";
import { GameScreenCanvas } from "./GameScreenCanvas";
import logo from "../assets/logo.png";

export const GameScreen = observer(() => {
    const controller = useStore("Controller");

    return (
        <>
            <img className={"logo-game"} src={logo} alt="Logo" />
            <GameScreenCanvas />
            {controller.isCurrentPlayer && <ControlPanel />}
        </>
    );
});
