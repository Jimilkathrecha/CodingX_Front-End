import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FileText, CheckCircle2, XCircle, Clock, Search,
  X, ChevronLeft, ChevronRight, ExternalLink, RefreshCw,
  MessageSquare, Star, Zap, AlertTriangle, Send, Eye
} from 'lucide-react';
import { submissionService } from '../../services/index';
import toast from 'react-hot-toast';

const LIMIT = 12;
const STATUS_CONFIG = {
  approved: { badge: 'badge-success', label: 'Approved',  icon: CheckCircle2, color: 'text-emerald-400' },
  rejected: { badge: 'badge-danger',  label: 'Rejected',  icon: XCircle,      color: 'text-red-400'     },
  pending:  { badge: 'badge-warning', label: 'Pending',   icon: Clock,        color: 'text-amber-400'   },
  submitted:{ badge: 'badge-brand',   label: 'Submitted', icon: Clock,        color: 'text-brand-400'   },
};

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ sub, onClose, onReviewed }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { status: '', score: sub.task?.points || 100, feedback: '', privateNotes: '' }
  });
  const selectedStatus = watch('status');

  const onSubmit = async (data) => {
    if (!data.status) { toast.error('Select approve or reject'); return; }
    try {
      await submissionService.review(sub._id, {
        status:       data.status,
        score:        data.status === 'approved' ? Number(data.score) : undefined,
        feedback:     data.feedback,
        privateNotes: data.privateNotes,
      });
      toast.success(data.status === 'approved' ? '✅ Submission approved!' : '❌ Submission rejected');
      onReviewed();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Review failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        className="card w-full max-w-2xl my-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div>
            <h2 className="text-white font-semibold text-lg">Review Submission</h2>
            <p className="text-gray-400 text-sm">{sub.student?.name} · {sub.task?.title}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">

          {/* Student info */}
          <div className="flex items-center gap-3 p-4 card-elevated rounded-xl border border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold overflow-hidden flex-shrink-0">
              {sub.student?.avatar?.url
                ? <img src={sub.student.avatar.url} alt="" className="w-full h-full object-cover" />
                : sub.student?.name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <p className="text-white font-semibold">{sub.student?.name}</p>
              <p className="text-gray-400 text-xs">{sub.student?.email}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-gray-500 text-xs">Attempt #{sub.attemptNumber || 1}</p>
              <p className="text-gray-500 text-xs">{new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Submission content */}
          {sub.content && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Submitted Answer</p>
              <div className="bg-surface-elevated border border-surface-border rounded-xl p-4 text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {sub.content}
              </div>
            </div>
          )}

          {/* Links */}
          {sub.links?.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Submitted Links</p>
              <div className="space-y-2">
                {sub.links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                    <ExternalLink size={13} /><span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* File */}
          {sub.fileUrl && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Attached File</p>
              <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-xs flex items-center gap-2 w-fit">
                <Eye size={13} /> View Attachment
              </a>
            </div>
          )}

          {/* Student notes */}
          {sub.notes && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Student Notes</p>
              <p className="text-gray-300 text-sm bg-surface-elevated rounded-xl p-3 border border-surface-border">{sub.notes}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 border-t border-surface-border">
            {/* Approve / Reject selector */}
            <div>
              <p className="label">Decision *</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setValue('status', 'approved')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                    selectedStatus === 'approved'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-surface-elevated border-surface-border text-gray-400 hover:text-white'
                  }`}>
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button type="button" onClick={() => setValue('status', 'rejected')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                    selectedStatus === 'rejected'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-surface-elevated border-surface-border text-gray-400 hover:text-white'
                  }`}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
              <input type="hidden" {...register('status')} />
            </div>

            {/* Score — only when approving */}
            {selectedStatus === 'approved' && (
              <div>
                <label className="label">Score (0–100)</label>
                <input type="number" min="0" max="100" {...register('score', { min: 0, max: 100 })}
                  className="input" placeholder="e.g. 85" />
              </div>
            )}

            {/* Feedback (visible to student) */}
            <div>
              <label className="label">Feedback <span className="text-gray-600">(shown to student)</span></label>
              <textarea
                {...register('feedback', { required: 'Please provide feedback for the student' })}
                rows={3}
                placeholder={selectedStatus === 'approved'
                  ? 'Great work! Mention what they did well…'
                  : 'Explain what needs improvement and how to fix it…'
                }
                className="input resize-none"
              />
              {errors.feedback && <p className="text-red-400 text-xs mt-1">{errors.feedback.message}</p>}
            </div>

            {/* Private notes */}
            <div>
              <label className="label">Private Notes <span className="text-gray-600">(only you see this)</span></label>
              <textarea {...register('privateNotes')} rows={2}
                placeholder="Internal notes for your reference…" className="input resize-none" />
            </div>

            <div className="flex gap-3 pt-2 border-t border-surface-border">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSubmitting || !selectedStatus}
                className={`flex-1 py-2.5 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 ${
                  selectedStatus === 'approved'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : selectedStatus === 'rejected'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-surface-elevated text-gray-500 cursor-not-allowed'
                }`}>
                {isSubmitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                  : <><Send size={14} />Submit Review</>
                }
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MentorSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [status,      setStatus]      = useState('pending');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [reviewing,   setReviewing]   = useState(null);
  const searchTimer = useRef(null);

  const fetchSubs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await submissionService.getAll({
        page, limit: LIMIT,
        ...(status !== 'all' && { status }),
        ...(search.trim() && { search: search.trim() }),
      });
      setSubmissions(res.data.submissions || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleSearchChange = (v) => {
    setSearch(v);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchSubs, 400);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Queue</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} submission{total !== 1 ? 's' : ''} {status !== 'all' ? `with status "${status}"` : 'total'}</p>
        </div>
        <button onClick={fetchSubs} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
        className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by student or task…" className="input pl-10 py-2.5 text-sm" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
        </div>
        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${status === s ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 size={44} className="text-emerald-500/30 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">
              {status === 'pending' ? 'All caught up! No pending submissions.' : 'No submissions found'}
            </p>
            <p className="text-gray-500 text-sm">Adjust filters to see other submissions</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-surface-border bg-surface-elevated/40">
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header hidden md:table-cell">Task</th>
                    <th className="table-header hidden lg:table-cell">Program</th>
                    <th className="table-header hidden xl:table-cell">Submitted</th>
                    <th className="table-header hidden xl:table-cell">Attempt</th>
                    <th className="table-header">Status</th>
                    <th className="table-header hidden md:table-cell">Score</th>
                    <th className="table-header text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => {
                    const conf  = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                    const SIcon = conf.icon;
                    const isPending = ['pending', 'submitted'].includes(sub.status);
                    return (
                      <motion.tr key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.025 }} className="table-row">

                        {/* Student */}
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0 overflow-hidden">
                              {sub.student?.avatar?.url
                                ? <img src={sub.student.avatar.url} alt="" className="w-full h-full object-cover" />
                                : sub.student?.name?.[0]?.toUpperCase()
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">{sub.student?.name}</p>
                              <p className="text-gray-500 text-xs truncate">{sub.student?.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Task */}
                        <td className="table-cell hidden md:table-cell">
                          <p className="text-gray-300 text-sm truncate max-w-[180px]">{sub.task?.title}</p>
                          {sub.task?.isFinalProject && <span className="badge-brand text-xs mt-0.5">Final Project</span>}
                        </td>

                        {/* Program */}
                        <td className="table-cell hidden lg:table-cell text-gray-500 text-xs truncate max-w-[140px]">
                          {sub.internship?.title}
                        </td>

                        {/* Submitted */}
                        <td className="table-cell hidden xl:table-cell text-gray-500 text-xs">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        {/* Attempt */}
                        <td className="table-cell hidden xl:table-cell text-gray-500 text-sm">
                          #{sub.attemptNumber || 1}
                        </td>

                        {/* Status */}
                        <td className="table-cell">
                          <span className={`badge text-xs ${conf.badge}`}>
                            <SIcon size={9} className="inline mr-0.5" />{conf.label}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="table-cell hidden md:table-cell">
                          {sub.score != null
                            ? <span className="text-white font-semibold text-sm">{sub.score}%</span>
                            : <span className="text-gray-600 text-xs">—</span>
                          }
                        </td>

                        {/* Action */}
                        <td className="table-cell text-center">
                          <button
                            onClick={() => setReviewing(sub)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                              isPending
                                ? 'bg-brand-500 hover:bg-brand-600 text-white'
                                : 'bg-surface-elevated border border-surface-border text-gray-400 hover:text-white'
                            }`}
                          >
                            {isPending ? 'Review' : 'View'}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-surface-border">
                <p className="text-gray-500 text-xs">
                  {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of <span className="text-gray-300">{total}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-ghost p-1.5 disabled:opacity-30"><ChevronLeft size={15} /></button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
                    Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  ).map(pg => (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${pg === page ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-surface-elevated'}`}>
                      {pg}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="btn-ghost p-1.5 disabled:opacity-30"><ChevronRight size={15} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Review modal */}
      <AnimatePresence>
        {reviewing && (
          <ReviewModal
            sub={reviewing}
            onClose={() => setReviewing(null)}
            onReviewed={fetchSubs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}