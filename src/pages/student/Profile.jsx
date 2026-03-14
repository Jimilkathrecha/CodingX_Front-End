import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  User, Camera, Mail, Phone, Lock, Save, Eye, EyeOff,
  Zap, Award, BookOpen, Edit3, Check, X, Plus, Trash2, RefreshCw
} from 'lucide-react';
import { userService, uploadService, authService } from '../../services/index';
import { getMe } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL',
  'Express', 'Next.js', 'Vue.js', 'Django', 'FastAPI', 'Docker', 'AWS', 'Git',
  'REST APIs', 'GraphQL', 'Tailwind CSS', 'Machine Learning', 'Data Science',
];

export default function StudentProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw,     setShowNewPw]     = useState(false);
  const [skills,        setSkills]        = useState(user?.skills || []);
  const [skillInput,    setSkillInput]    = useState('');
  const [activeTab,     setActiveTab]     = useState('profile');
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name:  user?.name  || '',
      phone: user?.phone || '',
      bio:   user?.bio   || '',
    },
  });

  const { register: regPw, handleSubmit: handlePwSubmit, formState: { errors: pwErrors }, watch: watchPw, reset: resetPw } = useForm();

  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone || '', bio: user.bio || '' });
      setSkills(user.skills || []);
    }
  }, [user, reset]);

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Avatar must be under 3MB'); return; }
    try {
      setAvatarLoading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await uploadService.single(file, 'avatar');
      await userService.updateProfile({ avatar: { url: res.data.url, publicId: res.data.public_id } });
      await dispatch(getMe());
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
    finally { setAvatarLoading(false); }
  };

  // Save profile
  const onSaveProfile = async (data) => {
    try {
      setSavingProfile(true);
      await userService.updateProfile({ ...data, skills });
      await dispatch(getMe());
      toast.success('Profile saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSavingProfile(false); }
  };

  // Change password
  const onChangePassword = async (data) => {
    try {
      setSavingPassword(true);
      await authService.updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      resetPw();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPassword(false); }
  };

  // Skills
  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s || skills.includes(s) || skills.length >= 20) return;
    setSkills(prev => [...prev, s]);
    setSkillInput('');
  };
  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  const tabs = [
    { id: 'profile',  label: 'Profile' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account information and preferences</p>
      </motion.div>

      {/* Stats strip */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="card p-5 flex items-center gap-6 flex-wrap">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border-2 border-brand-500/30 overflow-hidden flex items-center justify-center">
            {avatarLoading ? (
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand-400 font-bold text-3xl">{user?.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors shadow-lg">
            <Camera size={14} className="text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* User info + stats */}
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl truncate">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-brand-400 font-semibold text-sm">
              <Zap size={13} />{user?.points || 0} pts
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <BookOpen size={13} />{user?.enrolledInternships?.length || 0} programs
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              <Award size={13} />{user?.badges?.length || 0} badges
            </div>
          </div>
        </div>

        <span className="badge-brand text-xs capitalize self-start">{user?.role}</span>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-5">
            <div className="card p-6 space-y-5">
              <h3 className="text-white font-semibold">Personal Information</h3>

              <div>
                <label className="label">Full Name *</label>
                <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                  placeholder="Your full name" className="input" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email</label>
                <input value={user?.email || ''} disabled className="input opacity-50 cursor-not-allowed" />
                <p className="text-gray-600 text-xs mt-1">Email cannot be changed. Contact admin if needed.</p>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input {...register('phone')} placeholder="+91 9876543210" className="input" />
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea {...register('bio')} rows={3}
                  placeholder="Tell mentors a bit about yourself, your background, and what you want to learn…"
                  className="input resize-none" maxLength={500} />
              </div>
            </div>

            {/* Skills */}
            <div className="card p-6 space-y-4">
              <h3 className="text-white font-semibold">Skills</h3>

              {/* Current skills */}
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {skills.length === 0 && <p className="text-gray-600 text-sm">Add your technical skills</p>}
                {skills.map(s => (
                  <span key={s} className="badge-brand text-sm flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add skill input */}
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                  placeholder="Type a skill and press Enter…"
                  className="input flex-1 py-2.5 text-sm"
                  maxLength={30}
                  list="skill-suggestions"
                />
                <datalist id="skill-suggestions">
                  {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => <option key={s} value={s} />)}
                </datalist>
                <button type="button" onClick={() => addSkill(skillInput)} className="btn-secondary px-4 py-2.5">
                  <Plus size={16} />
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                  <button key={s} type="button" onClick={() => addSkill(s)}
                    className="badge text-xs bg-surface-elevated border border-surface-border text-gray-400 hover:text-white hover:border-brand-500/40 transition-all cursor-pointer">
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2 min-w-[140px] justify-center">
              {savingProfile
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                : <><Save size={15} />Save Profile</>
              }
            </button>
          </form>
        </motion.div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handlePwSubmit(onChangePassword)} className="card p-6 space-y-5">
            <h3 className="text-white font-semibold">Change Password</h3>

            <div>
              <label className="label">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  {...regPw('currentPassword', { required: 'Current password is required' })}
                  placeholder="Enter current password"
                  className="input pr-11"
                />
                <button type="button" onClick={() => setShowCurrentPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.currentPassword && <p className="text-red-400 text-xs mt-1">{pwErrors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="label">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  {...regPw('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase and a number' }
                  })}
                  placeholder="Min 8 chars, uppercase, number"
                  className="input pr-11"
                />
                <button type="button" onClick={() => setShowNewPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.newPassword && <p className="text-red-400 text-xs mt-1">{pwErrors.newPassword.message}</p>}
            </div>

            <div>
              <label className="label">Confirm New Password *</label>
              <input
                type="password"
                {...regPw('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: v => v === watchPw('newPassword') || 'Passwords do not match',
                })}
                placeholder="Re-enter new password"
                className="input"
              />
              {pwErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{pwErrors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={savingPassword} className="btn-primary flex items-center gap-2 min-w-[160px] justify-center">
              {savingPassword
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Changing…</>
                : <><Lock size={15} />Change Password</>
              }
            </button>
          </form>

          {/* Account info */}
          <div className="card p-6 mt-5 space-y-3">
            <h3 className="text-white font-semibold">Account Info</h3>
            {[
              { label: 'Member since',    value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—' },
              { label: 'Email verified',  value: user?.isEmailVerified ? '✓ Verified' : '✗ Not verified' },
              { label: 'Account status',  value: user?.isActive ? 'Active' : 'Inactive' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-surface-border/50 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}