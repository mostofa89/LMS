export default function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };
  return <div className={`${s[size]} border-slate-700 border-t-sky-500 rounded-full animate-spin ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
