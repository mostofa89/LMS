import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Save, ArrowLeft, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../api/courses';
import { PageLoader } from '../../components/ui/Spinner';

export default function CourseFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => coursesApi.categories().then(r => r.data.results || r.data) });
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', id], queryFn: () => coursesApi.detail(id).then(r => r.data), enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (course) reset({
      title: course.title, description: course.description, short_description: course.short_description,
      category: course.category, level: course.level, status: course.status,
      price: course.price, duration_hours: course.duration_hours,
      prerequisites: course.prerequisites, what_you_learn: course.what_you_learn,
      max_students: course.max_students || '',
    });
  }, [course, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? coursesApi.update(id, data) : coursesApi.create(data),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Course updated!' : 'Course created!');
      navigate(`/courses/${res.data.id}`);
    },
    onError: (err) => {
      const errs = err.response?.data;
      if (errs) Object.values(errs).flat().forEach(m => toast.error(m));
      else toast.error('Failed to save course.');
    },
  });

  const onSubmit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) fd.append(k, v); });
    if (data.thumbnail?.[0]) fd.set('thumbnail', data.thumbnail[0]);
    mutation.mutate(fd);
  };

  if (isEdit && loadingCourse) return <PageLoader />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-dark-100 rounded-xl transition-colors text-dark-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-900">{isEdit ? 'Edit Course' : 'Create New Course'}</h1>
          <p className="text-dark-500 mt-0.5">{isEdit ? 'Update course details and settings.' : 'Fill in the details to create a new course.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-5">
          <h2 className="font-bold text-dark-900 flex items-center gap-2"><BookOpen size={18} className="text-primary-600" /> Basic Information</h2>

          <div>
            <label className="label">Course Title *</label>
            <input className={`input ${errors.title ? 'border-red-400' : ''}`} placeholder="e.g. Complete React Development Course"
              {...register('title', { required: 'Title is required' })} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Short Description</label>
            <input className="input" placeholder="One-line summary (shown in course cards)"
              {...register('short_description')} />
          </div>

          <div>
            <label className="label">Full Description *</label>
            <textarea className={`input h-36 resize-none ${errors.description ? 'border-red-400' : ''}`}
              placeholder="Describe what students will learn, course content, and outcomes..."
              {...register('description', { required: 'Description is required' })} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" {...register('category')}>
                <option value="">Select category...</option>
                {cats?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level *</label>
              <select className={`input ${errors.level ? 'border-red-400' : ''}`} {...register('level', { required: true })}>
                <option value="">Select level...</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="label">Price (USD)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0 for free"
                {...register('price')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration (hours)</label>
              <input className="input" type="number" min="0" placeholder="Total hours"
                {...register('duration_hours')} />
            </div>
            <div>
              <label className="label">Max Students (optional)</label>
              <input className="input" type="number" min="1" placeholder="Unlimited"
                {...register('max_students')} />
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="card space-y-5">
          <h2 className="font-bold text-dark-900">Curriculum Details</h2>
          <div>
            <label className="label">What Students Will Learn</label>
            <textarea className="input h-24 resize-none" placeholder="Comma-separated list, e.g. React basics, State management, API integration, Deployment"
              {...register('what_you_learn')} />
            <p className="text-xs text-dark-400 mt-1">Separate items with commas.</p>
          </div>
          <div>
            <label className="label">Prerequisites</label>
            <textarea className="input h-20 resize-none" placeholder="What should students know before taking this course?"
              {...register('prerequisites')} />
          </div>
        </div>

        {/* Media */}
        <div className="card space-y-4">
          <h2 className="font-bold text-dark-900">Course Thumbnail</h2>
          <div>
            <label className="label">Upload Image</label>
            <input className="input py-2" type="file" accept="image/*" {...register('thumbnail')} />
            <p className="text-xs text-dark-400 mt-1">Recommended: 1280×720px, JPG or PNG. Max 5MB.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Course'}</>}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
