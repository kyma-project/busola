import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitRangesComponent } from './limit-ranges.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { CurrentEnvironmentService } from '../../../services/current-environment.service';
import { ComponentCommunicationService } from '../../../../../shared/services/component-communication.service';
import { GraphQLClientService } from '../../../../../shared/services/graphql-client-service';

describe('LimitRangesComponent', () => {
  let component: LimitRangesComponent;
  let fixture: ComponentFixture<LimitRangesComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [LimitRangesComponent],
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
    fixture = TestBed.createComponent(LimitRangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
