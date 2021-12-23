import { Component, Input } from '@angular/core';
import { State } from './state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @Input() state:State = State.HOME

  get State() { return State }

  play() {
    this.state = State.GAME 
  }


}
