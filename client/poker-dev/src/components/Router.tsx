import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/store";
import { Page } from "../types/types";
import { HomeScreen } from "./HomeScreen";
import { WaitingScreen } from "./WaitingScreen";
import { GameScreen } from "./GameScreen";
import { GameOverScreen } from "./GameOverScreen";

export const Router = observer(() => {
    const controller = useStore("Controller");
    const game = useStore("Game");

    if (controller.currentPage === Page.Home) {
        return <HomeScreen />;
    } else if (controller.currentPage === Page.Wait) {
        return <WaitingScreen controller={controller} />;
    } else if (controller.currentPage === Page.Game) {
        return <GameScreen />;
    } else if (controller.currentPage === Page.Gameover) {
        return <GameOverScreen message={game.message} />;
    }

    return <h1>Unknown state</h1>;
});
