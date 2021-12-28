import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import io from 'socket.io-client'
import { environment } from 'src/environments/environment'
import { Game } from './Game'

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  private url = environment.production ? 'https://fruitescape-server.herokuapp.com' : 'http://localhost:3000'
  private socket: any

  constructor() { this.socket = io(this.url) }

  public joinLobby = (name:string, room: string): void => {
    this.socket.emit('join', {
      name: name,
      room: room
    })
  }

  public start = (): void => {
    this.socket.emit('start')
  }

  public getStartInfo = (): Observable<any> => {
    return new Observable((observer: any) => {
      this.socket.on('startinfo', (data:any) => { 
        observer.next({
          pid: data.pid,
          hostid: data.hostid
        })
      })
    })
  }

  public getGame = (): Observable<Game> => {
    return new Observable<Game>((observer: any) => {
      this.socket.on('gameState', (game: Game) => {
        observer.next(game)
      })
    })
  }

  public keyDown = (direction: string): void => { this.socket.emit('keydown', direction) }

  public keyUp = (direction: string): void => { this.socket.emit('keyup', direction) }

  




}
