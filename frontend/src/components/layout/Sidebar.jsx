import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, Users, BarChart3, PlusCircle, BookMarked, ListChecks, Settings, X, Layers, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NavItem = ({ to, icon: Icon, label, end }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
    <Icon size={17} strokeWidth={2} />
    <span>{label}</span>
  </NavLink>
);

const SectionLabel = ({ label }) => (
  <div className="px-3 pt-5 pb-1.5">
    <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">{label}</span>
  </div>
);

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const role = user?.role;
  const roleColors = { admin: 'from-violet-500 to-violet-700', instructor: 'from-emerald-500 to-emerald-700', student: 'from-sky-500 to-sky-700' };

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800/60
      flex flex-col transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Edu<span className="text-sky-400">Flow</span></span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <SectionLabel label="Overview" />
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
        <NavItem to="/courses" icon={BookOpen} label="Courses" />

        {role === 'student' && (
          <>
            <SectionLabel label="My Learning" />
            <NavItem to="/my-learning" icon={BookMarked} label="My Enrollments" />
          </>
        )}

        {(role === 'instructor' || role === 'admin') && (
          <>
            <SectionLabel label="Teaching" />
            <NavItem to="/manage-courses" icon={Layers} label="Manage Courses" />
            <NavItem to="/courses/new" icon={PlusCircle} label="New Course" />
          </>
        )}

        {role === 'admin' && (
          <>
            <SectionLabel label="Administration" />
            <NavItem to="/admin/users" icon={Users} label="Users" />
            <NavItem to="/admin/enrollments" icon={ListChecks} label="Enrollments" />
            <NavItem to="/admin/reports" icon={BarChart3} label="Reports" />
          </>
        )}

        <SectionLabel label="Account" />
        <NavItem to="/profile" icon={Settings} label="Profile Settings" />
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-slate-800/60">
        <div className={`bg-gradient-to-br ${roleColors[role] || roleColors.student} p-px rounded-2xl`}>
          <div className="bg-slate-900 rounded-[15px] p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 bg-gradient-to-br ${roleColors[role] || roleColors.student} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                <Zap size={10} className="text-sky-500" />{role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
