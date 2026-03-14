import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Clock, Users, BookOpen, CheckCircle2, ArrowRight,
  Award, IndianRupee, Mail, Star, Lock, Zap,
  Code2, FileText, HelpCircle, Video
} from 'lucide-react';
import { internshipService } from '../../services/index';
import { getMe } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const CAT_ICONS = {
  'web-development':    '🌐',
  'mobile-development': '📱',
  'ai-ml':              '🤖',
  'data-science':       '📊',
  'devops':             '☁️',
  'design':             '🎨',
  'other':              '💡',
};

const DIFF_COLOR = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-danger' };

const TASK_TYPE_ICONS = {
  'coding':           <Code2     size={12} className="text-violet-400" />,
  'file-submission':  <FileText  size={12} className="text-brand-400"  />,
  'project':          <Star      size={12} className="text-amber-400"  />,
  'mcq':              <HelpCircle size={12} className="text-emerald-400" />,
  'video-submission': <Video     size={12} className="text-pink-400"   />,
};

export default function InternshipDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const { user, isAuthenticated } = useSelector(s => s.auth);

  const [internship, setInternship] = useState(null);
  const [enrolling,  setEnrolling]  = useState(false);

  useEffect(() => {
    internshipService.getById(id)
      .then(r => setInternship(r.data.internship))
      .catch(() => navigate('/internships'));
  }, [id]);

  const isEnrolled = user?.enrolledInternships?.some(
    e => (e.internship?._id || e.internship)?.toString() === id
  );

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/register'); return; }
    try {
      setEnrolling(true);
      await internshipService.enroll(id);
      // Refresh user so enrolledInternships is up-to-date
      await dispatch(getMe());
      toast.success('🎉 Enrolled! Offer letter sent to your email.', { duration: 4000 });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (!internship) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const certPrice = internship.certificatePrice || 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-brand capitalize">{internship.category?.replace(/-/g, ' ')}</span>
              <span className={`badge capitalize ${DIFF_COLOR[internship.difficulty] || 'badge-gray'}`}>
                {internship.difficulty}
              </span>
              {internship.isFeatured && <span className="badge-brand">⭐ Featured</span>}
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{internship.title}</h1>
            <p className="text-gray-400 leading-relaxed">{internship.description}</p>
          </motion.div>

          {/* Meta strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="flex flex-wrap gap-6 py-4 border-y border-surface-border">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock size={15} className="text-brand-400" />
              {internship.duration?.value} {internship.duration?.unit}
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <BookOpen size={15} className="text-brand-400" />
              {internship.modules?.length || 0} modules
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Users size={15} className="text-brand-400" />
              {internship.totalEnrolled?.toLocaleString() || 0} enrolled
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award size={15} className={certPrice > 0 ? 'text-amber-400' : 'text-emerald-400'} />
              <span className={certPrice > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                {certPrice > 0 ? `Certificate ₹${Math.round(certPrice / 100)}` : 'Free Certificate'}
              </span>
            </div>
          </motion.div>

          {/* Skills */}
          {internship.skills?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
              <h3 className="text-white font-semibold mb-3">Skills You'll Learn</h3>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map(s => (
                  <span key={s} className="badge-brand text-xs">{s}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Curriculum */}
          {internship.modules?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h3 className="text-white font-semibold mb-3">Curriculum</h3>
              <div className="space-y-2">
                {internship.modules.map((mod, i) => (
                  <div key={mod._id} className="card-elevated p-4 flex items-center gap-3 border border-surface-border rounded-xl">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{mod.title}</p>
                      {mod.tasks?.length > 0 && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-gray-500 text-xs">{mod.tasks.length} tasks</p>
                          <div className="flex gap-1">
                            {mod.tasks.slice(0, 4).map((t, ti) => (
                              <span key={ti} className="text-gray-600">{TASK_TYPE_ICONS[t.type] || TASK_TYPE_ICONS['coding']}</span>
                            ))}
                            {mod.tasks.length > 4 && <span className="text-gray-600 text-xs">+{mod.tasks.length - 4}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mentors */}
          {internship.mentors?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
              <h3 className="text-white font-semibold mb-3">Your Mentors</h3>
              <div className="flex flex-wrap gap-3">
                {internship.mentors.map(mentor => (
                  <div key={mentor._id} className="card p-3 flex items-center gap-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold flex-shrink-0 overflow-hidden">
                      {mentor.avatar?.url
                        ? <img src={mentor.avatar.url} alt={mentor.name} className="w-full h-full object-cover" />
                        : mentor.name?.[0]?.toUpperCase()
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm">{mentor.name}</p>
                      <p className="text-gray-500 text-xs truncate">{mentor.bio || 'Mentor'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right: enroll card ── */}
        <div>
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 }}
            className="card p-6 sticky top-24 space-y-5">

            {/* Program icon */}
            <div className="h-20 bg-gradient-to-br from-brand-900/40 to-violet-900/30 rounded-xl flex items-center justify-center text-4xl">
              {CAT_ICONS[internship.category] || '💡'}
            </div>

            {/* Enrollment fee (always free — cert fee is separate) */}
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Free</div>
              <p className="text-gray-500 text-xs mt-0.5">Enrollment · Full access included</p>
            </div>

            {/* Certificate fee info */}
            <div className={`p-3 rounded-xl border ${certPrice > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
              <div className="flex items-center gap-2">
                <Award size={14} className={certPrice > 0 ? 'text-amber-400' : 'text-emerald-400'} />
                <div>
                  <p className={`text-xs font-semibold ${certPrice > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Certificate Download Fee
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {certPrice > 0
                      ? `₹${Math.round(certPrice / 100)} one-time fee after completion`
                      : 'Free — download at no cost after completion'}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            {isEnrolled ? (
              <button onClick={() => navigate('/dashboard')}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                {enrolling
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enrolling…</>
                  : <>Enroll Now — Free <ArrowRight size={16} /></>
                }
              </button>
            )}

            {/* Offer letter notice */}
            {!isEnrolled && (
              <div className="flex items-start gap-2 p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl">
                <Mail size={13} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-400 text-xs leading-relaxed">
                  An <strong className="text-brand-400">offer letter PDF</strong> will be emailed to you immediately after enrollment.
                </p>
              </div>
            )}

            {/* Feature list */}
            <div className="space-y-2 pt-1 border-t border-surface-border">
              {[
                { icon: CheckCircle2, text: certPrice > 0 ? `Certificate · ₹${Math.round(certPrice / 100)} after completion` : 'Free certificate on completion', color: certPrice > 0 ? 'text-amber-400' : 'text-emerald-400' },
                { icon: Mail,         text: 'Offer letter emailed instantly',      color: 'text-brand-400' },
                { icon: Users,        text: 'Expert mentor review on submissions', color: 'text-brand-400' },
                { icon: Zap,          text: 'Points & achievements system',         color: 'text-brand-400' },
                { icon: BookOpen,     text: 'Structured modules & tasks',           color: 'text-brand-400' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
                  <Icon size={13} className={color} /> {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}