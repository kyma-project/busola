import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfig } from './../app.config';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/do';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(public oAuthService: OAuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(AppConfig.authIssuer)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.oAuthService.getIdToken()}`
        }
      });
    }

    return next.handle(request).do(
      (event: HttpEvent<any>) => {},
      (err: any) => {
        if (err.status === 401) {
          this.oAuthService.initImplicitFlow();
        }
      }
    );
  }
}
