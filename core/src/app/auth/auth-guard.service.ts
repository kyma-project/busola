import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthGuard implements CanActivateChild {
  constructor(private oauthService: OAuthService, private router: Router) {}

  canActivateChild(
    route: ActivatedRouteSnapshot,
    requestedState: RouterStateSnapshot
  ) {
    if (!this.oauthService.hasValidIdToken()) {
      sessionStorage.setItem('consoleNavigationPath', requestedState.url);
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
