import gql from 'graphql-tag';

export const SERVICE_INSTANCE_QUERY = gql`
  query ServiceInstance($environment: String!, $name: String!) {
    serviceInstance(environment: $environment, name: $name) {
      name
      environment
      servicePlanName
      status {
        type
        message
      }
      serviceClass {
        name
        displayName
        externalName
        description
        content
        asyncApiSpec
        apiSpec
      }
      servicePlan {
        name
        displayName
        externalName
        relatedServiceClassName
      }
      serviceBindings {
        name
        environment
        secret {
          name
          data
          environment
        }
        serviceInstanceName
      }
      serviceBindingUsages {
        name
        environment
        serviceBinding {
          name
          secret {
            name
            data
          }
        }
        usedBy {
          name
          kind
        }
      }
    }
  }
`;

export const FUNCTIONS_QUERY = gql`
  query Functions($environment: String!) {
    functions(environment: $environment) {
      name
    }
  }
`;

export const DEPLOYMENTS_WITHOUT_FUNCTIONS_QUERY = gql`
  query Deployments($environment: String!) {
    deployments(environment: $environment, excludeFunctions: true) {
      name
    }
  }
`;
