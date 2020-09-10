import { useContext } from 'react';
import Store from './root-store';

export const useRootStore = () => useContext(Store);
