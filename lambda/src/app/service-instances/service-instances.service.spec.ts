import { TestBed, inject } from '@angular/core/testing';

import { ServiceInstancesService } from './service-instances.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AppConfig } from '../app.config';

describe('ServiceInstancesService', () => {
  let serviceInstanceService: ServiceInstancesService;
  let httpClientMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceInstancesService]
    });

    serviceInstanceService = TestBed.get(ServiceInstancesService);
    httpClientMock = TestBed.get(HttpTestingController);
  });

  it('should get service instance', (done) => {
    const name = 'fakeServiceInstanceName';
    const namespace = 'fakeNamespace';
    const token = 'fakeToken';

    serviceInstanceService.getServiceInstance(name, namespace, token).subscribe((res) => {
      done();
    });
    const req = httpClientMock.expectOne(
      `${AppConfig.serviceCatalogApiUrl}/namespaces/${namespace}/serviceinstances/${name}`
    );
    req.flush({});
    httpClientMock.verify();
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
    expect(req.request.headers.get('Authorization')).toEqual('Bearer fakeToken');
  });

  it('should get all the service instances', (done) => {
    const namespace = 'fakeNamespace';
    const token = 'fakeToken';

    serviceInstanceService.getServiceInstances(namespace, token).subscribe((res) => {
      done();
    });
    const req = httpClientMock.expectOne(
      `${AppConfig.serviceCatalogApiUrl}/namespaces/${namespace}/serviceinstances`
    );
    req.flush({});
    httpClientMock.verify();
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.get('Content-Type')).toEqual('application/json');
    expect(req.request.headers.get('Authorization')).toEqual('Bearer fakeToken');
  });
});
