import { useState, useRef } from 'react';
import { Mail, X, Loader2, ShieldCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import useAuthStore from '../../store/authStore';

export default function EmailVerificationBanner() {
  const { user, updateUser } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const qc = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: () => authApi.sendVerificationOtp(),
    onSuccess: () => { setShowOtp(true); toast.success('OTP sent to your email!'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to send OTP.'),
  });

  const verifyMutation = useMutation({
    mutationFn: (code) => authApi.verifyEmail(code),
    onSuccess: () => {
      updateUser({ is_email_verified: true });
      toast.success('Email verified! 🎉');
      setDismissed(true);
      qc.invalidateQueries(['profile']);
    },
    onError: () => { toast.error('Invalid OTP. Try again.'); setOtp(['','','','','','']); inputRefs.current[0]?.focus(); },
  });

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };
  const handlePaste = (e) => {
    const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (txt.length === 6) { setOtp(txt.split('')); inputRefs.current[5]?.focus(); }
  };

  if (!user || user.is_email_verified || dismissed) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Mail size={15} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          {!showOtp ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-amber-300">Verify your email address</p>
                <p className="text-xs text-amber-400/70 mt-0.5">Verify <span className="font-mono">{user.email}</span> to unlock all features.</p>
              </div>
              <button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-lg transition-colors">
                {sendMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                Send OTP
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-3">Enter the 6-digit OTP sent to <span className="font-mono">{user.email}</span></p>
              <div className="flex items-center gap-2 flex-wrap" onPaste={handlePaste}>
                <div className="flex gap-1.5">
                  {otp.map((d, i) => (
                    <input key={i} ref={el => inputRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      className="w-9 h-10 text-center text-base font-bold bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 transition-all" />
                  ))}
                </div>
                <button onClick={() => verifyMutation.mutate(otp.join(''))}
                  disabled={verifyMutation.isPending || otp.join('').length < 6}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors">
                  {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Verify'}
                </button>
                <button onClick={() => sendMutation.mutate()} className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors">Resend</button>
              </div>
            </div>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="text-amber-400/40 hover:text-amber-400 transition-colors flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
