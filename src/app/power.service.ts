import {Injectable} from '@angular/core';
import {ApiService} from '../api.service';
import {BehaviorSubject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

export interface Power {
  id: string;
  power: number;
  timestamp: object;
  name?: string;
}


@Injectable({providedIn: 'root'})
export class PowerService {
  location_power = new BehaviorSubject<Power[]>([]);
  total_power = new BehaviorSubject<Power>({id: '-', power: 0, timestamp: new Date()});

  constructor(private api: ApiService) {
    this.updatePower();
    setInterval(this.updatePower, 10000);
  }

  private updatePower = () => {
    this.api.get('https://api.staging-okapifordevelopers.nl/energy/readout/monitor', true).subscribe((value) => {
      if (value instanceof Array) {
        const per_location = [] as Power[];
        for (const i of value) {
          i.power = i.power / 1000000;
          if (i.id !== 'total') {
            per_location.push(i);
          } else {
            this.total_power.next(i);
          }
        }
        this.location_power.next(per_location);
      } else if (value instanceof HttpErrorResponse) {
        this.location_power.error('Unable to fetch location power: ' + value);
        this.total_power.error('Unable to fetch total power: ' + value);
      }
    });
  };
}
