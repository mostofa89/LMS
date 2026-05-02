import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookMarked, Clock, CheckCircle, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../api/courses';
import { PageLoader } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

export default function MyLearningPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => coursesApi.myEnrollments().then(r => r.data),
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, progress }) => coursesApi.updateProgress(id, progress),
    onSuccess: () => { qc.invalidateQueries(['my-enrollments']); toast.success('Progress updated!'); },
  });

  const enrollments = data?.results || data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-dark-900">My Learning</h1>
        <p className="text-dark-500 mt-1">Track your progress across all enrolled courses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Enrolled', value: enrollments.length, icon: BookMarked, color: 'text-primary-600 bg-primary-50' },
          { label: 'In Progress', value: enrollments.filter(e => e.status === 'active').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="card text-center p-4">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-dark-900">{s.value}</div>
            <div className="text-xs text-dark-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? <PageLoader /> : enrollments.length === 0 ? (
        <EmptyState icon={BookMarked} title="No enrollments yet"
          description="Start your learning journey by exploring our course catalog."
          action={<Link to="/courses" className="btn-primary">Browse Courses</Link>} />
      ) : (
        <div className="space-y-4">
          {enrollments.map(enrollment => {
            const course = enrollment.course_detail;
            if (!course) return null;
            return (
              <div key={enrollment.id} className="card hover:shadow-card-hover transition-all duration-200">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="w-full md:w-32 h-24 bg-gradient-to-br from-primary-600 to-primary-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookMarked size={28} className="text-primary-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <Link to={`/courses/${course.id}`} className="font-bold text-dark-900 hover:text-primary-700 transition-colors">
                          {course.title}
                        </Link>
                        <p className="text-sm text-dark-400 mt-0.5">By {course.instructor_name}</p>
                      </div>
                      <Badge variant={enrollment.status}>{enrollment.status}</Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-dark-500 mb-1.5">
                        <span>Progress</span>
                        <span className="font-semibold">{enrollment.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-dark-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link to={`/courses/${course.id}`} className="btn-primary py-2 px-4 text-sm">
                        <Play size={14} /> Continue
                      </Link>
                      <div className="flex gap-2">
                        {[25, 50, 75, 100].map(p => (
                          <button key={p} onClick={() => progressMutation.mutate({ id: enrollment.id, progress: p })}
                            disabled={enrollment.progress >= p}
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${enrollment.progress >= p ? 'bg-primary-100 text-primary-600' : 'bg-dark-100 text-dark-500 hover:bg-dark-200'}`}>
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
