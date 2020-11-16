import { observable, action, computed } from 'mobx';
import firebase from 'firebase';
import { auth, database } from '../firebase/firebase-wrapper';
import { RootStore } from './root-store';
import { User, AuthUser, Practitioner } from '../../types';
import { OllieAPI } from '../api';

export default class UserStore {
  rootStore: RootStore;

  @observable authStatus: 'in' | 'out' | 'loading' = 'out';

  @observable firebaseUser?: firebase.User;

  @observable authToken?: string;

  @observable user?: User | null;

  @observable practitionerIds?: string[];

  @observable practitionerInfo?: Practitioner;

  @observable isLoadingFirebaseUser = true;

  @observable isLoadingPractitionerInfo = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    auth().onAuthStateChanged((user) => this.updateFirebaseUser(user));
  }

  @computed get isAuthenticated(): boolean {
    return this.authStatus === 'in' && Boolean(this.authToken && this.user && this.practitionerInfo);
  }

  @computed get isLoadingAuth(): boolean {
    return this.isLoadingFirebaseUser || this.isLoadingPractitionerInfo;
  }

  @computed get isActive(): boolean {
    return this.practitionerInfo?.isActive || false;
  }

  async updateFirebaseUser(user: firebase.User | null) {
    if (user) {
      const token = await user.getIdToken(true);
      const idTokenResult = await user.getIdTokenResult();
      const hasuraClaim = idTokenResult.claims['https://hasura.io/jwt/claims'];

      if (hasuraClaim) {
        this.firebaseUser = user;
        this.authStatus = 'in';
        this.authToken = token;
      } else {
        // Check if refresh is required.
        const metadataRef = database().ref(`metadata/${user.uid}/refreshTime`);

        metadataRef.on('value', async (data) => {
          if (!data.exists) return;
          // Force refresh to pick up the latest custom claims changes.
          const newToken = await user.getIdToken(true);

          this.firebaseUser = user;
          this.authStatus = 'in';
          this.authToken = newToken;
          this.isLoadingFirebaseUser = false;
        });
      }
    } else {
      this.firebaseUser = undefined;
      this.authStatus = 'out';
      this.authToken = undefined;
    }

    this.isLoadingFirebaseUser = false;
  }

  @action async loginWithEmail({ email, password }: { email: string; password: string }): Promise<void> {
    this.isLoadingFirebaseUser = true;
    await auth().signInWithEmailAndPassword(email, password);
    await this.fetchUserInfo();
  }

  @action async signUpWithEmail({ email, password, firstName, lastName, gender, category }: AuthUser): Promise<void> {
    this.isLoadingFirebaseUser = true;
    this.isLoadingPractitionerInfo = true;

    const { user } = await auth().createUserWithEmailAndPassword(email, password);
    if (!user) throw new Error('Error creating user with email.');

    await OllieAPI.post('/practitioners', {
      firstName,
      lastName,
      email,
      category,
      gender,
    });

    await this.updateFirebaseUser(user);
    await this.fetchUserInfo();
  }

  @action async logout(): Promise<void> {
    await auth().signOut();
    this.user = null;
    this.practitionerInfo = undefined;
    this.firebaseUser = undefined;
  }

  @action async fetchUserInfo(): Promise<void> {
    if (!this.firebaseUser) return;

    this.isLoadingPractitionerInfo = true;

    const { data: user } = await OllieAPI.get<User>(`/users`);

    const {
      data: { ids },
    } = await OllieAPI.get<{ ids: string[] }>(`/practitioners`);

    const { data: practitioner } = await OllieAPI.get(`/practitioners/${ids[0]}`);

    this.user = user as User;
    this.practitionerIds = ids;
    this.practitionerInfo = practitioner as Practitioner;
    this.isLoadingPractitionerInfo = false;
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
