export default function StatCard({ title, value, subtitle, accent = 'bg-brand-500' }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle ? <p className="mt-2 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <span className={`h-3 w-3 rounded-full ${accent}`} />
      </div>
    </div>
  );
}
