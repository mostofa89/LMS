import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { PageLoader } from '../../components/ui/Spinner';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-dark-700">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => coursesApi.reports().then(r => r.data),
  });

  if (isLoading) return <PageLoader />;

  const { enrollment_trend = [], courses_by_category = [], users_by_role = [], total_revenue = 0 } = data || {};

  const roleData = users_by_role.map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: r.count
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-900">Reports & Analytics</h1>
        <p className="text-dark-500 mt-1">Platform insights and performance metrics.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${total_revenue.toFixed(2)}`, icon: DollarSign, color: 'emerald' },
          { label: '7-Day Enrollments', value: enrollment_trend.reduce((s, d) => s + d.count, 0), icon: TrendingUp, color: 'primary' },
          { label: 'Total Users', value: users_by_role.reduce((s, r) => s + r.count, 0), icon: Users, color: 'purple' },
          { label: 'Course Categories', value: courses_by_category.length, icon: BarChart3, color: 'amber' },
        ].map(kpi => (
          <div key={kpi.label} className="card p-5">
            <div className={`w-10 h-10 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-xl flex items-center justify-center mb-3`}>
              <kpi.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-dark-900">{kpi.value}</div>
            <div className="text-xs text-dark-400 font-medium mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Trend */}
        <div className="card lg:col-span-2">
          <h2 className="font-bold text-dark-900 mb-5">Enrollment Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={enrollment_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} dot={{ fill: '#0ea5e9', r: 4 }} name="Enrollments" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Users by Role */}
        <div className="card">
          <h2 className="font-bold text-dark-900 mb-5">Users by Role</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Courses by Category */}
      <div className="card">
        <h2 className="font-bold text-dark-900 mb-5">Courses by Category</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={courses_by_category} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Courses" radius={[6, 6, 0, 0]}>
              {courses_by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Raw Table */}
      <div className="card">
        <h2 className="font-bold text-dark-900 mb-4">Daily Enrollment Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Enrollments</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[...enrollment_trend].reverse().map((row, i, arr) => {
                const prev = arr[i + 1]?.count || 0;
                const diff = row.count - prev;
                return (
                  <tr key={row.date} className="border-b border-dark-50 hover:bg-dark-50">
                    <td className="py-3 px-3 text-dark-700 font-medium">{new Date(row.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td className="py-3 px-3 font-bold text-dark-900">{row.count}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-dark-400'}`}>
                        {diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
