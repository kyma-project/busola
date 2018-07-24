import { AuthConfig } from 'angular-oauth2-oidc';
import { AppConfig } from './../app.config';

export const authConfig: AuthConfig = {
  issuer: AppConfig.authIssuer,
  redirectUri: AppConfig.authRedirectUri,
  clientId: AppConfig.consoleClientId,
  scope: AppConfig.scope,
  clearHashAfterLogin: false
};
