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
      className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md hover:scale-[1.02]"
    >
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

      <p className="mt-2 text-slate-500">
        {description}
      </p>
    </Link>
  );
}