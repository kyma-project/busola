import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {
  @Input() message: string;
  @Input() title: string;
  isActive = false;
  private okPromise: any;
  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
  }

  show(title?: string, message?: string): Promise<boolean> {
    if (title) {
      this.title = title;
    }
    if (message) {
      this.message = message;
    }
    this.isActive = true;
    return new Promise((resolve, reject) => {
      this.okPromise = resolve;
      this.changeDetector.detectChanges();
    });
  }

  cancel(event: Event) {
    this.isActive = false;
    event.stopPropagation();
      this.changeDetector.detectChanges();
  }

  ok(event: Event) {
    this.okPromise(true);
    this.isActive = false;
    event.stopPropagation();
      this.changeDetector.detectChanges();
  }
}
