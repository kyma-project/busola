import {ReplaceDirective} from './replace.directive';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

@Component({
  template: `<span stringReplace="ago:uptime"></span>`
})

class TestComponent {}

describe('ReplaceDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let spanElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, ReplaceDirective]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    spanElement = fixture.debugElement.query(By.css('span'));
  });

  it('should replace "ago" with "uptime"', () => {
    // given
    spanElement.nativeElement.innerText = '10 days ago';

    // when
    fixture.detectChanges();

    // then
    expect(spanElement.nativeElement.innerText).toBe('10 days uptime');
  });
});
