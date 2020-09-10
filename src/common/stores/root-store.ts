import { createContext } from 'react';
import UserStore from './user-store';

export class RootStore {
    userStore: UserStore;

    constructor() {
        this.userStore = new UserStore(this);
    }
}

const rootStoreContext = createContext(new RootStore());

export default rootStoreContext;
