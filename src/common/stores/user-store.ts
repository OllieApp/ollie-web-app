import { observable, action, computed } from 'mobx';
import firebase from 'firebase';
import { auth, firestore } from '../firebase/firebase-wrapper';
import { RootStore } from './root-store';
import { User } from '../../types';

export default class UserStore {
    rootStore: RootStore;

    @observable user: firebase.User | null;

    @computed get isAuthenticated() {
        return this.user !== null;
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.user = null;
        firebase.auth().onAuthStateChanged((user) => {
            this.user = user;
        });
    }

    @action async loginWithEmail({ email, password }: { email: string; password: string }): Promise<void> {
        await auth().signInWithEmailAndPassword(email, password);
    }

    @action async signUpWithEmail({ email, password, firstName, lastName, gender, category }: User): Promise<void> {
        const { user } = await auth().createUserWithEmailAndPassword(email, password);
        if (!user) throw new Error('Error creating user with email.');

        await firestore().collection('users').doc(user.uid).set({
            firstName,
            lastName,
            email,
            gender,
            category,
        });
    }

    @action async logout(): Promise<void> {
        await auth().signOut();
    }
}
