import gql from 'graphql-tag';

export const FILTERED_CLASSES_QUERY = gql`
  query filteredServiceClasses {
    filteredServiceClasses @client {
      name
      description
      displayName
      externalName
      imageUrl
      activated
      providerDisplayName
      tags
    }
  }
`;

export const CLASS_FILTERS_QUERY = gql`
  query serviceClassFilters {
    serviceClassFilters @client {
      name
      values @client {
        name
        value
        count
      }
    }
  }
`;

export const CLASS_ACTIVE_FILTERS_QUERY = gql`
  query activeServiceClassFilters {
    activeServiceClassFilters @client {
      provider
      category
    }
  }
`;
