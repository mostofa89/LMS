import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, KeyRound, Loader2, Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import useAuthStore from '../store/authStore';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState('profile');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register: reg, handleSubmit, formState: { errors } } = useForm({ defaultValues: {
    first_name: user?.first_name, last_name: user?.last_name,
    bio: user?.bio, phone: user?.phone,
    expertise: user?.expertise, linkedin_url: user?.linkedin_url, website_url: user?.website_url,
  }});
  const { register: regPw, handleSubmit: handlePwSubmit, formState: { errors: pwErrors }, reset: resetPw } = useForm();

  const updateMutation = useMutation({
    mutationFn: (data) => { const fd = new FormData(); Object.entries(data).forEach(([k,v]) => { if(v!==undefined&&v!==null) fd.append(k,v); }); return authApi.updateProfile(fd); },
    onSuccess: (res) => { updateUser(res.data); toast.success('Profile updated!'); qc.invalidateQueries(['profile']); },
    onError: () => toast.error('Update failed.'),
  });

  const pwMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => { toast.success('Password changed!'); resetPw(); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to change password.'),
  });

  const roleColors = { admin: 'from-violet-500 to-violet-700', instructor: 'from-emerald-500 to-emerald-700', student: 'from-sky-500 to-sky-700' };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account information.</p>
      </div>

      <div className="card flex items-center gap-5">
        <div className={`w-16 h-16 bg-gradient-to-br ${roleColors[user?.role] || roleColors.student} rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.first_name} {user?.last_name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge capitalize ${user?.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : user?.role === 'instructor' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>{user?.role}</span>
            {user?.is_email_verified
              ? <span className="badge bg-emerald-500/10 text-emerald-400"><ShieldCheck size={10}/> Verified</span>
              : <span className="badge bg-amber-500/10 text-amber-400"><Mail size={10}/> Unverified</span>
            }
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
        {[['profile','Edit Profile'],['password','Change Password']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab===k ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card">
          <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className={`input ${errors.first_name?'border-red-500':''}`} {...reg('first_name',{required:'Required'})} />
                {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className={`input ${errors.last_name?'border-red-500':''}`} {...reg('last_name',{required:'Required'})} />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
              <p className="text-xs text-slate-600 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 (555) 000-0000" {...reg('phone')} />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input resize-none h-24" placeholder="Tell us about yourself..." {...reg('bio')} />
            </div>
            {user?.role === 'instructor' && <>
              <div>
                <label className="label">Expertise</label>
                <input className="input" placeholder="e.g. Full Stack Development" {...reg('expertise')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input className="input" type="url" placeholder="https://linkedin.com/in/..." {...reg('linkedin_url')} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input className="input" type="url" placeholder="https://..." {...reg('website_url')} />
                </div>
              </div>
            </>}
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
              {updateMutation.isPending ? <Loader2 size={16} className="animate-spin"/> : <><Save size={15}/> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center">
              <KeyRound size={18} className="text-sky-400"/>
            </div>
            <div>
              <h3 className="font-bold text-white">Change Password</h3>
              <p className="text-xs text-slate-500">Keep your account secure.</p>
            </div>
          </div>
          <form onSubmit={handlePwSubmit(d => pwMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input className={`input pr-11 ${pwErrors.old_password?'border-red-500':''}`} type={showOld?'text':'password'} placeholder="Current password"
                  {...regPw('old_password',{required:'Required'})} />
                <button type="button" onClick={()=>setShowOld(!showOld)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showOld?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              {pwErrors.old_password && <p className="text-red-400 text-xs mt-1">{pwErrors.old_password.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input className={`input pr-11 ${pwErrors.new_password?'border-red-500':''}`} type={showNew?'text':'password'} placeholder="Min. 8 characters"
                  {...regPw('new_password',{required:'Required',minLength:{value:8,message:'Min 8 chars'}})} />
                <button type="button" onClick={()=>setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showNew?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              {pwErrors.new_password && <p className="text-red-400 text-xs mt-1">{pwErrors.new_password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className={`input ${pwErrors.new_password2?'border-red-500':''}`} type="password" placeholder="Confirm"
                {...regPw('new_password2',{required:'Required'})} />
              {pwErrors.new_password2 && <p className="text-red-400 text-xs mt-1">{pwErrors.new_password2.message}</p>}
            </div>
            <button type="submit" disabled={pwMutation.isPending} className="btn-primary">
              {pwMutation.isPending?<Loader2 size={16} className="animate-spin"/>:'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
