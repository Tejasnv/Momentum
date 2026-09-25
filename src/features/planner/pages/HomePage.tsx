import { Link } from 'react-router-dom';
import Planner from "../Planner";
import { btn, btnPrimary, btnRect, cx, display } from '../lib/ui';
import { useAuth } from '../store/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="planner flex min-h-dvh items-center bg-ground px-8 py-16 font-body text-ink sm:px-16">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6">
          <p className="text-[12px] font-semibold uppercase text-accent">Momentum</p>
          <h1 className={cx(display, 'max-w-2xl text-[64px] leading-[1.02] max-[520px]:text-[48px]')}>
            Please login
          </h1>
          <p className="max-w-lg text-[16px] leading-relaxed text-muted">
            Sign in to see your calendar, meetings, and tasks.
          </p>
          <Link to="/profile" className={cx(btn, btnRect, btnPrimary, 'no-underline')}>
            Log in
          </Link>
        </section>
      </main>
    );
  }

  return <Planner />;
};

export default HomePage;
