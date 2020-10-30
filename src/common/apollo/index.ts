import { useCallback } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { OperationDefinitionNode } from 'graphql';

export const useApolloClient = (authToken?: string): ApolloClient<NormalizedCacheObject> => {
    const createApolloClient = useCallback((): ApolloClient<NormalizedCacheObject> => {
        const headers = {
            Authorization: `Bearer ${authToken}`,
            'X-Hasura-Role': 'practitioner',
        };

        const httpLink = new HttpLink({
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

        const client = new SubscriptionClient(process.env.REACT_APP_OLLIE_GRAPHQL_WS_URL as string, {
            reconnect: true,
            connectionParams: {
                headers,
            },
        });

        const wsLink = new WebSocketLink(client);

        const link = split(
            ({ query }) => {
                const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;
                return kind === 'OperationDefinition' && operation === 'subscription';
            },
            wsLink,
            httpLink,
        );

        return new ApolloClient({
            link,
            cache: new InMemoryCache(),
        });
    }, [authToken]);

    return createApolloClient();
};
