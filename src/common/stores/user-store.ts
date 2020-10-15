import { observable, action, computed } from 'mobx';
import firebase from 'firebase';
import { auth, firestore } from '../firebase/firebase-wrapper';
import { RootStore } from './root-store';
import { User, AuthUser } from '../../types';
import { OllieAPI } from '../api';

export default class UserStore {
    rootStore: RootStore;

    @observable user: firebase.User | null;

    @observable userInfo: User | null;

    @computed get isAuthenticated() {
        return this.user !== null;
    }

    @computed get isActive() {
        return this.userInfo?.active || false;
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.user = null;
        this.userInfo = null;
        firebase.auth().onAuthStateChanged((user) => {
            this.user = user;
        });
    }

    @action async loginWithEmail({ email, password }: { email: string; password: string }): Promise<void> {
        await auth().signInWithEmailAndPassword(email, password);
    }

    @action async signUpWithEmail({ email, password, firstName, lastName, gender, category }: AuthUser): Promise<void> {
        const { user } = await auth().createUserWithEmailAndPassword(email, password);
        if (!user) throw new Error('Error creating user with email.');

        const payload = {
            firstName,
            lastName,
            email,
            gender,
            category,
        };

        await OllieAPI.post('/practitioners', payload);

        // await firestore().collection('users').doc(user.uid).set({
        //     firstName,
        //     lastName,
        //     email,
        //     gender,
        //     category,
        //     active: false,
        // });
    }

    @action async logout(): Promise<void> {
        await auth().signOut();
    }

    @action async fetchUserInfo(): Promise<void> {
        if (!this.user) return;
        const res = await firestore().collection('users').doc(this.user.uid).get();
        this.userInfo = res.data() as User;
    }
}
