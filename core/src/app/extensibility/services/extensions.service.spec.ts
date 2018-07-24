import { TestBed, inject, async } from '@angular/core/testing';
import { ExtensionsService } from './extensions.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  IMicroFrontend,
  MicroFrontend
} from '../../shared/datamodel/k8s/microfrontend';
import { AppConfig } from '../../app.config';
import { List } from '../../shared/datamodel/k8s/generic/list';

describe('ExtensionsService', () => {
  let extensionsService: ExtensionsService;
  let httpClientMock: HttpTestingController;

  const frontend: IMicroFrontend = {
    metadata: {
      name: 'testId',
      uid: 'uid'
    },
    status: {
      phase: 'ok'
    },
    data: {
      data1: 'data'
    },
    type: 'type',
    spec: {
      location: 'https://www.google.com'
    },
    isStatusOk() {
      return true;
    },
    getId() {
      return 'testId';
    },
    getUid() {
      return 'testUid';
    },
    getLabel() {
      return 'testLabel';
    },
    getLocation() {
      return 'testId';
    }
  };

  const list: List<IMicroFrontend> = {
    items: [frontend]
  };

  const listEmpty: List<any> = {
    items: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExtensionsService]
    });
    extensionsService = TestBed.get(ExtensionsService);
    httpClientMock = TestBed.get(HttpTestingController);
  });

  it('should create', () => {
    expect(extensionsService).toBeTruthy();
  });

  describe('getExtensions', () => {
    it('should return the list of Microfrontends', done => {
      const namespaceId = 'id';
      extensionsService.getExtensions(namespaceId).subscribe(res => {
        expect(res).toEqual([new MicroFrontend(frontend)]);
        done();
      });
      const req = httpClientMock.expectOne(
        `${
          AppConfig.k8sApiServerUrl_ui
        }namespaces/${namespaceId}/microfrontends`
      );
      req.flush(list);
      httpClientMock.verify();
    });

    it('should return an empty array if there are no Microfrontends', done => {
      const namespaceId = 'id';
      extensionsService.getExtensions(namespaceId).subscribe(res => {
        expect(res).toEqual([]);
        done();
      });
      const req = httpClientMock.expectOne(
        `${
          AppConfig.k8sApiServerUrl_ui
        }namespaces/${namespaceId}/microfrontends`
      );
      req.flush(listEmpty);
      httpClientMock.verify();
    });

    it("should return an error if couldn't get the list of Microfrontends", done => {
      const namespaceId = 'id';
      extensionsService.getExtensions(namespaceId).subscribe(
        res => {},
        err => {
          expect(err.status).toEqual(500);
          expect(err.statusText).toEqual('Internal server error');
          done();
        }
      );
      const req = httpClientMock.expectOne(
        `${
          AppConfig.k8sApiServerUrl_ui
        }namespaces/${namespaceId}/microfrontends`
      );
      req.flush(
        {},
        {
          status: 500,
          statusText: 'Internal server error'
        }
      );
      httpClientMock.verify();
    });
  });
});
