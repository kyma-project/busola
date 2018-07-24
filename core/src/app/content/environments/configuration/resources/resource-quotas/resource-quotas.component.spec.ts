import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceQuotasComponent } from './resource-quotas.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { CurrentEnvironmentService } from '../../../services/current-environment.service';
import { ComponentCommunicationService } from '../../../../../shared/services/component-communication.service';
import { GraphQLClientService } from '../../../../../shared/services/graphql-client-service';

describe('ResourceQuotasComponent', () => {
  let component: ResourceQuotasComponent;
  let fixture: ComponentFixture<ResourceQuotasComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ResourceQuotasComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          HttpClient,
          HttpHandler,
          OAuthService,
          UrlHelperService,
          CurrentEnvironmentService,
          ComponentCommunicationService,
          GraphQLClientService
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceQuotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
