import { useState, useEffect } from 'react';
import { User } from 'firebase';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { auth, database } from '../firebase/firebase-wrapper';

interface AuthState {
    status: string;
    user?: User;
    token?: string;
}

const createApolloClient = (authToken?: string) => {
    return new ApolloClient({
        link: new HttpLink({
            uri: process.env.REACT_APP_OLLIE_GRAPHQL_URL,
            headers: authToken
                ? {
                      Authorization: `Bearer ${authToken}`,
                  }
                : {},
        }),
        cache: new InMemoryCache(),
    });
};

export const useApolloClient = () => {
    const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

    useEffect(() => {
        return auth().onAuthStateChanged(async (user) => {
            if (user) {
                const token = await user.getIdToken();
                const idTokenResult = await user.getIdTokenResult();
                const hasuraClaim = idTokenResult.claims['https://hasura.io/jwt/claims'];

                if (hasuraClaim) {
                    setAuthState({ status: 'in', user, token });
                } else {
                    // Check if refresh is required.
                    const metadataRef = database().ref(`metadata/${user.uid}/refreshTime`);

                    metadataRef.on('value', async (data) => {
                        if (!data.exists) return;
                        // Force refresh to pick up the latest custom claims changes.
                        const newToken = await user.getIdToken(true);
                        setAuthState({ status: 'in', user, token: newToken });
                    });
                }
            } else {
                setAuthState({ status: 'out' });
            }
        });
    }, []);

    return createApolloClient(authState.token);
};
