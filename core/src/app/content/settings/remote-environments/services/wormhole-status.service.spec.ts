import { TestBed, inject, async } from '@angular/core/testing';
import { WormholeStatusService } from './wormhole-status.service';

describe('WormholeStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WormholeStatusService]
    });
  });

  it(
    'should create',
    inject([WormholeStatusService], (service: WormholeStatusService) => {
      expect(service).toBeTruthy();
    })
  );

  describe('getConnectionLatency()', () => {
    it(
      'should return random Observable<number>',
      async(
        inject([WormholeStatusService], (service: WormholeStatusService) => {
          const value = service.getConnectionLatency('name').subscribe(res => {
            expect(res).toBeGreaterThanOrEqual(100);
            expect(res).toBeLessThanOrEqual(200);
            expect(res).toEqual(jasmine.any(Number));
          });
          expect(typeof value).toBe('object');
        })
      )
    );
  });
});
