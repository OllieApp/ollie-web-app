import { useCallback } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ClientOptions, SubscriptionClient } from 'subscriptions-transport-ws';
import { OperationDefinitionNode } from 'graphql';

class CustomSubscriptionClient extends SubscriptionClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(url: string, options?: ClientOptions, webSocketImpl?: any, webSocketProtocols?: string | string[]) {
        // It needs to be forced lazy otherwise it will try to connect before the setting up the following workaround
        super(url, { ...options, lazy: true }, webSocketImpl, webSocketProtocols);

        // Workaround suggested for ISSUE 377 on subscriptions-transport-ws package
        // https://github.com/apollographql/subscriptions-transport-ws/issues/377#issuecomment-375567665
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.maxConnectTimeGenerator.setMin(this.maxConnectTimeGenerator.max);
        const { lazy = false } = options || {};
        if (!lazy) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            this.connect();
        }
    }
}

export const useApolloClient = (authToken?: string): ApolloClient<NormalizedCacheObject> | null => {
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

        const client = new CustomSubscriptionClient(process.env.REACT_APP_OLLIE_GRAPHQL_WS_URL as string, {
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

    return authToken ? createApolloClient() : null;
};
