import {observer} from "mobx-react-lite";
import {useStore} from "../store/store";
import { debounce } from "lodash";
import React, {useState} from "react";

export const ControlPanel = observer(() => {
    const controller = useStore("Controller");

    const [raiseValue, setRaise] = useState(controller.actions.raiseMinLim ? controller.actions.raiseMinLim.toString() : "0");

    const handleRaiseChange = React.useCallback(debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        if(parseInt(event.target.value) < controller.actions.raiseMinLim) {
            event.target.value = controller.actions.raiseMinLim.toString();
        }
        if(parseInt(event.target.value) > controller.actions.raiseMaxLim) {
            event.target.value = controller.actions.raiseMaxLim.toString();
        }
        setRaise(event.target.value);
    },500),[]);

    const onRaiseClick = () => {
        controller.setRaiseValue(raiseValue);
        controller.handleRaiseClick();
    };

    return <div>
        {controller.actions.fold && <button onClick={controller.handleFoldClick.bind(controller)}>Fold</button>}
        {controller.actions.check && <button onClick={controller.handleCheckClick.bind(controller)}>Check</button>}
        {controller.actions.call && <button onClick={controller.handleCallClick.bind(controller)}>Call</button>}
        {controller.actions.allin && <button onClick={controller.handleAllinClick.bind(controller)}>All-in</button>}
        {controller.actions.raise && <div><button onClick={() => onRaiseClick()}>Raise</button><input type={"number"} defaultValue={raiseValue} onChange={handleRaiseChange}/></div>}
    </div>
});