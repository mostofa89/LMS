export default function Badge({ children, variant }) {
  const v = variant || (typeof children === 'string' ? children.toLowerCase() : 'default');
  const map = {
    default: 'bg-slate-800 text-slate-400',
    published: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    archived: 'bg-slate-800 text-slate-500',
    active: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dropped: 'bg-red-500/10 text-red-400 border border-red-500/20',
    beginner: 'bg-emerald-500/10 text-emerald-400',
    intermediate: 'bg-amber-500/10 text-amber-400',
    advanced: 'bg-red-500/10 text-red-400',
    admin: 'bg-violet-500/10 text-violet-400',
    instructor: 'bg-emerald-500/10 text-emerald-400',
    student: 'bg-sky-500/10 text-sky-400',
    primary: 'bg-sky-500/10 text-sky-400',
    success: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    danger: 'bg-red-500/10 text-red-400',
  };
  return <span className={`badge ${map[v] || map.default}`}>{children}</span>;
}
