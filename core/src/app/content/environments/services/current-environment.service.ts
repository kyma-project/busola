import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class CurrentEnvironmentService implements OnDestroy {
  private currentEnvId = new ReplaySubject<string>(1);

  public getCurrentEnvironmentId(): ReplaySubject<string> {
    return this.currentEnvId;
  }

  public setCurrentEnvironmentId(newEnvId) {
    this.currentEnvId.next(newEnvId);
  }

  ngOnDestroy() {
    this.currentEnvId.complete();
  }
}
