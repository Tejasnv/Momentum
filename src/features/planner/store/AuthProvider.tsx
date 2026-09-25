import { useState, type ReactNode } from 'react';
import { AuthContext, USER_LIST, type AuthStore, type User } from './AuthContext';

const SESSION_KEY = 'momentum-user';
const publicUser = (username: string): User | null => {
    const account = USER_LIST.find((candidate) => candidate.username === username);
    return account ? { username: account.username, role: account.role } : null;
};

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const username = sessionStorage.getItem(SESSION_KEY);
        return username ? publicUser(username) : null;
    });

    const store: AuthStore = {
        user,
        login: (username, password) => {
            const account = USER_LIST.find(
                (candidate) => candidate.username === username.trim().toLowerCase() && candidate.password === password,
            );
            if (!account) return false;
            const signedInUser = { username: account.username, role: account.role };
            sessionStorage.setItem(SESSION_KEY, account.username);
            setUser(signedInUser);
            return true;
        },
        logout: () => {
            sessionStorage.removeItem(SESSION_KEY);
            setUser(null);
        },
    };

    return <AuthContext value={store}>{children}</AuthContext>;
}