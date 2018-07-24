import { TestBed, inject } from '@angular/core/testing';

import { CoreServicesService } from './core-services.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AppConfig } from '../app.config';

describe('CoreServicesService', () => {
  let coreServicesService: CoreServicesService;
  let httpClientMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoreServicesService]
    });
    coreServicesService = TestBed.get(CoreServicesService);
    httpClientMock = TestBed.get(HttpTestingController);
  });

  it('should get Secret', (done) => {
    const name = 'fakeSecret';
    const namespace = 'fakeNamespace';
    const token = 'fakeToken';

    coreServicesService.getSecret(name, namespace, token).subscribe((res) => {
      done();
    });

    const req = httpClientMock.expectOne(
      `${AppConfig.k8sApiServerUrl}/namespaces/${namespace}/secrets/${name}`
    );

    expect(req.request.method).toEqual('GET');
    // We need this to fake the return call of subscribe. Without this the call would timeout
    req.flush({});

    httpClientMock.verify();
  });
});
