import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { btn, btnOutline, btnPrimary, btnRect, card, cx, display, input, label } from '../lib/ui';
import { useAuth } from '../store/AuthContext';

export default function ProfilePage() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const submitLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!login(username, password)) {
            setError('Username or password is incorrect.');
            return;
        }
        setError('');
        setPassword('');
        navigate('/', { replace: true });
    };

    const submitLogout = () => {
        logout();
        setUsername('');
        setPassword('');
    };

    return (
        <div className="planner min-h-dvh bg-ground p-6 font-body text-[14px] text-ink scheme-light sm:p-8">
            <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <header>
                    <h1 className={cx(display, 'text-[40px] leading-tight')}>Profile</h1>
                    <p className="mt-1 text-muted">{user ? 'Your Momentum account' : 'Sign in to your Momentum account'}</p>
                </header>
                <section className={cx(card, 'gap-2 p-5')}>
                    {user ? (
                        <>
                            <h2 className="text-[15px] font-semibold">Account</h2>
                            <p className="text-[13px] text-muted">Signed in as <strong className="text-ink">{user.username}</strong></p>
                            <p className="text-[13px] text-muted">Role: {user.role}</p>
                            <button type="button" className={cx(btn, btnRect, btnOutline, 'mt-2 self-start')} onClick={submitLogout}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <form className="flex max-w-sm flex-col gap-4" onSubmit={submitLogin}>
                            <h2 className="text-[15px] font-semibold">Log in</h2>
                            <label className="flex flex-col gap-1.5">
                                <span className={label}>Username</span>
                                <input
                                    className={input}
                                    name="username"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className={label}>Password</span>
                                <input
                                    className={input}
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                            </label>
                            {error && <p role="alert" className="text-[13px] text-overdue">{error}</p>}
                            <button type="submit" className={cx(btn, btnRect, btnPrimary, 'self-start')}>
                                Log in
                            </button>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
}