import {observer} from "mobx-react-lite";
import {useStore} from "../store/store";
import {ControlPanel} from "./ControlPanel";

export const GameScreen = observer(() => {
    const socket = useStore("Socket");

    return <>
        {socket.isPlaying === false && socket.isFirst &&
            <h1>Prepare for game...</h1>
        }

        {socket.isPlaying &&
            <p>Table: {socket.table.join(" ")}</p>
        }

        {socket.currentBank > 0 &&
            <p>Bank: {socket.currentBank}</p>
        }

        {socket.message.length > 0 &&
            <p>{socket.message}</p>
        }
        <div className={"players-container"}>
            <div className={"opponent"}>
                {socket.opponentTimer && <p>Turn time: {socket.turnTime}</p>}
                <p>Opponent: {socket.opponent.name}</p>
                {socket.opponent.role &&
                    <p>Role: {socket.opponent.role}</p>
                }
                <p>Stack: {socket.opponent.stack}</p>
                {socket.opponent.bet && socket.opponent.bet > 0 &&
                    <p>Bet: {socket.opponent.bet}</p>
                }
                {socket.opponent.cards && socket.opponent.cards.length !== 0 &&
                    <p>Cards: {socket.opponent.cards[0]} {socket.opponent.cards[1]}</p>
                }
            </div>
            <div className={"player"}>
                {socket.playerTimer && <p>Turn time: {socket.turnTime}</p>}
                <p>You: {socket.player.name}</p>
                {socket.player.role &&
                    <p>Role: {socket.player.role}</p>
                }
                <p>Stack: {socket.player.stack}</p>
                {socket.player.bet && socket.player.bet > 0 &&
                    <p>Bet: {socket.player.bet}</p>
                }
                {socket.player.cards && socket.player.cards.length !== 0 &&
                    <p>Cards: {socket.player.cards[0]} {socket.player.cards[1]}</p>
                }
                {socket.isCurrentPlayer && <ControlPanel/>}
            </div>
        </div>
    </>
});