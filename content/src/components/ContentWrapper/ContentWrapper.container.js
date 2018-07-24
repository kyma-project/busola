import { graphql, compose } from 'react-apollo';
import { CONTENT_QUERY } from './queries';
import ContentWrapper from './ContentWrapper.component';

export default compose(
  graphql(CONTENT_QUERY, {
    name: 'content',
    options: props => {
      return {
        variables: {
          contentType: props.item.type,
          id: props.item.id,
        },
        options: {
          fetchPolicy: 'cache-and-network',
        },
      };
    },
  }),
)(ContentWrapper);
