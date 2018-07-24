import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngressDetailsComponent } from './ingress-details.component';
import { AppModule } from '../../../../../app.module';
import { APP_BASE_HREF } from '@angular/common';

describe('IngressDetailsComponent', () => {
  let component: IngressDetailsComponent;
  let fixture: ComponentFixture<IngressDetailsComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [AppModule],
        providers: [[{ provide: APP_BASE_HREF, useValue: '/my/app' }]]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(IngressDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
