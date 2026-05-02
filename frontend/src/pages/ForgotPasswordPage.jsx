import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GraduationCap, ArrowLeft, Loader2, Mail, ShieldCheck, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import DevEmailPanel from '../components/ui/DevEmailPanel';
import { authApi } from '../api/auth';

const STEPS = ['email', 'otp', 'password', 'done'];

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const pw = watch('new_password');

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (txt.length === 6) {
      setOtp(txt.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const sendOtp = async (data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setStep('otp');
      toast.success('OTP sent! Check your email.');
    } catch (e) {
      toast.error('Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter all 6 digits.');
    setOtpLoading(true);
    try {
      await authApi.verifyResetOtp(email, code);
      setStep('password');
      toast.success('OTP verified!');
    } catch {
      toast.error('Invalid or expired OTP. Try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setOtpLoading(false); }
  };

  const resetPassword = async (data) => {
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp: otp.join(''), new_password: data.new_password, new_password2: data.new_password2 });
      setStep('done');
      toast.success('Password reset successfully!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed. Please start over.');
    } finally { setLoading(false); }
  };

  const stepIdx = STEPS.indexOf(step);

  return (
    <>
    <div className="min-h-screen mesh-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">EduFlow</span>
        </div>

        {/* Progress */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-8">
            {[{ icon: Mail, label: 'Email' }, { icon: ShieldCheck, label: 'Verify OTP' }, { icon: KeyRound, label: 'New Password' }].map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-1.5 ${i < stepIdx ? 'text-sky-400' : i === stepIdx ? 'text-white' : 'text-slate-600'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${i < stepIdx ? 'bg-sky-500 text-white' : i === stepIdx ? 'bg-sky-500/20 border-2 border-sky-500 text-sky-400' : 'bg-slate-800 border border-slate-700 text-slate-600'}`}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${i < stepIdx ? 'bg-sky-500' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="card-glass">
          {step === 'email' && (
            <>
              <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mb-5">
                <Mail size={22} className="text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a 6-digit OTP to reset your password.</p>
              <form onSubmit={handleSubmit(sendOtp)} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input className={`input ${errors.email ? 'border-red-500' : ''}`} type="email" placeholder="you@example.com"
                    {...register('email', { required: 'Email required' })} />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-5">
                <ShieldCheck size={22} className="text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
              <p className="text-slate-400 text-sm mb-1">We sent a 6-digit code to</p>
              <p className="text-sky-400 font-semibold text-sm mb-6">{email}</p>

              <div className="flex gap-2.5 justify-center mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => inputRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`otp-input ${digit ? 'border-sky-500 bg-sky-500/5' : ''}`} />
                ))}
              </div>

              <button onClick={verifyOtp} disabled={otpLoading || otp.join('').length < 6} className="btn-primary w-full py-3">
                {otpLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify OTP'}
              </button>

              <button onClick={() => { sendOtp({ email }); setOtp(['','','','','','']); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-4 transition-colors">
                Didn't receive it? Resend OTP
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-5">
                <KeyRound size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">New password</h2>
              <p className="text-slate-400 text-sm mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleSubmit(resetPassword)} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input className={`input pr-11 ${errors.new_password ? 'border-red-500' : ''}`}
                      type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                      {...register('new_password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.new_password && <p className="text-red-400 text-xs mt-1">{errors.new_password.message}</p>}
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input className={`input ${errors.new_password2 ? 'border-red-500' : ''}`}
                    type="password" placeholder="Repeat password"
                    {...register('new_password2', { required: 'Required', validate: v => v === pw || 'Passwords do not match' })} />
                  {errors.new_password2 && <p className="text-red-400 text-xs mt-1">{errors.new_password2.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password reset!</h2>
              <p className="text-slate-400 text-sm mb-6">Your password has been updated successfully.</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
                Go to Sign In
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
    <DevEmailPanel />
    </>
  );
}
