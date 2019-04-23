import {Component} from '@angular/core';
import {PowerService, Power} from './power.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  public totals: Power;
  public per_location = this.power.location_power;

  constructor(private power: PowerService) {
    power.totals.subscribe((value) => {
      this.totals = value;
    });
  }

}
