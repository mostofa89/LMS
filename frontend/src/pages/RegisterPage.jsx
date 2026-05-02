import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, Loader2, CheckCircle, KeyRound, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import useAuthStore from '../store/authStore';

const features = [
  '500+ expert-led courses',
  'Progress tracking & certificates',
  'Role-based learning platform',
  'Industry-recognized curriculum',
];

const roleInfo = {
  student: {
    label: '🎓 Student',
    desc: 'Enroll in courses and track your learning progress.',
    needsKey: false,
    color: 'sky',
  },
  instructor: {
    label: '📚 Instructor',
    desc: 'Create and manage courses. Requires an instructor key.',
    needsKey: true,
    keyLabel: 'Instructor Registration Key',
    keyPlaceholder: 'Enter your instructor key',
    color: 'emerald',
  },
  admin: {
    label: '🛡️ Admin',
    desc: 'Full platform access. Requires an admin secret key.',
    needsKey: true,
    keyLabel: 'Admin Secret Key',
    keyPlaceholder: 'Enter the admin secret key',
    color: 'violet',
  },
};

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const password = watch('password');
  const selectedRole = watch('role') || '';

  const roleConfig = roleInfo[selectedRole];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      login(res.data.user, { access: res.data.access, refresh: res.data.refresh });
      toast.success('Welcome to EduFlow!');
      navigate('/dashboard');
    } catch (err) {
      const errs = err.response?.data;
      if (errs && typeof errs === 'object') {
        Object.entries(errs).forEach(([k, v]) => toast.error(Array.isArray(v) ? v[0] : v));
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-600/10 via-transparent to-violet-600/10" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">EduFlow</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Start your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
              journey today
            </span>
          </h1>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Join thousands of learners and educators on EduFlow.
          </p>
          <div className="space-y-3">
            {features.map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Role keys hint */}
          <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <KeyRound size={12} className="text-sky-400" /> Registration Keys
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Instructor key:</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">EDUFLOW-INSTRUCTOR-2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Admin key:</span>
                <span className="text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">EDUFLOW-ADMIN-2024</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative text-slate-700 text-xs">© 2024 EduFlow LMS</div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[420px] animate-fade-up py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">EduFlow</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
          <p className="text-slate-400 mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input className={`input ${errors.first_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Alex" autoComplete="given-name"
                  {...register('first_name', { required: 'Required' })} />
                {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className={`input ${errors.last_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Morgan" autoComplete="family-name"
                  {...register('last_name', { required: 'Required' })} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <input className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                type="email" placeholder="you@example.com" autoComplete="email"
                {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="label">I'm joining as</label>
              <select className={`input ${errors.role ? 'border-red-500' : ''}`}
                {...register('role', { required: 'Please select a role' })}>
                <option value="">Choose your role...</option>
                <option value="student">🎓 Student — I want to learn</option>
                <option value="instructor">📚 Instructor — I want to teach</option>
                <option value="admin">🛡️ Admin — Platform administrator</option>
              </select>
              {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
            </div>

            {/* Role description & secret key */}
            {roleConfig && (
              <div className={`rounded-xl border p-3.5 transition-all animate-fade-in
                ${roleConfig.color === 'sky' ? 'bg-sky-500/5 border-sky-500/20' :
                  roleConfig.color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  'bg-violet-500/5 border-violet-500/20'}`}>
                <p className={`text-xs font-medium mb-1
                  ${roleConfig.color === 'sky' ? 'text-sky-400' :
                    roleConfig.color === 'emerald' ? 'text-emerald-400' : 'text-violet-400'}`}>
                  <Info size={11} className="inline mr-1" />{roleConfig.desc}
                </p>
              </div>
            )}

            {roleConfig?.needsKey && (
              <div className="animate-fade-in">
                <label className="label">{roleConfig.keyLabel}</label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className={`input pl-10 pr-11 font-mono tracking-wider ${errors.secret_key ? 'border-red-500 focus:ring-red-500' : ''}`}
                    type={showKey ? 'text' : 'password'}
                    placeholder={roleConfig.keyPlaceholder}
                    {...register('secret_key', { required: 'Registration key is required for this role' })} />
                  <button type="button" onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.secret_key && <p className="text-red-400 text-xs mt-1">{errors.secret_key.message}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className={`input pr-11 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" autoComplete="new-password"
                  {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label">Confirm Password</label>
              <input className={`input ${errors.password2 ? 'border-red-500 focus:ring-red-500' : ''}`}
                type="password" placeholder="Repeat password" autoComplete="new-password"
                {...register('password2', { required: 'Required', validate: v => v === password || 'Passwords do not match' })} />
              {errors.password2 && <p className="text-red-400 text-xs mt-1">{errors.password2.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold">Sign in</Link>
          </p>

          {/* Mobile keys hint */}
          <div className="lg:hidden mt-6 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <KeyRound size={11} /> Registration Keys
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between"><span className="text-slate-600">Instructor:</span><span className="text-emerald-400">EDUFLOW-INSTRUCTOR-2024</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Admin:</span><span className="text-violet-400">EDUFLOW-ADMIN-2024</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
