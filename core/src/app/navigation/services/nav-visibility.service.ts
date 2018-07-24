import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class NavVisibilityService {
  public visibilityStateEmitter$: EventEmitter<boolean>;
  private visibilityState: boolean;

  constructor() {
    this.visibilityStateEmitter$ = new EventEmitter();
    this.visibilityState = false;
  }

  public toggleVisibility(): void {
    this.visibilityState = !this.visibilityState;
    this.visibilityStateEmitter$.emit(this.visibilityState);
  }
}
