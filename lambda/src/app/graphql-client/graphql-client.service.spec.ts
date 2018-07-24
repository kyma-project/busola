import { TestBed, inject } from '@angular/core/testing';

import { GraphqlClientService } from './graphql-client.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GraphqlClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GraphqlClientService,
      ]
    });
  });

  it('should be created', inject([GraphqlClientService], (service: GraphqlClientService) => {
    expect(service).toBeTruthy();
  }));
});
