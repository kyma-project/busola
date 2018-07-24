import { TestBed, inject } from '@angular/core/testing';

import { CurrentEnvironmentService } from './current-environment.service';

describe('CurrentEnvironmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrentEnvironmentService]
    });
  });

  it('should be created', inject([CurrentEnvironmentService], (service: CurrentEnvironmentService) => {
    expect(service).toBeTruthy();
  }));
});
