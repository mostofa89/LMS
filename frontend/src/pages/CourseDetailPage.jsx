import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Users, BarChart2, Star, CheckCircle, BookOpen, Globe, Loader2, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../api/courses';
import useAuthStore from '../store/authStore';
import { PageLoader } from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.detail(id).then(r => r.data),
  });

  const { data: myEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => coursesApi.myEnrollments().then(r => r.data),
    enabled: user?.role === 'student',
  });

  const enrollment = myEnrollments?.find?.(e => e.course === id || e.course_detail?.id === id);

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(id),
    onSuccess: () => {
      toast.success('Enrolled successfully!');
      qc.invalidateQueries(['course', id]);
      qc.invalidateQueries(['my-enrollments']);
      qc.invalidateQueries(['dashboard']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Enrollment failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => coursesApi.delete(id),
    onSuccess: () => { toast.success('Course deleted.'); navigate('/manage-courses'); },
    onError: () => toast.error('Failed to delete course.'),
  });

  if (isLoading) return <PageLoader />;
  if (!course) return <div className="text-center py-20 text-dark-500">Course not found.</div>;

  const canManage = user?.role === 'admin' || (user?.role === 'instructor' && course.instructor === user?.id);
  const isStudent = user?.role === 'student';
  const isEnrolled = course.is_enrolled || !!enrollment;

  const learns = course.what_you_learn ? course.what_you_learn.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dark-900 to-primary-900 rounded-3xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {course.category_detail && <Badge variant="primary">{course.category_detail.name}</Badge>}
            <Badge variant={course.level}>{course.level}</Badge>
            <Badge variant={course.status}>{course.status}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{course.title}</h1>
          <p className="text-primary-200 text-lg mb-6 max-w-2xl">{course.short_description}</p>
          <div className="flex flex-wrap items-center gap-6 text-primary-300 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center font-bold text-white text-xs">
                {course.instructor_detail?.full_name?.[0]}
              </div>
              <span>{course.instructor_detail?.full_name}</span>
            </div>
            <div className="flex items-center gap-1.5"><Clock size={14} /><span>{course.duration_hours}h total</span></div>
            <div className="flex items-center gap-1.5"><Users size={14} /><span>{course.enrollment_count} students</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {learns.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-dark-900 mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {learns.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-dark-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="text-xl font-bold text-dark-900 mb-4">About this course</h2>
            <p className="text-dark-600 leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>

          {course.prerequisites && (
            <div className="card">
              <h2 className="text-xl font-bold text-dark-900 mb-3">Prerequisites</h2>
              <p className="text-dark-600 text-sm">{course.prerequisites}</p>
            </div>
          )}
        </div>

        {/* Sidebar card */}
        <div>
          <div className="card sticky top-24 space-y-5">
            <div className="text-3xl font-bold text-dark-900">
              {course.price == 0 ? <span className="text-emerald-600">Free</span> : `$${course.price}`}
            </div>

            {isStudent && course.status === 'published' && (
              isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                    <CheckCircle size={18} /> Enrolled
                  </div>
                  {enrollment && (
                    <div>
                      <div className="flex justify-between text-xs text-dark-500 mb-1">
                        <span>Progress</span><span>{enrollment.progress}%</span>
                      </div>
                      <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending} className="btn-primary w-full py-3">
                  {enrollMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Enroll Now'}
                </button>
              )
            )}

            {canManage && (
              <div className="flex gap-2">
                <button onClick={() => navigate(`/courses/${id}/edit`)} className="btn-secondary flex-1">
                  <Edit size={15} /> Edit
                </button>
                <button onClick={() => { if (confirm('Delete this course?')) deleteMutation.mutate(); }} className="btn-danger">
                  <Trash2 size={15} />
                </button>
              </div>
            )}

            <hr className="border-dark-100" />

            <div className="space-y-3 text-sm text-dark-600">
              <div className="flex justify-between"><span className="text-dark-400">Level</span><Badge variant={course.level}>{course.level}</Badge></div>
              <div className="flex justify-between"><span className="text-dark-400">Duration</span><span className="font-medium">{course.duration_hours} hours</span></div>
              <div className="flex justify-between"><span className="text-dark-400">Students</span><span className="font-medium">{course.enrollment_count}</span></div>
              {course.max_students && <div className="flex justify-between"><span className="text-dark-400">Capacity</span><span className="font-medium">{course.max_students}</span></div>}
            </div>

            {course.instructor_detail && (
              <div className="pt-4 border-t border-dark-100">
                <p className="text-xs font-semibold text-dark-400 mb-3 uppercase tracking-wide">Instructor</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {course.instructor_detail.full_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-dark-800">{course.instructor_detail.full_name}</p>
                    <p className="text-xs text-dark-400">{course.instructor_detail.expertise}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
