import { graphql, compose } from 'react-apollo';
import { CHECK_INSTANCE_EXISTS } from './queries';
import builder from '../../commons/builder';
import Modal from './Modal.component';
import { SEND_NOTIFICATION } from './mutations';

export default compose(
  graphql(CHECK_INSTANCE_EXISTS, {
    options: props => {
      return {
        variables: {
          name: props.defaultInstanceName,
          environment: builder.getCurrentEnvironmentId(),
        },
        options: {
          errorPolicy: 'all',
        },
        skip: true,
      };
    },
    name: 'instanceExists',
  }),
  graphql(SEND_NOTIFICATION, {
    name: 'sendNotification',
  }),
)(Modal);
