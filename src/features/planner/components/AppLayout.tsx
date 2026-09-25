import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
    return (
        <div className="flex min-h-dvh bg-ground">
            <Sidebar />
            <div className="min-w-0 flex-1">
                <Outlet />
            </div>
        </div>
    );
}