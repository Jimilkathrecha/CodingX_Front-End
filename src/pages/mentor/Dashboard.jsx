import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle2, Clock, XCircle, Users,
  ChevronRight, RefreshCw, TrendingUp, Star, Zap
} from 'lucide-react';
import { submissionService } from '../../services/index';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  approved: { badge: 'badge-success', label: 'Approved',  icon: CheckCircle2, color: 'text-emerald-400' },
  rejected: { badge: 'badge-danger',  label: 'Rejected',  icon: XCircle,      color: 'text-red-400'     },
  pending:  { badge: 'badge-warning', label: 'Pending',   icon: Clock,        color: 'text-amber-400'   },
  submitted:{ badge: 'badge-brand',   label: 'Submitted', icon: Clock,        color: 'text-brand-400'   },
};

function StatCard({ icon: Icon, label, value, color, bg, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-white font-bold text-3xl">{value}</p>
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

export default function MentorDashboard() {
  const { user }   = useSelector(s => s.auth);
  const navigate   = useNavigate();
  const [data,     setData]    = useState(null);
  const [loading,  setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [pendRes, allRes] = await Promise.all([
        submissionService.getAll({ status: 'pending', limit: 5 }),
        submissionService.getAll({ limit: 1 }), // just to get total
      ]);
      const pending   = pendRes.data.submissions  || [];
      const totalPend = pendRes.data.total || 0;

      const approvedRes = await submissionService.getAll({ status: 'approved', limit: 1 });
      const rejectedRes = await submissionService.getAll({ status: 'rejected', limit: 1 });
      const recentRes   = await submissionService.getAll({ limit: 8 });

      setData({
        pending,
        totalPending:  totalPend,
        totalApproved: approvedRes.data.total || 0,
        totalRejected: rejectedRes.data.total || 0,
        recent:        recentRes.data.submissions || [],
      });
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalReviewed = (data?.totalApproved || 0) + (data?.totalRejected || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {data?.totalPending > 0
              ? `You have ${data.totalPending} submission${data.totalPending > 1 ? 's' : ''} waiting for review`
              : 'All submissions reviewed — great work!'
            }
          </p>
        </div>
        <button onClick={load} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock}        label="Pending Review"  value={data?.totalPending  || 0} color="text-amber-400"   bg="bg-amber-500/10"   delay={0}    />
        <StatCard icon={CheckCircle2} label="Approved"        value={data?.totalApproved || 0} color="text-emerald-400" bg="bg-emerald-500/10" delay={0.04} />
        <StatCard icon={XCircle}      label="Rejected"        value={data?.totalRejected || 0} color="text-red-400"     bg="bg-red-500/10"     delay={0.08} />
        <StatCard icon={TrendingUp}   label="Total Reviewed"  value={totalReviewed}            color="text-brand-400"   bg="bg-brand-500/10"   delay={0.12} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending queue */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <div>
              <h2 className="text-white font-semibold">Pending Review</h2>
              <p className="text-gray-500 text-xs mt-0.5">{data?.totalPending} submission{data?.totalPending !== 1 ? 's' : ''} waiting</p>
            </div>
            {data?.totalPending > 5 && (
              <button onClick={() => navigate('/mentor/submissions')} className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 transition-colors">
                View all <ChevronRight size={12} />
              </button>
            )}
          </div>

          {data?.pending?.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={36} className="text-emerald-500/40 mx-auto mb-3" />
              <p className="text-white font-medium">All caught up!</p>
              <p className="text-gray-500 text-sm">No pending submissions right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {data?.pending?.map((sub, i) => (
                <motion.button
                  key={sub._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate('/mentor/submissions')}
                  className="w-full flex items-center gap-3 p-4 hover:bg-surface-elevated/60 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {sub.student?.avatar?.url
                      ? <img src={sub.student.avatar.url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-amber-400 font-bold text-sm">{sub.student?.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-brand-400 transition-colors">{sub.task?.title}</p>
                    <p className="text-gray-500 text-xs">{sub.student?.name} · {sub.internship?.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-gray-600 text-xs">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-surface-border">
            <button onClick={() => navigate('/mentor/submissions')} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <FileText size={14} /> Go to Review Queue
            </button>
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card overflow-hidden">
          <div className="p-5 border-b border-surface-border">
            <h2 className="text-white font-semibold">Recent Activity</h2>
            <p className="text-gray-500 text-xs mt-0.5">Latest submissions across all programs</p>
          </div>

          {data?.recent?.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {data?.recent?.map((sub, i) => {
                const conf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                const SIcon = conf.icon;
                return (
                  <motion.div key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-4">
                    <SIcon size={16} className={`${conf.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{sub.student?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{sub.task?.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`badge text-xs ${conf.badge}`}>{conf.label}</span>
                      {sub.score != null && (
                        <span className="text-emerald-400 text-xs font-semibold">{sub.score}%</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}