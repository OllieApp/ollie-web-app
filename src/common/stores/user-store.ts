import { observable, action, computed } from 'mobx';
import firebase from 'firebase';
import { auth } from '../firebase/firebase-wrapper';
import { RootStore } from './root-store';
import { User, AuthUser, Practitioner } from '../../types';
import { OllieAPI } from '../api';

export default class UserStore {
    rootStore: RootStore;

    @observable firebaseUser: firebase.User | null;

    @observable user: User | null;

    @observable practitionerIds: string[] | null;

    @observable practitionerInfo: Practitioner | null;

    @observable isLoadingUserInfo = false;

    @computed get isAuthenticated() {
        return this.user !== null;
    }

    @computed get isActive() {
        return this.practitionerInfo?.isActive || false;
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.user = null;
        this.firebaseUser = null;
        this.practitionerIds = null;
        this.practitionerInfo = null;
        firebase.auth().onAuthStateChanged((user) => {
            this.firebaseUser = user;
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // window.MOCK_APPOINTMENTS = () => {
        //     // const randomNum = (from: number, to: number) => Math.floor(Math.random() * to) + from;

        //     Array(5)
        //         .fill(1)
        //         .forEach((_, i) => {
        //             OllieAPI.post('/appointments', {
        //                 practitionerId: Number(this.practitionerInfo?.id),
        //                 userNotes: 'My cool notes',
        //                 startTime: new Date(Date.UTC(2020, 9, 21 + i + 2, 9, 30)),
        //                 isVirtual: true,
        //             });
        //         });
        // };
    }

    @action async loginWithEmail({ email, password }: { email: string; password: string }): Promise<void> {
        await auth().signInWithEmailAndPassword(email, password);
        await this.fetchUserInfo();
    }

    @action async signUpWithEmail({ email, password, firstName, lastName, gender, category }: AuthUser): Promise<void> {
        const { user } = await auth().createUserWithEmailAndPassword(email, password);
        if (!user) throw new Error('Error creating user with email.');

        await OllieAPI.post('/practitioners', {
            firstName,
            lastName,
            email,
            category,
            gender,
        });

        await this.fetchUserInfo();
    }

    @action async logout(): Promise<void> {
        await auth().signOut();
        this.user = null;
        this.practitionerInfo = null;
        this.firebaseUser = null;
    }

    @action async fetchUserInfo(): Promise<void> {
        if (!this.firebaseUser) return;

        this.isLoadingUserInfo = true;

        const { data: user } = await OllieAPI.get<User>(`/users`);
        const {
            data: { ids },
        } = await OllieAPI.get<{ ids: string[] }>(`/practitioners`);
        const { data: practitioner } = await OllieAPI.get(`/practitioners/${ids[0]}`);

        this.user = user as User;
        this.practitionerIds = ids;
        this.practitionerInfo = practitioner as Practitioner;
        this.isLoadingUserInfo = false;
    }

    @action async updatePractitionerProfile(data: Partial<Practitioner> & Partial<User>): Promise<void> {
        if (!this.practitionerIds) return;

        await OllieAPI.patch<Practitioner>(`/practitioners/${this.practitionerIds[0]}`, data);
        await this.fetchUserInfo();
    }

    @action async uploadAvatar(file: File): Promise<void> {
        if (!this.practitionerIds) return;

        const formData = new FormData();
        formData.append('file', file);

        await OllieAPI.post<Practitioner>(`/practitioners/avatar/${this.practitionerIds[0]}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        await this.fetchUserInfo();
    }

    @action async cancelAppointment(id: string): Promise<void> {
        if (!this.practitionerIds) return;

        await OllieAPI.post(`/appointments/${id}/cancel`);
    }
}
