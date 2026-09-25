import { createContext, useContext } from 'react';

export type UserRole = 'admin' | 'guest';

export interface User {
    username: string;
    role: UserRole;
}

interface Credential extends User {
    password: string;
}

export const USER_LIST: Credential[] = [
    { username: 'admin', password: 'admin', role: 'admin' },
    { username: 'guest', password: 'guest', role: 'guest' },
];

export interface AuthStore {
    user: User | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

export const AuthContext = createContext<AuthStore | null>(null);

export function useAuth() {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('useAuth must be used inside <AuthProvider>');
    return auth;
}