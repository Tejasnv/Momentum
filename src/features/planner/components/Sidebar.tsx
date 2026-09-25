import { NavLink } from 'react-router-dom';
import { cx } from '../lib/ui';
import { HomeIcon, SettingsIcon, UserIcon } from './Icons';
import { useAuth } from '../store/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
        'grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-band hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        isActive && 'bg-band text-accent',
    );

export default function Sidebar() {
    const { user } = useAuth();

    return (
        <aside className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col items-center border-r border-line bg-card py-4">
            <nav aria-label="Primary navigation" className="flex h-full flex-col items-center">
                <NavLink to="/" end className={linkClass} aria-label="Home" title="Home">
                    <HomeIcon />
                </NavLink>
                <div className="mt-auto flex flex-col gap-2">
                    {user && (
                        <NavLink to="/settings" className={linkClass} aria-label="Settings" title="Settings">
                            <SettingsIcon />
                        </NavLink>
                    )}
                    <NavLink to="/profile" className={linkClass} aria-label="Profile" title="Profile">
                        <UserIcon />
                    </NavLink>
                </div>
            </nav>
        </aside>
    );
}