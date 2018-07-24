import gql from 'graphql-tag';

export const GET_SERVICE_CLASS = gql`
  query GetServiceClass($name: String!) {
    serviceClass(name: $name) {
      name
      externalName
      displayName
      creationTimestamp
      description
      documentationUrl
      providerDisplayName
      tags
      content
      apiSpec
      asyncApiSpec
      plans {
        name
        instanceCreateParameterSchema
        displayName
        relatedServiceClassName
        externalName
      }
    }
  }
`;

export const CREATE_SERVICE_INSTANCE = gql`
  mutation CreateServiceInstance(
    $name: String!
    $environment: String!
    $externalServiceClassName: String!
    $externalPlanName: String!
    $labels: [String]!
    $parameterSchema: JSON
  ) {
    createServiceInstance(
      params: {
        name: $name
        environment: $environment
        externalServiceClassName: $externalServiceClassName
        externalPlanName: $externalPlanName
        labels: $labels
        parameterSchema: $parameterSchema
      }
    ) {
      name
    }
  }
`;
