export type Position = {
    x: number
    y: number
}

export type MovingObject = {
    position: Position
    speed: number
}

export interface Player extends MovingObject {
    name: string
    color: string
    radius: number
    alive: boolean
}

export interface Item extends MovingObject {
    id: number,
    width: number,
    height: number
}

export interface Game {
    host: string
    players: Player[]
    playerCount: number
    items: Item[]
    width: number
    height: number
    started: boolean,
    startTimestamp: number,
    countDown: number,
    gameOver: boolean,
    winner: string
}