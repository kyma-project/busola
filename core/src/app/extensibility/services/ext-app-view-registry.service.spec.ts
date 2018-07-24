import { TestBed } from '@angular/core/testing';

import { ExtAppViewRegistryService } from './ext-app-view-registry.service';

describe('ExtAppViewRegistryService', () => {

  let extAppViewRegistryService: ExtAppViewRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ ExtAppViewRegistryService ]
    });
    extAppViewRegistryService = TestBed.get(ExtAppViewRegistryService);
  });

  it('should be created', () => {
    expect(extAppViewRegistryService).toBeTruthy();
  });

  describe('registerView', () => {

    beforeEach(() => {
      const result = extAppViewRegistryService.isRegistered('someview');
      expect(result).toEqual(false);
    });

    it('should register the view and return session id', () => {
      const result = extAppViewRegistryService.registerView('someview');
      expect(typeof result).toBe('string');
    });

    afterEach(() => {
      const result = extAppViewRegistryService.isRegistered('someview');
      expect(result).toEqual(true);
    });

  });

  describe('deregisterView', () => {

    beforeEach(() => {
      extAppViewRegistryService.registerView('someview');
      const result = extAppViewRegistryService.isRegistered('someview');
      expect(result).toEqual(true);
    });

    it('should deregister the view', () => {
      const result = extAppViewRegistryService.deregisterView('someview');
    });

    afterEach(() => {
      const result = extAppViewRegistryService.isRegistered('someview');
      expect(result).toEqual(false);
    });

  });

  describe('isRegistered', () => {

    it('should return false if the view is not registered', () => {
      const result = extAppViewRegistryService.isRegistered('someview');
      expect(result).toBe(false);
    });

    it('should return true if the view is registered', () => {
      extAppViewRegistryService.registerView('someview');
      const result = extAppViewRegistryService.isRegistered('someview');
      expect(result).toBe(true);
    });

  });

  describe('isRegisteredSession', () => {

    it('should return false if session is not registered', () => {
      spyOn(extAppViewRegistryService, 'isRegistered').and.callThrough();
      const result = extAppViewRegistryService.isRegisteredSession('someview', '10-10-10');
      expect(extAppViewRegistryService.isRegistered).toHaveBeenCalledWith('someview');
      expect(result).toBe(false);
    });

    it('should return true if session is registered', () => {
      const sessionId = extAppViewRegistryService.registerView('someview');
      spyOn(extAppViewRegistryService, 'isRegistered').and.callThrough();
      const result = extAppViewRegistryService.isRegisteredSession('someview', sessionId);
      expect(extAppViewRegistryService.isRegistered).toHaveBeenCalledWith('someview');
      expect(result).toBe(true);
    });

  });

});
