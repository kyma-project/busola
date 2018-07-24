import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  host: { class: 'sf-content' }
})
export class ResourcesComponent implements OnInit {
  limitsTabExpanded = true;
  quotasTabExpanded = false;

  constructor() {}

  ngOnInit() {}

  changeTab = tab => {
    this.limitsTabExpanded = tab === 'limits';
    this.quotasTabExpanded = !this.limitsTabExpanded;
  };
}
