import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, ArrowRight, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      login(res.data.user, { access: res.data.access, refresh: res.data.refresh });
      toast.success(`Welcome back, ${res.data.user.first_name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid email or password.';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const fillDemo = (email, password) => { setValue('email', email); setValue('password', password); };

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-transparent to-violet-600/10" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduFlow</span>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-2 mb-6">
            <Zap size={14} className="text-sky-400" />
            <span className="text-sky-300 text-sm font-medium">Industry-grade LMS Platform</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-5">
            Learn without<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">limits.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Access 500+ expert-led courses, track your progress, and earn certificates that matter.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[['500+','Courses'],['50k+','Learners'],['200+','Instructors']].map(([v,l]) => (
              <div key={l} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white mb-0.5">{v}</div>
                <div className="text-slate-400 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          {['React','Django','JWT','REST API'].map(t => (
            <span key={t} className="bg-white/5 border border-white/10 text-slate-400 text-xs px-3 py-1.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">EduFlow</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Sign in</h2>
          <p className="text-slate-400 mb-8">Continue your learning journey.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                type="email" placeholder="you@example.com" autoComplete="email"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-sky-400 hover:text-sky-300 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <input className={`input pr-11 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2 rounded-xl">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold">Create one free</Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Quick Demo Access</p>
            <div className="space-y-2">
              {[
                { label: 'Admin', email: 'admin@eduflow.com', pw: 'Admin@123', color: 'violet' },
                { label: 'Instructor', email: 'sarah@eduflow.com', pw: 'Pass@123', color: 'emerald' },
                { label: 'Student', email: 'student1@eduflow.com', pw: 'Pass@123', color: 'sky' },
              ].map(({ label, email, pw, color }) => (
                <button key={label} type="button"
                  onClick={() => fillDemo(email, pw)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${color === 'violet' ? 'bg-violet-400' : color === 'emerald' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                    <span className="text-xs font-semibold text-slate-300">{label}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono group-hover:text-slate-400">{email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-2.5 text-center">Click a role to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
