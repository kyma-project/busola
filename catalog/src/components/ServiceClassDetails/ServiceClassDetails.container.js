import { graphql, compose } from 'react-apollo';
import { GET_SERVICE_CLASS, CREATE_SERVICE_INSTANCE } from './queries';
import ServiceClassDetails from './ServiceClassDetails.component';

export default compose(
  graphql(GET_SERVICE_CLASS, {
    options: props => {
      return {
        variables: {
          name: props.match.params.name,
        },
        options: {
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'all',
        },
      };
    },
    name: 'serviceClass',
  }),
  graphql(CREATE_SERVICE_INSTANCE, {
    name: 'createServiceInstance',
  }),
)(ServiceClassDetails);
