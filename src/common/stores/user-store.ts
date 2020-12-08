import { observable, action, computed } from 'mobx';
import firebase from 'firebase';
import { auth, database } from '../firebase/firebase-wrapper';
import { RootStore } from './root-store';
import { User, AuthUser, Practitioner } from '../../types';
import { OllieAPI } from '../api';

export default class UserStore {
  rootStore: RootStore;

  @observable authStatus: 'in' | 'out' | 'loading' = 'out';

  @observable authMethod?: 'email' | 'google';

  @observable firebaseUser?: firebase.User;

  @observable authToken?: string;

  @observable user?: User | null;

  @observable practitionerIds?: string[];

  @observable practitionerInfo?: Practitioner;

  @observable isLoadingFirebaseUser = true;

  @observable isSignInWithEmailAndPasswordLoading = false;

  @observable isSignInWithGoogleLoading = false;

  @observable isLoadingPractitionerInfo = false;

  @observable userExists = false;

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

  @computed get hasPractitionersCreated(): boolean {
    return Boolean(this.firebaseUser && this.practitionerIds?.length);
  }

  @action async signInWithEmailAndPassword({ email, password }: { email: string; password: string }): Promise<void> {
    try {
      this.isSignInWithEmailAndPasswordLoading = true;
      this.isLoadingFirebaseUser = true;
      await auth().signInWithEmailAndPassword(email, password);
      this.isLoadingFirebaseUser = false;
      await this.fetchUserInfo();
      this.isSignInWithEmailAndPasswordLoading = false;
    } catch (ex) {
      this.isSignInWithEmailAndPasswordLoading = false;
      throw ex;
    }
  }

  @action async signUpWithEmail({ email, firstName, lastName, gender, category }: Partial<AuthUser>): Promise<void> {
    try {
      this.isLoadingPractitionerInfo = true;

      await OllieAPI.post('/practitioners', {
        firstName,
        lastName,
        email: email || this.firebaseUser?.email,
        category,
        gender,
      });

      if (this.firebaseUser) {
        await this.updateFirebaseUser(this.firebaseUser);
        await this.fetchUserInfo();
      }
    } catch (ex) {
      this.isLoadingPractitionerInfo = false;
      throw ex;
    }
  }

  @action async signUpWithEmailAndPassword({
    email,
    password,
    firstName,
    lastName,
    gender,
    category,
  }: AuthUser): Promise<void> {
    try {
      this.authMethod = 'google';
      this.isLoadingFirebaseUser = true;

      if (!email || !password) {
        throw new Error('Missing required email or password');
      }

      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      if (!user) throw new Error('Error creating user with email.');

      this.firebaseUser = user;
      this.isLoadingFirebaseUser = false;

      this.signUpWithEmail({
        firstName,
        lastName,
        gender,
        category,
      });
    } catch (ex) {
      this.isLoadingFirebaseUser = false;
      throw ex;
    }
  }

  @action async signInWithGoogle() {
    try {
      this.authMethod = 'google';
      this.isSignInWithGoogleLoading = true;
      this.isLoadingFirebaseUser = true;

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');

      const { user } = await auth().signInWithPopup(provider);
      if (!user) throw new Error('Error creating user with Google.');

      this.firebaseUser = user;
      this.isLoadingFirebaseUser = false;

      await this.checkUserExistence();

      if (this.userExists) {
        await this.fetchUserInfo();
      }

      this.isSignInWithGoogleLoading = false;
    } catch (ex) {
      this.isSignInWithGoogleLoading = false;
      this.isLoadingFirebaseUser = false;
      throw ex;
    }
  }

  @action async logout(): Promise<void> {
    await auth().signOut();
    this.user = null;
    this.practitionerInfo = undefined;
    this.firebaseUser = undefined;
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

  @action async validateAuth(): Promise<void> {
    if (this.authStatus === 'in' && !this.practitionerInfo && !this.isLoadingPractitionerInfo) {
      await this.fetchUserInfo();
    }
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

  async checkUserExistence(): Promise<void> {
    if (!this.firebaseUser) {
      this.userExists = false;
      return;
    }

    try {
      await OllieAPI.get<User>(`/users`);
      this.userExists = true;
    } catch (ex) {
      if (ex.response?.status === 404) {
        this.userExists = false;
      } else {
        throw ex;
      }
    }
  }

  async fetchPractitionerInfo(): Promise<void> {
    if (!this.firebaseUser) return;

    this.isLoadingPractitionerInfo = true;

    const {
      data: { ids },
    } = await OllieAPI.get<{ ids: string[] }>(`/practitioners`);

    const { data: practitioner } = await OllieAPI.get(`/practitioners/${ids[0]}`);
    this.practitionerIds = ids;
    this.practitionerInfo = practitioner as Practitioner;
    this.isLoadingPractitionerInfo = false;
  }

  async fetchUserInfo(): Promise<void> {
    if (!this.firebaseUser) return;

    const { data: user } = await OllieAPI.get<User>(`/users`);

    this.user = user as User;

    await this.fetchPractitionerInfo();
  }
}
