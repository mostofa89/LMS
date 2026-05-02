import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ListChecks } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { PageLoader } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

export default function AdminEnrollmentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enrollments', search, status],
    queryFn: () => coursesApi.adminEnrollments({ search, status }).then(r => r.data),
  });

  const enrollments = data?.results || data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-900">Enrollments</h1>
        <p className="text-dark-500 mt-1">View and manage all course enrollments.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: enrollments.length, color: 'primary' },
          { label: 'Active', value: enrollments.filter(e => e.status === 'active').length, color: 'emerald' },
          { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, color: 'purple' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-dark-900">{s.value}</div>
            <div className="text-xs text-dark-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input className="input pl-10" placeholder="Search by student or course..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input md:w-44" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {['Student', 'Course', 'Status', 'Progress', 'Enrolled', 'Completed'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-dark-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {enrollments.map(e => (
                <tr key={e.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-dark-800 text-sm">{e.student_name}</div>
                    <div className="text-xs text-dark-400">{e.student_email}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-dark-700 max-w-48">
                    <div className="truncate">{e.course_detail?.title}</div>
                    <div className="text-xs text-dark-400">{e.course_detail?.instructor_name}</div>
                  </td>
                  <td className="px-5 py-4"><Badge variant={e.status}>{e.status}</Badge></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-dark-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-dark-600">{e.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-dark-500">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-xs text-dark-500">{e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {enrollments.length === 0 && <div className="text-center py-12 text-dark-400 text-sm">No enrollments found.</div>}
        </div>
      )}
    </div>
  );
}
