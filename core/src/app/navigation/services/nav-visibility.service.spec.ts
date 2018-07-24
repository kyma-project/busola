import { TestBed, inject } from '@angular/core/testing';

import { NavVisibilityService } from './nav-visibility.service';

describe('NavVisibilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavVisibilityService]
    });
  });

  it('should be created', inject([NavVisibilityService], (service: NavVisibilityService) => {
    expect(service).toBeTruthy();
  }));
});
