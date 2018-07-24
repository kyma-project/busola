import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesComponent } from './resources.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;
  let fixture: ComponentFixture<ResourcesComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ResourcesComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeTab', () => {
    it('should set show limits tab if it ahs been chosen', () => {
      component.changeTab('limits');
      expect(component.limitsTabExpanded).toEqual(true);
      expect(component.quotasTabExpanded).toEqual(false);
    });

    it('should set show limits tab if it ahs been chosen', () => {
      component.changeTab('quotas');
      expect(component.limitsTabExpanded).toEqual(false);
      expect(component.quotasTabExpanded).toEqual(true);
    });
  });
});
