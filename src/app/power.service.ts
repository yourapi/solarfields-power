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
    } else {
      _factor = 1000000000;
      this.unit = 'GW';
    }
    this.value = power / _factor;
  }
}


class EnergyValue {
  public unit: string;
  public value: number;

  constructor(private energy: number) {
    if (!energy) {
      this.unit = 'kWh';
      this.value = 0;
      return;
    }

    let _factor;
    if (energy < 1000) {
      _factor = 1;
      this.unit = 'kWh';
    } else if (energy < 1000000) {
      _factor = 1000;
      this.unit = 'MWh';
    } else if (energy < 1000000000) {
      _factor = 1000000;
      this.unit = 'GWh';
    } else {
      _factor = 1000000000;
      this.unit = 'TWh';
    }
    this.value = energy / _factor;
  }
}


class Co2Value {
  public unit: string;
  public value: number;

  constructor(private co2_value: number) {
    if (!co2_value) {
      this.unit = 'kg';
      this.value = 0;
      return;
    }

    let _factor;
    if (co2_value < 1000) {
      _factor = 1;
      this.unit = 'kg';
    } else if (co2_value < 1000000) {
      _factor = 1000;
      this.unit = 'Ton';
    } else {
      _factor = 1000000;
      this.unit = 'kTon';
    }
    this.value = co2_value / _factor;
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
  call_pending = 0;
  awaiting_data = new  BehaviorSubject<boolean>(true);
  location_power = new BehaviorSubject<Power[]>([]);
  totals = new BehaviorSubject<Power>({
    id: '-', power: new PowerValue(0), energy_day: new EnergyValue(0),
    energy_total: new EnergyValue(0), co2_total: new Co2Value(0), timestamp: new Date()
  });

  constructor(private api: ApiService) {
    this.updatePower();
    setInterval(this.updatePower, 10000);
  }

  private updatePower = () => {
    if ((this.call_pending === 0) || ((new Date().getTime() - 60 * 1000) > this.call_pending)) {
      this.call_pending = new Date().getTime();
      this.api.get('https://api.staging-okapifordevelopers.nl/energy/readout/monitor', true).subscribe((value) => {
        if (value instanceof Array) {
          const per_location = [] as Power[];
          for (const i of value) {
            i.power = new PowerValue(i.power);
            i.energy_day = new EnergyValue(i.energy_day);
            i.energy_total = new EnergyValue(i.energy_total);
            i.co2_total = new Co2Value(i.co2_total);
            i.co2_day = new Co2Value(i.co2_day);
            if (i.id !== 'total') {
              per_location.push(i);
            } else {
              this.totals.next(i);
            }
          }
          per_location.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
          this.location_power.next(per_location);
          this.call_pending = 0;
          this.awaiting_data.next(false);
        } else if (value instanceof HttpErrorResponse) {
          this.location_power.error('Unable to fetch location power: ' + value);
          this.totals.error('Unable to fetch total power: ' + value);
        }
      });
    }
  }
}
