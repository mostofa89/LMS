export default function StatCard({ icon: Icon, label, value, sub, color = 'sky', loading }) {
  const colors = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <div className="card hover:border-slate-700 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${colors[color]} border rounded-2xl flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        {sub !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${sub >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {sub >= 0 ? '↑' : '↓'} {Math.abs(sub)}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-24 skeleton rounded-lg mb-1" />
      ) : (
        <p className="text-3xl font-bold text-white mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      )}
      <p className="text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );
}
