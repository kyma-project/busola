import { AppConfig } from './../../../app.config';
import { Component, OnInit } from '@angular/core';
import { EnvironmentsService } from '../services/environments.service';
import { ActivatedRoute } from '@angular/router';
import { InstancesContainerComponent } from '../instances-container/instances-container.component';

@Component({
  selector: 'app-catalog-container',
  templateUrl: '../instances-container/instances-container.component.html',
  styleUrls: ['../instances-container/instances-container.component.scss']
})
export class CatalogContainerComponent extends InstancesContainerComponent
  implements OnInit {
  public data: object = {};

  constructor(
    private environmentsService: EnvironmentsService,
    route: ActivatedRoute
  ) {
    super(route);
    this.externalUrl = AppConfig.serviceCatalogModuleUrl;
  }

  public ngOnInit() {
    this.environmentsService.getEnvironments().subscribe(
      environments => {
        this.data = {
          environments
        };
        this.executionAsync = false;
      },
      err => console.log(err)
    );
  }
}
