import {observer} from "mobx-react-lite";
import {useStore} from "../store/store";
import React from "react";


export const ControlPanel = observer(() => {
    const socket = useStore("Socket");

    const onFoldClick = () => {
        socket.handleFoldClick();
    }

    const onCallClick = () => {
        socket.handleCallClick();
    }

    return <div>
        {socket.actions.fold && <button onClick={onFoldClick}>Fold</button>}
        {socket.actions.check && <button>Check</button>}
        {socket.actions.call && <button onClick={onCallClick}>Call</button>}
        {socket.actions.allin && <button>All-in</button>}
        {socket.actions.raise && <div><button>Raise</button><input type={"number"}/></div>}
    </div>
});