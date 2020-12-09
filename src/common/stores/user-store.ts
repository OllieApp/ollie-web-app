import { observable, action, computed } from 'mobx';
import firebase from 'firebase';
import { auth, database } from '../firebase/firebase-wrapper';
import { RootStore } from './root-store';
import { User, AuthUser, Practitioner } from '../../types';
import { OllieAPI } from '../api';

export default class UserStore {
  rootStore: RootStore;

  @observable authStatus: 'in' | 'out' | 'loading' = 'out';

  @observable authMethod?: 'email' | 'google' = 'email';

  @observable firebaseUser?: firebase.User;

  @observable authToken?: string;

  @observable user?: User | null;

  @observable practitionerIds?: string[];

  @observable practitionerInfo?: Practitioner;

  @observable isBootstraped = false;

  @observable isSignInWithEmailAndPasswordLoading = false;

  @observable isSignInWithEmailLoading = false;

  @observable isSignInWithGoogleLoading = false;

  @observable isSignUpWithEmailLoading = false;

  @observable isFetchingUserInfo = false;

  @observable userExists = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    const { currentUser } = auth();
    if (currentUser) this.fetchUserInfo(currentUser);

    auth().onAuthStateChanged((user) => {
      if (!this.isBootstraped) this.bootstrap(user);
    });
  }

  async bootstrap(user?: firebase.User | null) {
    if (user && this.authStatus === 'out') {
      await this.checkUserExistence();
      if (this.userExists) await this.fetchUserInfo(user);
    }

    this.isBootstraped = true;
  }

  @computed get isAuthenticated(): boolean {
    return this.authStatus === 'in';
  }

  @computed get isLoadingAuth(): boolean {
    return this.authStatus === 'loading' || this.isFetchingUserInfo;
  }

  @computed get isActive(): boolean {
    return this.practitionerInfo?.isActive || false;
  }

  @computed get isCommingFromGAuth(): boolean {
    return Boolean(this.firebaseUser && !this.userExists);
  }

  @action async signInWithEmailAndPassword({ email, password }: { email: string; password: string }): Promise<void> {
    try {
      this.authMethod = 'email';
      this.isSignInWithEmailAndPasswordLoading = true;

      const { user } = await auth().signInWithEmailAndPassword(email, password);
      if (!user) throw new Error('Error siging with email and password.');

      this.fetchUserInfo(user);
    } catch (ex) {
      this.isSignInWithEmailAndPasswordLoading = false;
      throw ex;
    }
  }

  @action async signInWithGoogle() {
    try {
      this.authMethod = 'google';
      this.isSignInWithGoogleLoading = true;

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');

      const { user } = await auth().signInWithPopup(provider);
      if (!user) throw new Error('Error creating user with Google.');

      this.firebaseUser = user;

      await this.checkUserExistence();
      if (this.userExists) await this.fetchUserInfo(user);

      return {
        userExists: this.userExists,
      };
    } catch (ex) {
      this.authMethod = 'email';
      this.isSignInWithGoogleLoading = false;
      throw ex;
    }
  }

  @action async signUpWithEmail(
    { email, firstName, lastName, gender, category }: Partial<AuthUser>,
    user = this.firebaseUser,
  ): Promise<void> {
    try {
      this.authStatus = 'loading';
      this.isSignUpWithEmailLoading = true;

      await OllieAPI.post('/practitioners', {
        firstName,
        lastName,
        email: email || user?.email,
        category,
        gender,
      });

      await this.fetchUserInfo(user);
    } catch (ex) {
      this.authStatus = 'out';
      this.isSignUpWithEmailLoading = false;
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
      this.authStatus = 'loading';
      this.isSignUpWithEmailLoading = true;

      if (!email || !password) throw new Error('Missing required email or password');

      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      if (!user) throw new Error('Error creating user with email.');

      await this.signUpWithEmail(
        {
          email: user.email || undefined,
          firstName,
          lastName,
          gender,
          category,
        },
        user,
      );
    } catch (ex) {
      this.authStatus = 'out';
      this.isSignUpWithEmailLoading = false;
      throw ex;
    }
  }

  @action async signOut(): Promise<void> {
    await auth().signOut();

    this.user = undefined;
    this.authToken = undefined;
    this.firebaseUser = undefined;
    this.practitionerIds = undefined;
    this.practitionerInfo = undefined;
    this.authStatus = 'out';
  }

  @action async updatePractitionerProfile(data: Partial<Practitioner> & Partial<User>): Promise<void> {
    if (!this.practitionerIds) return;

    await OllieAPI.patch<Practitioner>(`/practitioners/${this.practitionerIds[0]}`, data);
    await this.fetchPractitionerInfo();
  }

  @action async uploadAvatar(file: File): Promise<void> {
    if (!this.practitionerIds) return;

    const formData = new FormData();
    formData.append('file', file);

    await OllieAPI.post<Practitioner>(`/practitioners/avatar/${this.practitionerIds[0]}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    await this.fetchPractitionerInfo();
  }

  @action async cancelAppointment(id: string): Promise<void> {
    if (!this.practitionerIds) return;

    await OllieAPI.post(`/appointments/${id}/cancel`);
  }

  async watchToken() {
    const user = this.firebaseUser;
    if (!user) return;

    const metadataRef = database().ref(`metadata/${user.uid}/refreshTime`);
    metadataRef.on('value', async (data) => {
      if (!data.exists) return;
      // Force refresh to pick up the latest custom claims changes.
      await user.getIdToken(true);
      this.fetchUserInfo(user);
    });
  }

  async checkUserExistence(): Promise<void> {
    try {
      await OllieAPI.get<User>(`/users`);
      this.userExists = true;
    } catch (ex) {
      console.log(ex.response?.status);
      if (ex.response?.status === 404) {
        this.userExists = false;
      } else {
        throw ex;
      }
    }
  }

  async fetchPractitionerInfo() {
    const {
      data: { ids },
    } = await OllieAPI.get<{ ids: string[] }>(`/practitioners`);
    const { data: practitioner } = await OllieAPI.get(`/practitioners/${ids[0]}`);

    this.practitionerIds = ids;
    this.practitionerInfo = practitioner as Practitioner;
  }

  async fetchUserInfo(firebaseUser = this.firebaseUser): Promise<void> {
    this.isFetchingUserInfo = true;
    const { data: user } = await OllieAPI.get<User>(`/users`);

    await this.fetchPractitionerInfo();

    this.user = user as User;
    this.firebaseUser = firebaseUser;
    this.authToken = await firebaseUser?.getIdToken();
    this.userExists = true;
    this.isSignInWithGoogleLoading = false;
    this.isSignInWithEmailLoading = false;
    this.isSignInWithEmailAndPasswordLoading = false;
    this.isSignUpWithEmailLoading = false;
    this.isFetchingUserInfo = false;
    this.isBootstraped = true;
    this.authStatus = 'in';

    this.watchToken();
  }
}
