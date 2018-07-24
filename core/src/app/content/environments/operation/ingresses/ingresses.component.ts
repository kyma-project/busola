import { CurrentEnvironmentService } from './../../../environments/services/current-environment.service';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { AbstractKubernetesElementListComponent } from '../abstract-kubernetes-element-list.component';
import { KubernetesDataProvider } from '../kubernetes-data-provider';
import { IngressesEntryRendererComponent } from './ingresses-entry-renderer/ingresses-entry-renderer.component';
import { IngressesHeaderRendererComponent } from './ingresses-header-renderer/ingresses-header-renderer.component';
import { ComponentCommunicationService } from '../../../../shared/services/component-communication.service';
import { DataConverter } from '@kyma-project/y-generic-list';
import { DashboardIngress } from '../../../../shared/datamodel/k8s/dashboard-ingress';
import { IDashboardMetaDataOwner } from '../../../../shared/datamodel/k8s/generic/dashboard-meta-data-owner';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-ingresses',
  templateUrl: '../kubernetes-element-list.component.html',
  host: { class: 'sf-content' }
})
export class IngressesComponent extends AbstractKubernetesElementListComponent
  implements OnDestroy {
  public title = 'Ingresses';
  public emptyListText =
    'It looks like you don’t have any ingresses in your namespace yet.';
  public createNewElementText = 'Add Ingress';
  public resourceKind = 'Ingress';
  private currentEnvironmentId: string;
  private currentEnvironmentSubscription: Subscription;
  public hideFilter = false;

  constructor(
    private http: HttpClient,
    private currentEnvironmentService: CurrentEnvironmentService,
    private commService: ComponentCommunicationService,
    changeDetector: ChangeDetectorRef
  ) {
    super(currentEnvironmentService, changeDetector, http, commService);
    const converter: DataConverter<
      IDashboardMetaDataOwner,
      DashboardIngress
    > = {
      convert(entry: IDashboardMetaDataOwner) {
        return new DashboardIngress(entry);
      }
    };
    this.currentEnvironmentSubscription = this.currentEnvironmentService
      .getCurrentEnvironmentId()
      .subscribe(envId => {
        this.currentEnvironmentId = envId;
        const url = `${AppConfig.k8sDashboardApiUrl}ingress/${
          this.currentEnvironmentId
        }`;
        this.source = new KubernetesDataProvider(
          url,
          converter,
          this.http,
          'items'
        );
        this.entryRenderer = IngressesEntryRendererComponent;
        this.headerRenderer = IngressesHeaderRendererComponent;
      });
  }

  public createNewElement() {
    // TODO
  }

  public getResourceUrl(kind: string, entry: any): string {
    return `${AppConfig.k8sApiServerUrl_extensions}namespaces/${
      this.currentEnvironmentId
    }/ingresses/${entry.getId()}`;
  }

  public ngOnDestroy() {
    this.currentEnvironmentSubscription.unsubscribe();
  }
}
