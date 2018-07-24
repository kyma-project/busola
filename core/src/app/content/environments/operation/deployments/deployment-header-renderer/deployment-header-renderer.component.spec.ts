import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymentHeaderRendererComponent } from './deployment-header-renderer.component';

describe('DeploymentHeaderRendererComponent', () => {
  let component: DeploymentHeaderRendererComponent;
  let fixture: ComponentFixture<DeploymentHeaderRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymentHeaderRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymentHeaderRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
