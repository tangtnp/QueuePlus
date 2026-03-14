interface MonitorJsonCardProps {
  title: string;
  data: any;
}

export default function MonitorJsonCard({
  title,
  data,
}: MonitorJsonCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="p-6">
        <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}