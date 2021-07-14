import {CARD_POOL, CARD_POOL_LENGTH} from "./constants";

export function makeId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function getKeysByValue(object: {[index: string]: any} , value: string): string[] {
    return Object.keys(object).filter(key => object[key] === value);
}

export function pickCards(cardsInPlay: string[], numOfCards: number): string[] {
    const cards: string[] = [];
    while(cards.length !== numOfCards) {
        const ind = getRandomInt(0, CARD_POOL_LENGTH);
        if(cardsInPlay.includes(CARD_POOL[ind]) === false && cards.includes(CARD_POOL[ind]) === false) {
            cards.push(CARD_POOL[ind]);
        }
    }
    return cards;
};

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function makeAPIurl(table: string, playersCards: string[]): string {
    return "https://api.pokerapi.dev/v1/winner/texas_holdem?cc=" + table + "&pc[]=" + playersCards[1] + "&pc[]=" + playersCards[0];
}