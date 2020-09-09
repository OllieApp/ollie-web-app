import { createContext } from 'react';
import UserStore from './user-store';

export class RootStore {
    userStore: UserStore;

    constructor() {
        this.userStore = new UserStore(this);
    }
}

const rootStore = createContext(new RootStore());

export default rootStore;
