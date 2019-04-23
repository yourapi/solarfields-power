import {Injectable} from '@angular/core';
import {ApiService} from '../api.service';
import {BehaviorSubject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';


class PowerValue {
  public unit: string;
  public value: number;

  constructor(private power: number) {
    if (!power) {
      this.unit = 'W';
      this.value = 0;
      return;
    }

    let _factor;
    if (power < 5000) {
      _factor = 1;
      this.unit = 'W';
    } else if (power < 1000000) {
      _factor = 1000;
      this.unit = 'kW';
    } else if (power < 1000000000) {
      _factor = 1000000;
      this.unit = 'MW';
    }
    this.value = power / _factor;
  }
}


class EnergyValue {
  public unit: string;
  public value: number;

  constructor(private energy: number) {
    if (!energy) {
      this.unit = 'Wh';
      this.value = 0;
      return;
    }

    let _factor;
    if (energy < 1000) {
      _factor = 1;
      this.unit = 'Wh';
    } else if (energy < 1000000) {
      _factor = 1000;
      this.unit = 'kWh';
    } else if (energy < 1000000000) {
      _factor = 1000000;
      this.unit = 'MWh';
    } else if (energy < 1000000000000) {
      _factor = 1000000000;
      this.unit = 'GWh';
    }
    this.value = energy / _factor;
  }
}


class Co2Value {
  public unit: string;
  public value: number;

  constructor(private co2: number) {
    if (!co2) {
      this.unit = 'kg';
      this.value = 0;
      return;
    }

    let _factor;
    if (co2 < 1000) {
      _factor = 1;
      this.unit = 'kg';
    } else if (co2 < 1000000) {
      _factor = 1000;
      this.unit = 'Ton';
    }
    this.value = co2 / _factor;
  }
}


export interface Power {
  id: string;
  power: PowerValue;
  energy_day?: EnergyValue;
  energy_total?: EnergyValue;
  co2_total?: Co2Value;
  timestamp: object;
  name?: string;
}


@Injectable({providedIn: 'root'})
export class PowerService {
  location_power = new BehaviorSubject<Power[]>([]);
  total_power = new BehaviorSubject<Power>({id: '-', power: new PowerValue(0), timestamp: new Date()});

  constructor(private api: ApiService) {
    this.updatePower();
    setInterval(this.updatePower, 10000);
  }

  private updatePower = () => {
    this.api.get('https://api.staging-okapifordevelopers.nl/energy/readout/monitor', true).subscribe((value) => {
      if (value instanceof Array) {
        const per_location = [] as Power[];
        for (const i of value) {
          i.power = new PowerValue(i.power);
          i.energy_day = new EnergyValue(i.energy_day);
          i.energy_total = new EnergyValue(i.energy_total);
          i.co2_total = new Co2Value(i.co2_total);
          if (i.id !== 'total') {
            per_location.push(i);
          } else {
            this.total_power.next(i);
          }
        }
        per_location.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        this.location_power.next(per_location);
      } else if (value instanceof HttpErrorResponse) {
        this.location_power.error('Unable to fetch location power: ' + value);
        this.total_power.error('Unable to fetch total power: ' + value);
      }
    });
  };
}
