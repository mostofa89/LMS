import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, BookOpen, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../api/courses';
import { PageLoader } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

export default function ManageCoursesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['manage-courses'],
    queryFn: () => coursesApi.list().then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => coursesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['manage-courses']); toast.success('Course deleted.'); },
    onError: () => toast.error('Failed to delete course.'),
  });

  const courses = data?.results || data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-900">Manage Courses</h1>
          <p className="text-dark-500 mt-1">Create and manage your course catalog.</p>
        </div>
        <Link to="/courses/new" className="btn-primary">
          <PlusCircle size={16} /> New Course
        </Link>
      </div>

      {isLoading ? <PageLoader /> : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet"
          description="Create your first course to start teaching."
          action={<Link to="/courses/new" className="btn-primary"><PlusCircle size={16} /> Create Course</Link>} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {['Course', 'Category', 'Level', 'Status', 'Students', 'Price', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-dark-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {courses.map(course => (
                <tr key={course.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-dark-900 text-sm">{course.title}</div>
                    <div className="text-xs text-dark-400 mt-0.5">{course.short_description?.slice(0, 50)}...</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-dark-600">{course.category_name || '—'}</td>
                  <td className="px-5 py-4"><Badge variant={course.level}>{course.level}</Badge></td>
                  <td className="px-5 py-4"><Badge variant={course.status}>{course.status}</Badge></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-dark-600">
                      <Users size={14} className="text-dark-400" />
                      {course.enrollment_count}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-dark-800">
                    {course.price == 0 ? <span className="text-emerald-600">Free</span> : `$${course.price}`}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/courses/${course.id}`} className="p-1.5 hover:bg-primary-50 rounded-lg text-dark-400 hover:text-primary-600 transition-colors" title="View">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/courses/${course.id}/edit`} className="p-1.5 hover:bg-amber-50 rounded-lg text-dark-400 hover:text-amber-600 transition-colors" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => { if (confirm(`Delete "${course.title}"?`)) deleteMutation.mutate(course.id); }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-dark-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
