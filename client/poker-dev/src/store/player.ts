import {action, makeAutoObservable} from "mobx";

export class Player {
    name = "";

    constructor() {
        makeAutoObservable(this, {
            showName: action.bound,
            handleStoreNameChange: action.bound,
        });
    }


    showName(): void {
        if(this.name.length === 0) {
            alert("Please, enter valid name!");
            return;
        } else {
            console.log(this.name);
        }
    }

    handleStoreNameChange(name: string): void {
        this.name = name;
    }
}