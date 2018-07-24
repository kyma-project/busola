import { AppModule } from './../../../../app.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { LambdasComponent } from './lambdas.component';

describe('LambdasComponent', () => {
  let component: LambdasComponent;
  let fixture: ComponentFixture<LambdasComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [AppModule],
        providers: [[{ provide: APP_BASE_HREF, useValue: '/my/app' }]]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LambdasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
