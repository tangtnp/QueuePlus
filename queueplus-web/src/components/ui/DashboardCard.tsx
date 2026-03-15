// DashboardCard.tsx
import { Link } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  to: string;
}

export default function DashboardCard({
  title,
  description,
  to,
}: DashboardCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-2xl bg-white p-6 shadow-sm transition hover:scale-[1.02] hover:shadow-md dark:bg-slate-800 dark:shadow-none dark:hover:bg-slate-700/80"
    >
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>

      <p className="mt-2 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
}