import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, GraduationCap, TrendingUp, BookMarked, CheckCircle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../api/courses';
import useAuthStore from '../store/authStore';
import StatCard from '../components/ui/StatCard';
import { PageLoader } from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => coursesApi.dashboard().then(r => r.data) });
  const d = data || {};
  const role = user?.role;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{greeting()}, {user?.first_name} 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">Here's what's happening on your platform.</p>
        </div>
        <div className="flex gap-2">
          {role === 'student' && <Link to="/courses" className="btn-primary">Browse Courses</Link>}
          {(role === 'instructor' || role === 'admin') && <Link to="/courses/new" className="btn-primary">+ New Course</Link>}
          {role === 'admin' && <Link to="/admin/reports" className="btn-secondary">Reports</Link>}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {role === 'admin' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={d.total_users} color="sky" />
              <StatCard icon={GraduationCap} label="Students" value={d.total_students} color="emerald" />
              <StatCard icon={BookOpen} label="Total Courses" value={d.total_courses} color="violet" />
              <StatCard icon={TrendingUp} label="Enrollments" value={d.total_enrollments} color="amber" />
            </div>
          )}
          {role === 'instructor' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Layers} label="My Courses" value={d.total_courses} color="sky" />
              <StatCard icon={BookOpen} label="Published" value={d.published_courses} color="emerald" />
              <StatCard icon={Users} label="My Students" value={d.total_students} color="violet" />
              <StatCard icon={CheckCircle} label="Completions" value={d.completed_enrollments} color="amber" />
            </div>
          )}
          {role === 'student' && (
            <div className="grid grid-cols-3 gap-4">
              <StatCard icon={BookMarked} label="Enrolled" value={d.total_enrollments} color="sky" />
              <StatCard icon={TrendingUp} label="In Progress" value={d.active_enrollments} color="amber" />
              <StatCard icon={CheckCircle} label="Completed" value={d.completed_enrollments} color="emerald" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Enrollments */}
            {(role === 'admin' || role === 'instructor') && d.recent_enrollments?.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-white">Recent Enrollments</h2>
                  {role === 'admin' && <Link to="/admin/enrollments" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">View all →</Link>}
                </div>
                <div className="space-y-2.5">
                  {d.recent_enrollments.map(e => (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                      <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {e.student_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{e.student_name}</p>
                        <p className="text-xs text-slate-500 truncate">{e.course_detail?.title}</p>
                      </div>
                      <Badge variant={e.status}>{e.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Courses */}
            {role === 'admin' && d.top_courses?.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-white">Top Courses</h2>
                  <Link to="/courses" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">View all →</Link>
                </div>
                <div className="space-y-2.5">
                  {d.top_courses.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                      <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{c.title}</p>
                        <p className="text-xs text-slate-500">{c.enrollment_count} students</p>
                      </div>
                      <Badge variant={c.status}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor courses */}
            {role === 'instructor' && d.my_courses?.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-white">My Courses</h2>
                  <Link to="/manage-courses" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">Manage →</Link>
                </div>
                <div className="space-y-2.5">
                  {d.my_courses.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen size={14} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{c.title}</p>
                        <p className="text-xs text-slate-500">{c.enrollment_count} students enrolled</p>
                      </div>
                      <Badge variant={c.status}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student enrollments */}
            {role === 'student' && d.my_enrollments?.length > 0 && (
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-white">Continue Learning</h2>
                  <Link to="/my-learning" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">View all →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {d.my_enrollments.map(e => (
                    <Link to={`/courses/${e.course}`} key={e.id}
                      className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all group">
                      <p className="font-semibold text-slate-200 text-sm mb-3 group-hover:text-sky-400 transition-colors truncate">
                        {e.course_detail?.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{e.progress}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {role === 'student' && !d.my_enrollments?.length && (
              <div className="card lg:col-span-2 text-center py-14">
                <BookOpen size={36} className="text-slate-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-300 mb-2">Start your learning journey</h3>
                <p className="text-slate-500 text-sm mb-5">Browse expert-led courses and enroll for free.</p>
                <Link to="/courses" className="btn-primary inline-flex">Browse Courses</Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
