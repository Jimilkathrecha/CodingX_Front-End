import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, XCircle, Clock, AlertCircle,
  Search, X, ChevronLeft, ChevronRight, ExternalLink,
  MessageSquare, Calendar, Star, Zap, RefreshCw
} from 'lucide-react';
import { submissionService } from '../../services/index';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  approved: { label: 'Approved',   badge: 'badge-success', icon: CheckCircle2, color: 'text-emerald-400' },
  rejected: { label: 'Rejected',   badge: 'badge-danger',  icon: XCircle,      color: 'text-red-400'     },
  pending:  { label: 'Pending',    badge: 'badge-warning', icon: Clock,        color: 'text-amber-400'   },
  submitted:{ label: 'Submitted',  badge: 'badge-brand',   icon: AlertCircle,  color: 'text-brand-400'   },
};
const LIMIT = 12;

// ── Detail Modal ──────────────────────────────────────────────────────────────
function SubmissionDetail({ sub, onClose }) {
  const conf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
  const Icon = conf.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
        className="card w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          sub.status === 'approved' ? 'border-emerald-500/20 bg-emerald-500/5'
          : sub.status === 'rejected' ? 'border-red-500/20 bg-red-500/5'
          : 'border-surface-border'
        }`}>
          <div className="flex items-center gap-2">
            <Icon size={16} className={conf.color} />
            <span className={`${conf.color} font-semibold text-sm`}>{conf.label}</span>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-white font-bold text-lg">{sub.task?.title}</h3>
            <p className="text-gray-400 text-sm">{sub.internship?.title}</p>
          </div>

          {/* Score + Points */}
          {sub.score != null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="card-elevated rounded-xl p-4 text-center">
                <p className="text-white font-bold text-3xl">{sub.score}%</p>
                <p className="text-gray-500 text-xs">Score</p>
              </div>
              <div className="card-elevated rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-brand-400 font-bold text-3xl">
                  <Zap size={20} />{sub.pointsAwarded || 0}
                </div>
                <p className="text-gray-500 text-xs">Points Earned</p>
              </div>
            </div>
          )}

          {/* Feedback */}
          {sub.feedback && (
            <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-brand-400" />
                <span className="text-brand-400 font-medium text-sm">Mentor Feedback</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{sub.feedback}</p>
            </div>
          )}

          {/* File link */}
          {sub.fileUrl && (
            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm transition-colors">
              <ExternalLink size={14} /> View submitted file
            </a>
          )}

          {/* Notes */}
          {sub.notes && (
            <div>
              <p className="text-gray-500 text-xs mb-1">Your notes</p>
              <p className="text-gray-300 text-sm leading-relaxed bg-surface-elevated rounded-xl p-3">{sub.notes}</p>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-gray-500 text-xs border-t border-surface-border pt-4">
            <Calendar size={11} />
            Submitted {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>

          <button onClick={onClose} className="btn-secondary w-full">Close</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('all');
  const [page,        setPage]        = useState(1);
  const [selected,    setSelected]    = useState(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await submissionService.getMine({
        page, limit: LIMIT,
        ...(status !== 'all' && { status }),
        ...(search.trim() && { search: search.trim() }),
      });
      setSubmissions(res.data.submissions || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const totalPages = Math.ceil(total / LIMIT);

  const stats = {
    total:    total,
    approved: submissions.filter(s => s.status === 'approved').length,
    pending:  submissions.filter(s => ['pending','submitted'].includes(s.status)).length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">My Submissions</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track all your task submissions and mentor feedback</p>
        </div>
        <button onClick={fetchSubmissions} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: total,          color: 'text-gray-300'   },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-400' },
          { label: 'In Review', value: stats.pending, color: 'text-amber-400'   },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-400'     },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by task name…" className="input pl-10 py-2.5 text-sm" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
        </div>
        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${status === s ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={44} className="text-gray-700 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No submissions yet</p>
          <p className="text-gray-500 text-sm">Complete tasks and submit your work to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, i) => {
            const conf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const Icon = conf.icon;
            return (
              <motion.div key={sub._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}>
                <button onClick={() => setSelected(sub)}
                  className="w-full card p-5 text-left flex items-center gap-4 hover:border-brand-500/30 transition-all group">
                  {/* Status icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    sub.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20'
                    : sub.status === 'rejected' ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-amber-500/10 border-amber-500/20'
                  }`}>
                    <Icon size={16} className={conf.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors">
                          {sub.task?.title || 'Task'}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{sub.internship?.title}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sub.score != null && (
                          <span className="text-emerald-400 font-bold text-sm">{sub.score}%</span>
                        )}
                        <span className={`badge text-xs ${conf.badge}`}>{conf.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {sub.pointsAwarded > 0 && (
                        <span className="flex items-center gap-1 text-brand-400">
                          <Zap size={10} />+{sub.pointsAwarded} pts
                        </span>
                      )}
                      {sub.feedback && (
                        <span className="flex items-center gap-1 text-brand-400">
                          <MessageSquare size={10} /> Feedback available
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={15} className="text-gray-600 group-hover:text-brand-400 flex-shrink-0 transition-colors" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-ghost p-2 disabled:opacity-30"><ChevronLeft size={15} /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
            Math.max(1, Math.min(page - 2, totalPages - 4)) + i
          ).map(pg => (
            <button key={pg} onClick={() => setPage(pg)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${pg === page ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-surface-elevated'}`}>
              {pg}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn-ghost p-2 disabled:opacity-30"><ChevronRight size={15} /></button>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && <SubmissionDetail sub={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}