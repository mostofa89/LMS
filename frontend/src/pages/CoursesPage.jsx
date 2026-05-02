import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen } from 'lucide-react';
import { coursesApi } from '../api/courses';
import CourseCard from '../components/course/CourseCard';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => coursesApi.categories().then(r => r.data.results || r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['courses', debouncedSearch, level, category],
    queryFn: () => coursesApi.list({ search: debouncedSearch, level, category }).then(r => r.data),
  });

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(window._st);
    window._st = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const courses = data?.results || data || [];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Explore Courses</h1>
        <p className="text-slate-500">Discover expert-led courses to advance your skills.</p>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-10" placeholder="Search courses, topics, instructors..."
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <select className="input md:w-44 bg-slate-900" value={level} onChange={e => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          {['beginner','intermediate','advanced'].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
        </select>
        <select className="input md:w-52 bg-slate-900" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {cats?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {(search || level || category) && (
          <button onClick={() => { setSearch(''); setDebouncedSearch(''); setLevel(''); setCategory(''); }}
            className="btn-ghost text-xs text-red-400 hover:text-red-300 whitespace-nowrap">
            Clear
          </button>
        )}
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <p className="text-sm text-slate-500"><span className="font-bold text-slate-200">{courses.length}</span> courses found</p>
          {courses.length === 0
            ? <EmptyState icon={BookOpen} title="No courses found" description="Try adjusting your filters." />
            : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{courses.map(c => <CourseCard key={c.id} course={c} />)}</div>
          }
        </>
      )}
    </div>
  );
}
