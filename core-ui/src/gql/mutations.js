import gql from 'graphql-tag';

export const DELETE_NAMESPACE = gql`
  mutation deleteNamespace($name: String!) {
    deleteNamespace(name: $name) {
      name
    }
  }
`;

export const CREATE_LAMBDA = gql`
  mutation createFunction(
    $name: String!
    $namespace: String!
    $labels: Labels!
    $size: String!
    $runtime: String!
  ) {
    createFunction(
      name: $name
      namespace: $namespace
      labels: $labels
      size: $size
      runtime: $runtime
    ) {
      name
      namespace
      labels
      size
      runtime
    }
  }
`;

export const UPDATE_LAMBDA = gql`
  mutation updateFunction(
    $name: String!
    $namespace: String!
    $params: FunctionUpdateInput!
  ) {
    updateFunction(name: $name, namespace: $namespace, params: $params) {
      name
      namespace
      labels
      size
      runtime
      content
      dependencies
    }
  }
`;

export const DELETE_LAMBDA = gql`
  mutation DeleteFunction($name: String!, $namespace: String!) {
    deleteFunction(name: $name, namespace: $namespace) {
      name
    }
  }
`;

export const CREATE_SERVICE_BINDING = gql`
  mutation createServiceBinding(
    $serviceInstanceName: String!
    $namespace: String!
    $parameters: JSON
  ) {
    createServiceBinding(
      serviceInstanceName: $serviceInstanceName
      namespace: $namespace
      parameters: $parameters
    ) {
      name
    }
  }
`;

export const CREATE_SERVICE_BINDING_USAGE = gql`
  mutation createServiceBindingUsage(
    $createServiceBindingUsageInput: CreateServiceBindingUsageInput
    $namespace: String!
  ) {
    createServiceBindingUsage(
      createServiceBindingUsageInput: $createServiceBindingUsageInput
      namespace: $namespace
    ) {
      name
    }
  }
`;

export const DELETE_SERVICE_BINDING_USAGE = gql`
  mutation deleteServiceBindingUsage(
    $serviceBindingUsageName: String!
    $namespace: String!
  ) {
    deleteServiceBindingUsage(
      serviceBindingUsageName: $serviceBindingUsageName
      namespace: $namespace
    ) {
      name
    }
  }
`;

export const DELETE_SERVICE_BINDING_USAGES = gql`
  mutation deleteServiceBindingUsages(
    $serviceBindingUsageNames: [String!]!
    $namespace: String!
  ) {
    deleteServiceBindingUsages(
      serviceBindingUsageNames: $serviceBindingUsageNames
      namespace: $namespace
    ) {
      name
    }
  }
`;

export const UPDATE_NAMESPACE = gql`
  mutation UpdateNamespace($name: String!, $labels: Labels!) {
    updateNamespace(name: $name, labels: $labels) {
      name
      labels
    }
  }
`;

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

export const UPDATE_SERVICE = gql`
  mutation updateService($name: String!, $namespace: String!, $service: JSON!) {
    updateService(name: $name, namespace: $namespace, service: $service) {
      name
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation deleteService($name: String!, $namespace: String!) {
    deleteService(name: $name, namespace: $namespace) {
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

export const DELETE_API_RULE = gql`
  mutation deleteAPIRule($name: String!, $namespace: String!) {
    deleteAPIRule(name: $name, namespace: $namespace) {
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

export const UPDATE_OAUTH_CLIENT = gql`
  mutation updateOAuthClient(
    $namespace: String!
    $name: String!
    $generation: Int!
    $params: OAuth2ClientSpecInput!
  ) {
    updateOAuth2Client(
      name: $name
      namespace: $namespace
      generation: $generation
      params: $params
    ) {
      name
    }
  }
`;

export const DELETE_OAUTH_CLIENT = gql`
  mutation deleteOAuthClient($namespace: String!, $name: String!) {
    deleteOAuth2Client(name: $name, namespace: $namespace) {
      name
    }
  }
`;

export const CREATE_OAUTH_CLIENT = gql`
  mutation createOAuth2Client(
    $namespace: String!
    $name: String!
    $params: OAuth2ClientSpecInput!
  ) {
    createOAuth2Client(name: $name, namespace: $namespace, params: $params) {
      name
    }
  }
`;

export const CREATE_RESOURCE = gql`
  mutation createResource($namespace: String!, $resource: JSON!) {
    createResource(namespace: $namespace, resource: $resource)
  }
`;

export const DELETE_SECRET = gql`
  mutation deleteSecret($namespace: String!, $name: String!) {
    deleteSecret(name: $name, namespace: $namespace) {
      name
    }
  }
`;

export const UPDATE_SECRET = gql`
  mutation updateSecret($namespace: String!, $name: String!, $secret: JSON!) {
    updateSecret(name: $name, namespace: $namespace, secret: $secret) {
      name
    }
  }
`;

export const UPDATE_EVENT_SUBSCRIPTION = gql`
  mutation updateSubscription(
    $namespace: String!
    $name: String!
    $params: EventSubscriptionSpecInput!
  ) {
    updateSubscription(name: $name, namespace: $namespace, params: $params) {
      name
    }
  }
`;

export const CREATE_EVENT_SUBSCRIPTION = gql`
  mutation createSubscription(
    $namespace: String!
    $name: String!
    $params: EventSubscriptionSpecInput!
  ) {
    createSubscription(name: $name, namespace: $namespace, params: $params) {
      name
    }
  }
`;
