import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen } from 'lucide-react';
import Badge from '../ui/Badge';

export default function CourseCard({ course }) {
  const levelGradient = { beginner: 'from-emerald-600/30 to-emerald-900/50', intermediate: 'from-amber-600/30 to-amber-900/50', advanced: 'from-red-600/30 to-red-900/50' };

  return (
    <Link to={`/courses/${course.id}`}
      className="card group hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 flex flex-col p-0 overflow-hidden">
      {/* Thumbnail */}
      <div className="h-44 relative overflow-hidden bg-slate-800">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${levelGradient[course.level] || levelGradient.beginner} flex items-center justify-center`}>
            <BookOpen size={36} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant={course.status}>{course.status}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          {Number(course.price) === 0
            ? <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">Free</span>
            : <span className="bg-black/50 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg">${course.price}</span>
          }
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {course.category_name && (
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-2">{course.category_name}</span>
        )}
        <h3 className="font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-sky-400 transition-colors leading-snug">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">{course.short_description}</p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white text-xs font-bold">
            {course.instructor_name?.[0]}
          </div>
          <span className="text-xs text-slate-500 font-medium">{course.instructor_name}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-600">
          <div className="flex items-center gap-1.5"><Clock size={12} /><span>{course.duration_hours}h</span></div>
          <div className="flex items-center gap-1.5"><Users size={12} /><span>{course.enrollment_count}</span></div>
          <Badge variant={course.level}>{course.level}</Badge>
        </div>
      </div>
    </Link>
  );
}
