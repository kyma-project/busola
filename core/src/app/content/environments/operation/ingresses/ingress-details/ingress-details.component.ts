import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AppConfig } from '../../../../../app.config';
import { ComponentCommunicationService } from '../../../../../shared/services/component-communication.service';
import { CurrentEnvironmentService } from '../../../../environments/services/current-environment.service';

@Component({
  selector: 'app-ingress-details',
  styleUrls: ['./ingress-details.component.scss'],
  templateUrl: './ingress-details.component.html'
})
export class IngressDetailsComponent implements OnInit, OnDestroy {
  public loading = true;
  public loadingToEdit = true;
  public currentEnvironmentId = '';
  public ingressName: string;
  public ingressDetails: any;
  public ingressDetailsToEdit: any;
  public ingressDetailsUrl: string;
  public ingressDetailsUrlToEdit: string;
  public errorMessage: string;
  private currentEnvironmentSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private currentEnvironmentService: CurrentEnvironmentService,
    private router: Router,
    private route: ActivatedRoute,
    private communicationService: ComponentCommunicationService
  ) {
    this.subscribeToRefreshComponent();
  }

  public ngOnInit() {
    this.currentEnvironmentSubscription = this.currentEnvironmentService
      .getCurrentEnvironmentId()
      .subscribe(envId => {
        this.currentEnvironmentId = envId;
        this.route.params.subscribe(params => {
          this.ingressName = params['name'];
          this.prepareUrl();
          this.fetchIngressDetails(this.ingressDetailsUrl);
        });
      });
  }

  public prepareUrl() {
    this.ingressDetailsUrl = `${AppConfig.k8sDashboardApiUrl}ingress/${
      this.currentEnvironmentId
    }/${this.ingressName}`;
    this.ingressDetailsUrlToEdit = `${
      AppConfig.k8sApiServerUrl_extensions
    }namespaces/${this.currentEnvironmentId}/ingresses/${this.ingressName}`;
  }

  public fetchIngressDetails(url) {
    this.http.get<any>(url).subscribe(
      res => {
        this.ingressDetails = res;
        this.loading = false;
        this.fetchIngressDetailsToEdit(this.ingressDetailsUrlToEdit);
      },
      err => {
        if (err.status === 404) {
          this.router.navigate([
            `/home/environments/${this.currentEnvironmentId}/ingresses`
          ]);
        } else {
          this.loading = false;
          this.errorMessage = err.message;
        }
      }
    );
  }

  public fetchIngressDetailsToEdit(url) {
    this.http.get<any>(url).subscribe(res => {
      this.ingressDetailsToEdit = res;
      this.loadingToEdit = false;
    });
  }

  public subscribeToRefreshComponent() {
    this.communicationService.observable$.subscribe(e => {
      const event: any = e;
      if ('updateResource' === event.type && 'Ingress' === event.data.kind) {
        this.fetchIngressDetails(this.ingressDetailsUrl);
        this.fetchIngressDetailsToEdit(this.ingressDetailsUrlToEdit);
      }
    });
  }

  public objectKeys(object) {
    return Object.keys(object);
  }

  public goBack() {
    this.router.navigate([
      'home/environments/' + this.currentEnvironmentId + '/ingresses'
    ]);
  }

  public ngOnDestroy() {
    this.currentEnvironmentSubscription.unsubscribe();
  }
}
