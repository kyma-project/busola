import gql from 'graphql-tag';

export const GET_NAMESPACES = gql`
  query {
    namespaces(withSystemNamespaces: true) {
      name
      pods {
        status
      }
      applications
    }
  }
`;
