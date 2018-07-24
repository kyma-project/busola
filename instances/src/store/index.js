import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import builder from './../commons/builder';
import resolvers from './resolvers';
import defaults from './defaults';
import { getApiURL } from './../commons/api-url';

export function createApolloClient() {
    const cache = new InMemoryCache();
    const graphqlApiUrl = getApiURL('graphqlApiUrl');

    const client = new ApolloClient({
        uri: graphqlApiUrl,
        request: async operation => {
            operation.setContext(({ headers = {} }) => ({
                headers: {
                    ...headers,
                    authorization: builder.getBearerToken() || null,
                },
            }));
        },
        cache: cache,
        onError: ({ graphQLErrors, networkError }) => {
            if (graphQLErrors) {
                console.log('1', graphQLErrors);
            }
            if (networkError) {
                console.log('2', networkError);
            }
        },
        clientState: {
            defaults,
            resolvers,
        },
    });

    return client;
}