import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, RefreshCw, Copy, Check, ChevronDown, ChevronUp, Terminal, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';

export default function DevEmailPanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dev-emails'],
    queryFn: () => authApi.getDevEmails().then(r => r.data),
    refetchInterval: open ? 3000 : false, // Auto-refresh every 3s when panel is open
    retry: false,
  });

  const copyOtp = (otp, id) => {
    navigator.clipboard.writeText(otp).then(() => {
      setCopied(id);
      toast.success(`OTP ${otp} copied!`);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const isSmtp = data?.backend?.mode === 'smtp';
  const emails = data?.emails || [];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      {/* Toggle Button */}
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/30 transition-all">
        <div className="flex items-center gap-2">
          <Terminal size={15} />
          <span>Dev Email Panel</span>
          {emails.length > 0 && (
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-md font-bold">
              {emails.length}
            </span>
          )}
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-amber-400" />
              <span className="text-sm font-bold text-white">Sent Emails</span>
            </div>
            <button onClick={() => refetch()}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Backend status */}
          {data && (
            <div className={`px-4 py-2 text-xs flex items-center gap-2 border-b border-slate-800 ${isSmtp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {isSmtp ? <Wifi size={11} /> : <WifiOff size={11} />}
              {isSmtp
                ? `SMTP active — real emails sent via ${data.backend.host_user}`
                : `File mode — OTPs saved locally (no SMTP configured)`
              }
            </div>
          )}

          {/* Email list */}
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-xs text-slate-500">Loading...</div>
            ) : emails.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Mail size={24} className="text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No emails yet.</p>
                <p className="text-xs text-slate-600 mt-1">Trigger a password reset or verification to see OTPs here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {emails.map((email, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">{email.subject}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">To: {email.to}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{email.date}</p>
                      </div>
                      {email.otp && (
                        <button onClick={() => copyOtp(email.otp, i)}
                          className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 px-2.5 py-1.5 rounded-lg transition-all font-mono text-sm font-bold">
                          {copied === i ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          {email.otp}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/50">
            <p className="text-xs text-slate-600">
              {isSmtp
                ? 'Real emails sent — check your inbox'
                : <>Files in <code className="text-slate-500 font-mono">backend/sent_emails/</code></>
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
