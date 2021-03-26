import gql from 'graphql-tag';

export const UPDATE_LIMIT_RANGE = gql`
  mutation updateLimitRange($namespace: String!, $name: String!, $json: JSON!) {
    updateLimitRange(namespace: $namespace, name: $name, json: $json) {
      name
    }
  }
`;

export const UPDATE_RESOURCE_QUOTA = gql`
  mutation updateResourceQuota(
    $namespace: String!
    $name: String!
    $json: JSON!
  ) {
    updateResourceQuota(namespace: $namespace, name: $name, json: $json) {
      name
    }
  }
`;

export const CREATE_API_RULE = gql`
  mutation createAPIRule(
    $name: String!
    $namespace: String!
    $params: APIRuleSpecInput!
  ) {
    createAPIRule(name: $name, namespace: $namespace, params: $params) {
      name
    }
  }
`;

export const UPDATE_API_RULE = gql`
  mutation updateAPIRule(
    $name: String!
    $namespace: String!
    $generation: Int!
    $params: APIRuleSpecInput!
  ) {
    updateAPIRule(
      name: $name
      namespace: $namespace
      generation: $generation
      params: $params
    ) {
      name
    }
  }
`;

export const BIND_NAMESPACE = gql`
  mutation($namespace: String!, $application: String!) {
    enableApplication(
      namespace: $namespace
      application: $application
      allServices: true
    ) {
      namespace
      application
    }
  }
`;

export const UNBIND_NAMESPACE = gql`
  mutation($namespace: String!, $application: String!) {
    disableApplication(namespace: $namespace, application: $application) {
      namespace
      application
    }
  }
`;

export const CREATE_RESOURCE = gql`
  mutation createResource($namespace: String!, $resource: JSON!) {
    createResource(namespace: $namespace, resource: $resource)
  }
`;
