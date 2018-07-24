import { graphql, compose } from 'react-apollo';
import { GET_NOTIFICATION } from './queries';
import App from './App.component';
import { CLEAR_NOTIFICATION } from './mutations';

export default compose(
  graphql(GET_NOTIFICATION, {
    name: 'notification',
  }),
  graphql(CLEAR_NOTIFICATION, {
    name: 'clearNotification',
  }),
)(App);
