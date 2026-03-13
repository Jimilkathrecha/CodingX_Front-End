import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Eye, Filter, Search, Clock, ExternalLink } from 'lucide-react';
import { submissionService } from '../../services/index';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'resubmit-required'];

function ReviewModal({ submission, onClose, onReview }) {
  const [score, setScore] = useState(submission.score ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (status) => {
    try {
      setLoading(true);
      await onReview(submission._id, { status, score: Number(score), feedback });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div>
            <h2 className="text-white font-semibold text-lg">Review Submission</h2>
            <p className="text-gray-400 text-sm">{submission.task?.title}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Student info */}
          <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
              {submission.student?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{submission.student?.name}</p>
              <p className="text-gray-400 text-xs">{submission.student?.email}</p>
            </div>
            <div className="ml-auto text-xs text-gray-500">Attempt #{submission.attemptNumber}</div>
          </div>

          {/* Submission content */}
          {submission.content && (
            <div>
              <label className="label">Submitted Content</label>
              <div className="bg-surface-elevated rounded-xl p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-surface-border">
                {submission.content}
              </div>
            </div>
          )}

          {/* Links */}
          {submission.links?.length > 0 && (
            <div>
              <label className="label">Submitted Links</label>
              <div className="space-y-2">
                {submission.links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm">
                    <ExternalLink size={14} /> {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {submission.files?.length > 0 && (
            <div>
              <label className="label">Uploaded Files</label>
              <div className="space-y-2">
                {submission.files.map((f, i) => (
                  <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm">
                    <ExternalLink size={14} /> {f.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Score */}
          <div>
            <label className="label">Score (0–100)</label>
            <input
              type="number" min="0" max="100" value={score}
              onChange={e => setScore(e.target.value)}
              placeholder="Enter score..."
              className="input w-40"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="label">Feedback for Student</label>
            <textarea
              value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              rows={4} className="input resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleSubmit('approved')}
              disabled={loading || !score}
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
            >
              <CheckCircle2 size={16} /> Approve
            </button>
            <button
              onClick={() => handleSubmit('rejected')}
              disabled={loading}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 flex-1 justify-center"
            >
              <XCircle size={16} /> Reject
            </button>
            <button
              onClick={() => handleSubmit('resubmit-required')}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              Resubmit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await submissionService.getAll({
        status: activeTab === 'all' ? undefined : activeTab,
        page, limit: 20
      });
      setSubmissions(res.data.submissions);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubmissions(); }, [activeTab, page]);

  const handleReview = async (id, data) => {
    await submissionService.review(id, data);
    toast.success(`Submission ${data.status}`);
    fetchSubmissions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Submissions</h1>
          <p className="text-gray-400 text-sm mt-1">Review and grade student submissions</p>
        </div>
        <div className="badge-brand px-4 py-2 text-sm">{total} total</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card p-1 rounded-xl w-fit border border-surface-border">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                <th className="table-header">Student</th>
                <th className="table-header">Task</th>
                <th className="table-header hidden md:table-cell">Internship</th>
                <th className="table-header hidden lg:table-cell">Submitted</th>
                <th className="table-header">Status</th>
                <th className="table-header">Score</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-bold">
                        {sub.student?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{sub.student?.name}</p>
                        <p className="text-gray-500 text-xs">{sub.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-white text-sm">{sub.task?.title}</p>
                    <p className="text-gray-500 text-xs capitalize">{sub.task?.type?.replace(/-/g, ' ')}</p>
                  </td>
                  <td className="table-cell hidden md:table-cell text-gray-400 text-xs">{sub.internship?.title}</td>
                  <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <span className={`badge text-xs ${
                      sub.status === 'approved' ? 'badge-success' :
                      sub.status === 'pending' ? 'badge-warning' :
                      sub.status === 'rejected' ? 'badge-danger' :
                      sub.status === 'under-review' ? 'badge-brand' : 'badge-gray'
                    }`}>{sub.status}</span>
                  </td>
                  <td className="table-cell">
                    {sub.score != null ? (
                      <span className="text-white font-semibold text-sm">{sub.score}%</span>
                    ) : <span className="text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => setSelected(sub)}
                      className="btn-ghost text-xs flex items-center gap-1 text-brand-400 hover:text-brand-300"
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {submissions.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500/30" />
            No {activeTab} submissions
          </div>
        )}
      </div>

      {selected && (
        <ReviewModal submission={selected} onClose={() => setSelected(null)} onReview={handleReview} />
      )}
    </div>
  );
}
