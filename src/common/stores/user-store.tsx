import { observable, action, computed } from 'mobx';
import firebase from 'firebase';
import { auth } from '../firebase/firebase-wrapper';
import { RootStore } from './root-store';

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

    @action async loginEmail({ email, password }: { email: string; password: string }) {
        try {
            const res = await auth().signInWithEmailAndPassword(email, password);
        } catch (error) {}
    }

    @action async signUpWithEmail({ email, password }: { email: string; password: string }) {
        try {
            const res = await auth().createUserWithEmailAndPassword(email, password);
        } catch (error) {}
    }
}
