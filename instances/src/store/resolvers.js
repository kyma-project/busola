import ServiceInstances from './ServiceInstances/resolvers';
import ServiceInstanceDetails from './ServiceInstancDetails/resolvers';
import Filter from './Filter/resolvers';

export default {
  Query: {
    ...Filter.Query,
  },
  Mutation: {
    ...ServiceInstances.Mutation,
    ...ServiceInstanceDetails.Mutation,
    ...Filter.Mutation,
  },
};
