import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @Output() initGame = new EventEmitter()

  public name:string = ''
  public room:string = ''

  public display:boolean = true

  public formError = {
    name: false,
    room: false
  }

  constructor() { }

  ngOnInit(): void { }

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

}
