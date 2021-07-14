import {observer} from "mobx-react-lite";
import {useStore} from "../store/store";
import {ControlPanel} from "./ControlPanel";

import React from "react";
import {GameScreenCanvas} from "./GameScreenCanvas";

export const GameScreen = observer(() => {
    const controller = useStore("Controller");
    const players = useStore("Players");
    const game = useStore("Game");

    return <>
        {!controller.isPlaying && controller.isFirst &&
        <h1>Prepare for game...</h1>
        }

        {controller.isPlaying &&
        <p>Table: {game.table.join(" ")}</p>
        }

        {game.currentBank > 0 &&
        <p>Bank: {game.currentBank}</p>
        }

        {game.message.length > 0 &&
        <p>{game.message}</p>
        }

        <GameScreenCanvas/>

        {/*THIS CODE BELOW WILL BE OBSOLETE AFTER COMPLETING CANVAS*/}
        <div className={"players-container"}>
            <div className={"opponent"}>
                {controller.opponentTimer && <p>Turn time: {controller.turnTime}</p>}
                <p>Opponent: {players.players[players.opponentId].name}</p>
                {players.players[players.opponentId].role &&
                <p>Role: {players.players[players.opponentId].role}</p>
                }
                <p>Stack: {players.players[players.opponentId].stack}</p>
                {players.players[players.opponentId].bet && players.players[players.opponentId].bet! >= 0 &&
                <p>Bet: {players.players[players.opponentId].bet}</p>
                }
                {players.players[players.opponentId].cards && players.players[players.opponentId].cards?.length !== 0 &&
                <p>Cards: {players.players[players.opponentId].cards![0]} {players.players[players.opponentId].cards![1]}</p>
                }
            </div>
            <div className={"player"}>
                {controller.playerTimer && <p>Turn time: {controller.turnTime}</p>}
                <p>You: {players.players[players.clientId].name}</p>
                {players.players[players.clientId].role &&
                <p>Role: {players.players[players.clientId].role}</p>
                }
                <p>Stack: {players.players[players.clientId].stack}</p>
                {players.players[players.clientId].bet && players.players[players.clientId].bet! >= 0 &&
                <p>Bet: {players.players[players.clientId].bet}</p>
                }
                {players.players[players.clientId].cards && players.players[players.clientId].cards?.length !== 0 &&
                <p>Cards: {players.players[players.clientId].cards![0]} {players.players[players.clientId].cards![1]}</p>
                }
                {controller.isCurrentPlayer && <ControlPanel/>}
            </div>
        </div>
    </>
});