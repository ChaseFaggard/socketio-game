import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core'
import { environment } from 'src/environments/environment'
import io from 'socket.io-client'
import { Game, Player } from '../Game'
import { SocketioService } from '../socketio.service'

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {

  @ViewChild("game")
  gameCanvas!: ElementRef<HTMLCanvasElement>

  public gameJoined = false

  private socket: any
  private ctx: any

  private pid:string = ''
  private hostid: string = ''

  public name:string = ''
  public room:string = ''
  public roomCount: number = 0
  public started:boolean = false
  public gameOver:boolean = false

  public rightPressed:boolean = false
  public leftPressed:boolean = false
  public upPressed:boolean = false
  public downPressed:boolean = false

  public backgroundImg = new Image()
  public showCopy: boolean = false

  public fruit:HTMLImageElement[] = [
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image()
  ]

  public height = 0
  public width = 0

  constructor(private socketService: SocketioService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void { 
    //Load canvas
    this.ctx = this.gameCanvas.nativeElement.getContext("2d") 
    // Load images
    //this.backgroundImg.src = `../../assets/background.jpeg`

    this.fruit[0].src = `../../assets/fruit/apple.png`
    this.fruit[1].src = `../../assets/fruit/blueberry.png`
    this.fruit[2].src = `../../assets/fruit/mango.png`
    this.fruit[3].src = `../../assets/fruit/watermelon.png`
    this.fruit[4].src = `../../assets/fruit/cherries.png`
  }

  startGame(): void { 
    if(this.roomCount > 1) this.socketService.start()
  }

  isHost(): boolean { return this.pid == this.hostid }

  // Initalize game 
  init(event:any): void {

    this.gameJoined = true

    this.name = event.name
    this.room = event.room

    this.socketService.joinLobby(this.name, this.room)

    this.socketService.getStartInfo().subscribe((data: any) => {
      this.pid = data.pid
      this.hostid = data.hostid
    })

    this.socketService.getGame().subscribe((game: Game) => {
      console.log(game)
      this.roomCount = game.playerCount
      this.height = game.height
      this.width = game.width
      this.started = game.started
      this.gameOver = game.gameOver
      this.hostid = game.host
      this.ctx.globalCompositeOperation = 'source-over'
      
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(0,0,game.width, game.height)
      //this.ctx.drawImage(this.backgroundImg, 0, 0, game.width, game.height)

      // Render alive players (Alive items are drawn)
      for(let [key,p] of Object.entries(game.players)) {
        if(!p.alive) this.drawPlayer(key, p, game)
      }

      // Render items
      for(let item of Object.values(game.items)) {
        this.ctx.drawImage(this.fruit[item.id], item.position.x, item.position.y, item.width, item.height)
      }

      // Render alive players (Alive items are drawn)
      for(let [key,p] of Object.entries(game.players)) {
        if(p.alive) this.drawPlayer(key, p, game)
      }

      // Draw text
      if(game.started) {
        let timeElapsed = Math.round((new Date().getTime() - game.startTimestamp) / 1000) // In seconds
        if(timeElapsed < game.countDown) {
          let startText = (3-timeElapsed).toString()
          this.ctx.fillStyle = 'red'
          this.ctx.font = "150px Arial";
          this.ctx.textAlign = 'center'
          this.ctx.fillText(startText, game.width/2, game.height/2)
        }
        else if(!game.gameOver) {
          this.ctx.fillStyle = 'green'
          this.ctx.textAlign = 'left'
          this.ctx.fillText('Time elapsed: ' + (timeElapsed-3) + 's', 10, 30)
        }
        else {
          this.ctx.font = "60px Arial";
          this.ctx.textAlign = 'center'
          this.ctx.fillStyle = 'red'
          this.ctx.fillText(`Game Over`, game.width/2, game.height/2 - 40)
          this.ctx.font = "35px Arial"
          this.ctx.fillStyle = 'green'
          this.ctx.fillText(`${game.players[<any>game.winner].name} wins`, game.width/2, game.height/2 + 40)
        }
      }
    })

  }

  drawPlayer = (key:string, player:Player, game:Game) => {
    // Draw cirlce player
    this.ctx.beginPath()   
    this.ctx.fillStyle = player.alive ? player.color : '#D3D3D3'
    this.ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI*2)
    this.ctx.fill()

    // Draw player name
    this.ctx.font = "13px Arial";
    this.ctx.textAlign = 'center'
    if(!player.alive) this.ctx.fillStyle = '#D3D3D3'
    else if(this.pid == game.host && this.pid == key) this.ctx.fillStyle = 'purple'
    else if(this.pid == key) this.ctx.fillStyle = 'blue'
    else this.ctx.fillStyle = 'green'
    this.ctx.fillText(player.name, player.position.x, player.position.y-player.radius-4)
  }

  @HostListener('window:keydown', (['$event']))
  move(e: KeyboardEvent) {
    if(this.gameJoined) {
      const direction = this.getDirectionFromKey(e.key)
      if(direction) { this.socketService.keyDown(direction) }
    } 
  }

  @HostListener('window:keyup', (['$event']))
  stop(e: KeyboardEvent) {
    if(this.gameJoined) {
      const direction = this.getDirectionFromKey(e.key)
      if(direction) { this.socketService.keyUp(direction) }
    } 
  }

  getDirectionFromKey(key: string): string {
    switch(key) {
      case 'A':
      case 'a':
      case 'ArrowLeft':
        return 'left'
      case 'D':
      case 'd':
      case 'ArrowRight':
        return 'right'
      case 'W':
      case 'w':
      case 'ArrowUp':
        return 'up'
      case 'S':
      case 's':
      case 'ArrowDown':
        return 'down'
      default: 
        return ''
    }
  }

  /* Copys text to clipboard */
  copy(str: string): void {
    let listener = (e: ClipboardEvent) => {
      e.clipboardData!.setData('text/plain', (str));
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);

    this.showCopy = true
    setTimeout(() => {
      this.showCopy = false
    }, 700)
  }

}
