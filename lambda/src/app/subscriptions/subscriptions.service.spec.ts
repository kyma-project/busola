import { TestBed, inject } from '@angular/core/testing';

import { SubscriptionsService } from './subscriptions.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfig } from '../app.config';

describe('SubscriptionsService', () => {
  let subscriptionsService: SubscriptionsService;
  let httpClientMock: HttpTestingController;
  const name = 'fakesub';
  const namespace = 'fakeNamespace';
  const token = 'fakeToken';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionsService]
    });
    subscriptionsService = TestBed.get(SubscriptionsService);
    httpClientMock = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([SubscriptionsService], (service: SubscriptionsService) => {
    expect(service).toBeTruthy();
  }));

  const response = {};

  it('should get subscriptions', (done) => {
    const params = {};
    subscriptionsService.getSubscriptions(namespace, token, params).subscribe((res) => {
      done();
    });
    const request = httpClientMock.expectOne(
      `${AppConfig.subscriptionApiUrl}/namespaces/${namespace}/subscriptions`
    );
    request.flush(response);
    expect(request.request.method).toEqual('GET');
    expect(request.request.headers.get('Content-type')).toEqual('application/json');
    expect(request.request.headers.get('Authorization')).toEqual('Bearer fakeToken');
    httpClientMock.verify();
  });

  it('should delete subscriptions', (done) => {
    const params = {};
    subscriptionsService.deleteSubscription(name, namespace, token).subscribe((res) => {
      done();
    });
    const request = httpClientMock.expectOne(
      `${AppConfig.subscriptionApiUrl}/namespaces/${namespace}/subscriptions/${name}`
    );
    request.flush(response);
    expect(request.request.method).toEqual('DELETE');
    expect(request.request.headers.get('Content-type')).toEqual('application/json');
    expect(request.request.headers.get('Authorization')).toEqual('Bearer fakeToken');
    httpClientMock.verify();
  });
});
