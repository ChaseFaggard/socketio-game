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

  public asyncEmit = (eventName: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.socket.emit(eventName, data)
      this.socket.on(eventName, (result: any) => {
        this.socket.off(eventName)
        resolve(result)
      })

      /* If something went wrong with the promise */
      setTimeout(() => {
        reject(new Error("Server responded too slow... it might be down or lagging behind"))
      }, 1000)
    })
  }

  public hasRoom = async (room: string): Promise<boolean> => {
    const hasRoom:boolean = await this.asyncEmit('hasroom', room)
    return hasRoom
  }

  public getLatency = async (): Promise<number> => {
    const startTime = new Date().getTime()
    await this.asyncEmit('ping', null)
    return new Date().getTime() - startTime
  }

}
