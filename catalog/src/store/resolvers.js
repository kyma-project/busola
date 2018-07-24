import serviceClassDetail from './ServiceClassDetails/resolvers';
import filter from './Filter/resolvers';
import notification from './Notification/resolvers';

export default {
  Mutation: {
    ...serviceClassDetail.Mutation,
    ...filter.Mutation,
    ...notification.Mutation,
  },
  Query: {
    ...filter.Query,
  },
};
