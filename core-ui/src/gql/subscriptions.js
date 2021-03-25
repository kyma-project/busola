import gql from 'graphql-tag';

export const DEPLOYMENT_EVENT_SUBSCRIPTION = gql`
  subscription Deployments($namespace: String!) {
    deploymentEvent(namespace: $namespace) {
      type
      deployment {
        name
        status {
          replicas
          readyReplicas
        }
      }
    }
  }
`;

export const POD_EVENT_SUBSCRIPTION = gql`
  subscription Pods($namespace: String!) {
    podEvent(namespace: $namespace) {
      type
      pod {
        name
        status
      }
    }
  }
`;
