import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core'
import { Item } from '../Game'
import { SocketioService } from '../socketio.service'
import { Game } from '../Game'

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @Output() initGame = new EventEmitter()

  @ViewChild("backgroundCanvas")
  backgroundCanvas!: ElementRef<HTMLCanvasElement>

  public height = 0
  public width = 0

  public name:string = ''
  public room:string = ''

  public display:boolean = true

  private ctx: any

  public fruit:HTMLImageElement[] = [
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image()
  ]

  public items:Item[] = []

  public formError = {
    name: false,
    room: false
  }

  constructor(private socketService: SocketioService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.onWindowResize()
      this.items = this.getItems()
    }, 0)

    this.ctx = this.backgroundCanvas.nativeElement.getContext("2d") 
    this.ctx.globalCompositeOperation = 'source-over'
      
    setInterval(() => {
      this.render()
    }, 1000 / 60)
    // Load images
    //this.backgroundImg.src = `../../assets/background.jpeg`

    this.fruit[0].src = `../../assets/fruit/apple.png`
    this.fruit[1].src = `../../assets/fruit/blueberry.png`
    this.fruit[2].src = `../../assets/fruit/mango.png`
    this.fruit[3].src = `../../assets/fruit/watermelon.png`
    this.fruit[4].src = `../../assets/fruit/cherries.png`

  }

  render(): void {
    //console.log('Rendered')
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(0,0,this.width, this.height)

    for(let [key,item] of Object.entries(this.items)) {
      this.updateItem(key)
      this.ctx.drawImage(this.fruit[item.id], item.position.x, item.position.y, item.width, item.height)
    }
  }

  getItems() {
    let items:any = {}
    let itemCount = 25
    for(let i = 0; i < itemCount; i++) {
      let size = this.getRandomInt(30,60)
      items[i] = {
          id: this.getRandomInt(0,4),
          position: {
              x: (Math.random()*this.width) + 20,
              y: Math.random()*-200
          },
          speed: this.getRandomInt(1,4),
          width: size,
          height: size
      }
    }
    return items
  }

  updateItem(key:any): void {
    this.items[key].position.y += this.items[key].speed
    if(this.items[key].position.y > this.height) {
      this.items[key].position.x = (Math.random()*this.width)+20
      this.items[key].position.y = Math.random()*-200
    }
  }

  getRandomInt(min:number, max:number):number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  createNewLobby():void {
    this.checkNameError()
    if(!this.formError.name) {
      const room = Math.random().toString(36).substr(2, 5)
      this.display = false
      this.initGame.emit({
        name: this.name,
        room: room
      })
    }
  }

  joinLobby(): void {
    this.checkAllErrors()
    if(!this.formError.name && !this.formError.room) {
      this.display = false
      this.initGame.emit({
        name: this.name,
        room: this.room
      })
    }
  }

  checkAllErrors(): void {
    this.checkNameError()
    this.checkRoomError()
  }

  checkNameError(): void {
    this.formError.name = this.name.length > 0 ? false : true
  }

  checkRoomError(): void {
    this.formError.room = this.room.length > 0 ? false : true
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
  }

}
