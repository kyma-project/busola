import { TestBed, inject } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { TokenInterceptor } from './token.interceptor';

const OAuthServiceMock = {
  getIdToken: () => {
    return 'token';
  },
  initImplicitFlow: () => {
    return;
  }
};

describe('TokenInterceptor', () => {
  let httpClientMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        { provide: OAuthService, useValue: OAuthServiceMock }
      ]
    });

    httpClientMock = TestBed.get(HttpTestingController);
    http = TestBed.get(HttpClient);
  });

  it('should add Authorization header to request', () => {
    // given
    http.get('/api').subscribe(response => expect(response).toBeTruthy());
    const request = httpClientMock.expectOne('/api');

    // then
    expect(request.request.headers.get('Authorization')).toBeTruthy();
    expect(request.request.headers.get('Authorization')).toBe('Bearer token');

    // when
    request.flush({ data: 'test' });
  });

  it('shouldnt add Authorization header to request', () => {
    // given
    const dexurl = 'https://dex.kyma.local/something-else';
    http.get(dexurl).subscribe(response => expect(response).toBeTruthy());
    const request = httpClientMock.expectOne(dexurl);

    // then
    expect(request.request.headers.get('Authorization')).toBeNull();

    // when
    request.flush({});
  });

  it('should catch the Unauthorized error', () => {
    // given
    http.get('/api').subscribe(
      response => {},
      error => {
        // then
        expect(error).toBeTruthy();
        expect(error.status).toEqual(401);
      }
    );
    const request = httpClientMock.expectOne('/api');

    // when
    request.flush(
      {},
      {
        status: 401,
        statusText: 'Unauthorized'
      }
    );
  });

  afterEach(() => {
    httpClientMock.verify();
  });
});
