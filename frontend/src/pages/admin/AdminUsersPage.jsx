import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, Trash2, Shield, BookOpen, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { PageLoader } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role],
    queryFn: () => authApi.getUsers({ search, role }).then(r => r.data),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }) => authApi.updateUser(id, { is_active }),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User updated.'); },
  });

  const deleteUser = useMutation({
    mutationFn: (id) => authApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User deleted.'); },
    onError: () => toast.error('Failed to delete.'),
  });

  const users = data?.results || data || [];
  const roleIcons = { admin: Shield, instructor: BookOpen, student: GraduationCap };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage all platform users and permissions.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[['admin','Admins','violet'],['instructor','Instructors','emerald'],['student','Students','sky']].map(([r,l,c]) => {
          const count = users.filter(u => u.role === r).length;
          const Icon = roleIcons[r];
          const colors = { violet:'bg-violet-500/10 text-violet-400 border-violet-500/20', emerald:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', sky:'bg-sky-500/10 text-sky-400 border-sky-500/20' };
          return (
            <button key={r} onClick={() => setRole(role===r?'':r)}
              className={`card text-center transition-all hover:border-slate-600 cursor-pointer ${role===r?'border-sky-500/50':''}`}>
              <div className={`w-10 h-10 ${colors[c]} border rounded-2xl flex items-center justify-center mx-auto mb-2`}><Icon size={18}/></div>
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-xs text-slate-500">{l}</div>
            </button>
          );
        })}
      </div>

      <div className="card p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-10" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44 bg-slate-900" value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="student">Student</option>
        </select>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800">
                <tr>{['User','Role','Email Verified','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{user.full_name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Badge variant={user.role}>{user.role}</Badge></td>
                    <td className="px-5 py-4">
                      <span className={`badge ${user.is_email_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {user.is_email_verified ? '✓ Verified' : '⚠ Unverified'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${user.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{new Date(user.date_joined).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleActive.mutate({ id: user.id, is_active: !user.is_active })}
                          className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'hover:bg-amber-500/10 text-slate-500 hover:text-amber-400' : 'hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400'}`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}>
                          {user.is_active ? <UserX size={15}/> : <UserCheck size={15}/>}
                        </button>
                        <button onClick={() => { if(confirm(`Delete ${user.full_name}?`)) deleteUser.mutate(user.id); }}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-12 text-slate-500 text-sm">No users found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
