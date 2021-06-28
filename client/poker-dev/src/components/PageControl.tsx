import React from "react";
import {observer} from "mobx-react-lite";
import {useStore} from "../store/store";
import {Page} from "../modules/types";
import {HomeScreen} from "./HomeScreen";
import {WaitingScreen} from "./WaitingScreen";

export const PageControl = observer(() => {
    const socket = useStore("Socket");

    console.log(socket);
    if(socket.currentPage === Page.Home) {
        return <HomeScreen/>;
    } else if(socket.currentPage === Page.Wait) {
        // return <>
        //     <h1>Waiting for opponent...</h1>
        //     <p>Your game code is {socket.gameCode}</p>
        // </>
        return <WaitingScreen socket={socket}/>

    } else if(socket.currentPage === Page.Game) {

    }
    return <h1>Unknown state</h1>;
});