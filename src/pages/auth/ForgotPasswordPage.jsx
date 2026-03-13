import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Code2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/index';
import toast from 'react-hot-toast';

// ── Forgot Password ───────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 bg-grid-pattern bg-grid">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center glow"><Code2 size={20} className="text-white" /></div>
            <span className="text-white font-bold text-xl">CodingX</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-gray-400 text-sm mt-1">We'll send you a link to reset it</p>
        </div>
        <div className="card p-8">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-brand-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Check your inbox</h3>
              <p className="text-gray-400 text-sm mb-6">We've sent a password reset link to your email. It expires in 1 hour.</p>
              <Link to="/login" className="btn-secondary inline-flex items-center gap-2"><ArrowLeft size={16} /> Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                    type="email" placeholder="you@example.com" className="input pl-10" />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Reset Password ────────────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async ({ password }) => {
    try {
      setLoading(true);
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 bg-grid-pattern bg-grid">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center glow mx-auto mb-4"><Code2 size={20} className="text-white" /></div>
          <h1 className="text-2xl font-bold text-white">Create new password</h1>
          <p className="text-gray-400 text-sm mt-1">Choose a strong password for your account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input {...register('password', { required: true, minLength: { value: 8, message: 'Min 8 characters' } })}
                  type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input {...register('confirm', { validate: v => v === password || 'Passwords must match' })}
                  type={showPw ? 'text' : 'password'} placeholder="Repeat password" className="input pl-10" />
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
