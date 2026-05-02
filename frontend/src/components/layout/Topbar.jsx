import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

const roleColors = { admin: 'from-violet-500 to-violet-700', instructor: 'from-emerald-500 to-emerald-700', student: 'from-sky-500 to-sky-700' };
const roleBadge = { admin: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', instructor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', student: 'bg-sky-500/10 text-sky-400 border border-sky-500/20' };

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try { await authApi.logout(refresh); } catch {}
    logout();
    navigate('/login');
    toast.success('Signed out successfully');
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800/60 flex items-center px-5 gap-4 sticky top-0 z-10">
      <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative w-9 h-9 hover:bg-slate-800 rounded-xl flex items-center justify-center transition-colors text-slate-400 hover:text-slate-200">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-sky-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 hover:bg-slate-800/60 rounded-xl px-2.5 py-1.5 transition-colors">
            <div className={`w-8 h-8 bg-gradient-to-br ${roleColors[user?.role] || roleColors.student} rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-200 leading-tight">{user?.first_name} {user?.last_name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium capitalize ${roleBadge[user?.role]}`}>{user?.role}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 py-1.5 z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-slate-200">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                {!user?.is_email_verified && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">Email unverified</span>
                )}
              </div>
              <div className="py-1">
                <Link to="/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                  <User size={15} className="text-slate-500" /> My Profile
                </Link>
                <Link to="/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                  <Settings size={15} className="text-slate-500" /> Settings
                </Link>
              </div>
              <div className="border-t border-slate-800 pt-1">
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full">
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
