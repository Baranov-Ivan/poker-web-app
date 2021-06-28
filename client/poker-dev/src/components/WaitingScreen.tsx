import {observer} from "mobx-react-lite";
import React from "react";
import {Socket} from "../store/socket";

interface WaitingScreenProps {
    socket: Socket;
}

// export const WaitingScreen = observer(() => {
//     return <>
//         <h1>Waiting for opponent...</h1>
//         <p>Your game code is {socket.gameCode}</p>
//     </>
// });

export const WaitingScreen = ({socket} : WaitingScreenProps): JSX.Element =>  {
    return <>
        <h1>Waiting for opponent...</h1>
        <p>Your game code is {socket.gameCode}</p>
    </>
}