import { graphql, compose } from 'react-apollo';
import { TOPICS_QUERY } from './queries';
import MainPage from './MainPage.component';
import { prepareTopicsList } from '../../commons/yaml.js';

const topics = prepareTopicsList();
export default compose(
  graphql(TOPICS_QUERY, {
    name: 'topics',
    options: props => {
      return {
        variables: {
          input: topics
        },
        options: {
          fetchPolicy: 'cache-and-network',
        },
      };
    },
  }),
)(MainPage);
