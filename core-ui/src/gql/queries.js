import gql from 'graphql-tag';

export const GET_NAMESPACE = gql`
  query Namespace($name: String!) {
    namespace(name: $name) {
      name
      labels
      applications
      pods {
        name
        status
      }
      deployments {
        name
        status {
          replicas
          readyReplicas
        }
      }
    }

    resourceQuotas(namespace: $name) {
      name
      json
      spec {
        hard {
          limits {
            memory
          }
          requests {
            memory
          }
          pods
        }
      }
    }

    limitRanges(namespace: $name) {
      name
      json
      spec {
        limits {
          type
          max {
            memory
            cpu
          }
          default {
            memory
            cpu
          }
          defaultRequest {
            memory
            cpu
          }
        }
      }
    }
  }
`;

export const GET_SERVICE = gql`
  query Service($name: String!, $namespace: String!) {
    service(name: $name, namespace: $namespace) {
      name
      json
      labels
      clusterIP
      UID
    }
  }
`;

export const GET_SERVICES = gql`
  query Services($namespace: String!, $excludedLabels: [String!]) {
    services(namespace: $namespace, excludedLabels: $excludedLabels) {
      name
      clusterIP
      creationTimestamp
      labels
      ports {
        port
        serviceProtocol
      }
      json
    }
  }
`;

export const GET_API_RULE = gql`
  query APIRule($name: String!, $namespace: String!) {
    APIRule(name: $name, namespace: $namespace) {
      name
      generation
      json
      spec {
        rules {
          path
          methods
          accessStrategies {
            name
            config
          }
        }
        service {
          host
          name
          port
        }
      }
      status {
        apiRuleStatus {
          code
          description
        }
      }
      ownerSubscription {
        name
      }
    }
  }
`;
