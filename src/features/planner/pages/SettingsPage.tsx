import { card, cx, display } from '../lib/ui';

export default function SettingsPage() {
    return (
        <div className="planner min-h-dvh bg-ground p-6 font-body text-[14px] text-ink scheme-light sm:p-8">
            <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <header>
                    <h1 className={cx(display, 'text-[40px] leading-tight')}>Settings</h1>
                    <p className="mt-1 text-muted">Workspace preferences</p>
                </header>
                <section className={cx(card, 'gap-2 p-5')}>
                    <h2 className="text-[15px] font-semibold">Calendar and reminders</h2>
                    <p className="text-[13px] leading-relaxed text-muted">
                        Calendar synchronization and notification preferences are not configured yet.
                    </p>
                </section>
            </main>
        </div>
    );
}