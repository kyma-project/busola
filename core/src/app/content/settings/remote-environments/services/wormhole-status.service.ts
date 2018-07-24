import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class WormholeStatusService {

  constructor() { }

  getConnectionLatency(name: string): Observable<number> {
    return Observable.of(Math.floor(Math.random() * 101) + 100).delay(300);
  }
}
