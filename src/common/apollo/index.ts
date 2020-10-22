import { useCallback } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client';

export const useApolloClient = (authToken?: string): ApolloClient<NormalizedCacheObject> => {
    const createApolloClient = useCallback((): ApolloClient<NormalizedCacheObject> => {
        const link = new HttpLink({
            uri: process.env.REACT_APP_OLLIE_GRAPHQL_URL,
            fetch: (uri, options) => {
                const opt = options || {};

                opt.headers = {
                    ...options?.headers,
                    Authorization: `Bearer ${authToken}`,
                    'X-Hasura-Role': 'practitioner',
                };

                return fetch(uri, opt).then(async (res) => {
                    const json = await res.json();
                    const error = json.errors[0];

                    if (error && error.extensions?.code === 'invalid-headers') {
                        throw new Error('Session expired');
                    }

                    return res;
                });
            },
        });

        return new ApolloClient({
            link,
            headers: {
                Authorization: `Bearer ${authToken}`,
                'X-Hasura-Role': 'practitioner',
            },
            cache: new InMemoryCache(),
        });
    }, [authToken]);

    return createApolloClient();
};
