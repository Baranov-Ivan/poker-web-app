import { observer } from "mobx-react-lite";
import { useStore } from "../store/store";
import { debounce } from "lodash";
import React, { useState } from "react";

export const ControlPanel = observer(() => {
    const controller = useStore("Controller");

    const [raiseValue, setRaise] = useState(
        controller.actions.raiseMinLim
            ? controller.actions.raiseMinLim.toString()
            : "0"
    );

    const handleRaiseChange = React.useCallback(
        debounce((event: React.ChangeEvent<HTMLInputElement>) => {
            if (parseInt(event.target.value) < controller.actions.raiseMinLim) {
                event.target.value = controller.actions.raiseMinLim.toString();
            }
            if (parseInt(event.target.value) > controller.actions.raiseMaxLim) {
                event.target.value = controller.actions.raiseMaxLim.toString();
            }
            setRaise(event.target.value);
        }, 500),
        []
    );

    const onRaiseClick = () => {
        controller.setRaiseValue(raiseValue);
        controller.handleRaiseClick();
    };

    return (
        <div className={"buttons-wrapper"}>
            {controller.actions.fold && (
                <button
                    className={"control-btn"}
                    onClick={controller.handleFoldClick.bind(controller)}
                >
                    Fold
                </button>
            )}
            {controller.actions.check && (
                <button
                    className={"control-btn"}
                    onClick={controller.handleCheckClick.bind(controller)}
                >
                    Check
                </button>
            )}
            {controller.actions.call && (
                <button
                    className={"control-btn"}
                    onClick={controller.handleCallClick.bind(controller)}
                >
                    Call
                </button>
            )}
            {controller.actions.allin && (
                <button
                    className={"control-btn"}
                    onClick={controller.handleAllinClick.bind(controller)}
                >
                    All-in
                </button>
            )}
            {controller.actions.raise && (
                <div className={"raise-form"}>
                    <button
                        className={"control-btn"}
                        onClick={() => onRaiseClick()}
                    >
                        {controller.actions.raiseMinLim < 2 ? "Bet" : "Raise"}
                    </button>
                    <input
                        className={"raise-input"}
                        type={"number"}
                        defaultValue={raiseValue}
                        onChange={handleRaiseChange}
                    />
                </div>
            )}
        </div>
    );
});
