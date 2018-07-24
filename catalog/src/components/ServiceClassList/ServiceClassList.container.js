import { compose, graphql } from 'react-apollo';
import ServiceClassList from './ServiceClassList.component';
import {
  FILTERED_CLASSES_QUERY,
  CLASS_ACTIVE_FILTERS_QUERY,
  CLASS_FILTERS_QUERY,
} from './queries';

const ServiceClassListContainer = compose(
  graphql(FILTERED_CLASSES_QUERY, {
    name: 'classList',
    options: {
      fetchPolicy: 'cache-and-network',
    },
  }),
  graphql(CLASS_ACTIVE_FILTERS_QUERY, {
    name: 'activeClassFilters',
    options: {
      fetchPolicy: 'cache-and-network',
    },
  }),
  graphql(CLASS_FILTERS_QUERY, {
    name: 'classFilters',
    options: {
      fetchPolicy: 'cache-and-network',
    },
  }),
)(ServiceClassList);

export default ServiceClassListContainer;
