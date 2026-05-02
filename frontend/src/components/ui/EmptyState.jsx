export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-5">
          <Icon size={28} className="text-slate-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}
