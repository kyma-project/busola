import { AppConfig } from './../../../../app.config';
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GraphQLClientService } from '../../../../shared/services/graphql-client-service';

@Injectable()
export class RemoteEnvironmentBindingService {
  public envChangeStateEmitter$: EventEmitter<boolean>;

  constructor(
    private http: HttpClient,
    private graphQLClientService: GraphQLClientService
  ) {
    this.envChangeStateEmitter$ = new EventEmitter();
  }

  graphQLClientCall(query, variables) {
    return this.graphQLClientService.request(
      AppConfig.graphqlApiUrl,
      query,
      variables
    );
  }

  public bind(environment, remoteEnvironment) {
    const query = `mutation($environment: String!, $remoteEnvironment: String!){
      enableRemoteEnvironment(environment: $environment, remoteEnvironment: $remoteEnvironment) {
        environment
        remoteEnvironment
      }
    }`;
    const variables = {
      environment,
      remoteEnvironment
    };
    return this.graphQLClientService.request(
      AppConfig.graphqlApiUrl,
      query,
      variables
    );
  }

  public unbind(environment, remoteEnvironment) {
    const query = `mutation($environment: String!, $remoteEnvironment: String!){
      disableRemoteEnvironment(environment: $environment, remoteEnvironment: $remoteEnvironment) {
        environment
        remoteEnvironment
      }
    }`;
    const variables = {
      environment,
      remoteEnvironment
    };
    return this.graphQLClientService.request(
      AppConfig.graphqlApiUrl,
      query,
      variables
    );
  }

  public getBoundEnvironments(remoteEnvironment) {
    const query = `query Environment($remoteEnvironment: String!){
      environments(remoteEnvironment: $remoteEnvironment) {
        name
      }
    }`;
    const variables = { remoteEnvironment };
    return this.graphQLClientService.request(
      AppConfig.graphqlApiUrl,
      query,
      variables
    );
  }

  public getBoundRemoteEnvironments(environment) {
    const query = `query RemoteEnvironment($environment: String!){
      remoteEnvironments(environment: $environment) {
        name
      }
    }`;
    const variables = { environment };
    return this.graphQLClientService.request(
      AppConfig.graphqlApiUrl,
      query,
      variables
    );
  }
}
