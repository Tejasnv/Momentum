import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { fmtLongDate } from "../lib/date";
import { cx, display } from "../lib/ui";

interface HeaderProps {
  today: Date;
  weekCount: number;
  weekHours: number;
  openTasks: number;
  /** On pages other than the dashboard the wordmark links home, and the page's own h1 is the main heading. */
  homeLink?: boolean;
  /** Page actions shown after the stats, e.g. Today + New moment. */
  children: ReactNode;
}

export default function Header({
  today,
  weekCount,
  weekHours,
  openTasks,
  homeLink = false,
  children,
}: HeaderProps) {
  const wordmark = cx(display, "text-[44px] leading-none tracking-[-0.01em]");
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-6 max-[1180px]:h-auto max-[1180px]:flex-wrap">
      <div className="flex items-baseline gap-4">
        {homeLink ? (
          <Link to="/" className={cx(wordmark, "text-ink no-underline")}>
            Momentum
          </Link>
        ) : (
          <h1 className={wordmark}>Momentum</h1>
        )}
        <span className="text-muted">{fmtLongDate(today)}</span>
      </div>
      <div className="flex items-center gap-2.5 max-[1180px]:flex-wrap">
        <Stat value={weekCount} label="moments this week" />
        <Stat value={`${weekHours} h`} label="booked" />
        <Stat value={openTasks} label="open tasks" />
        {children}
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-full border border-line bg-card px-4 py-2.5 text-[13px]">
      <strong className="text-[16px] font-semibold">{value}</strong>
      <span className="text-muted">{label}</span>
    </div>
  );
}
