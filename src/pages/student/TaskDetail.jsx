import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle,
  Zap, BookOpen, Code2, FileText, HelpCircle, Star,
  Paperclip, Link2, Plus, X, Send, Eye,
  MessageSquare, ChevronDown, ChevronUp, ExternalLink,
  Lock, RefreshCw, Info, Video, Loader2
} from 'lucide-react';
import { taskService, submissionService, uploadService } from '../../services/index';
import toast from 'react-hot-toast';

// Match backend enum exactly: coding | mcq | file-submission | project | video-submission
const TYPE_CONFIG = {
  'coding':           { icon: Code2,       color: 'text-violet-400',  bg: 'bg-violet-500/10  border-violet-500/20',  label: 'Coding'      },
  'file-submission':  { icon: FileText,    color: 'text-brand-400',   bg: 'bg-brand-500/10   border-brand-500/20',   label: 'File Upload' },
  'project':          { icon: Star,        color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/20',   label: 'Project'     },
  'mcq':              { icon: HelpCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'MCQ Quiz'    },
  'video-submission': { icon: Video,       color: 'text-pink-400',    bg: 'bg-pink-500/10    border-pink-500/20',    label: 'Video'       },
};

const STATUS_CONFIG = {
  'approved':           { label: 'Approved',   badge: 'badge-success', icon: CheckCircle2, color: 'text-emerald-400', desc: 'Your submission was approved by the mentor! 🎉' },
  'rejected':           { label: 'Needs Work', badge: 'badge-danger',  icon: XCircle,      color: 'text-red-400',     desc: 'Your submission needs revision. See feedback below.' },
  'resubmit-required':  { label: 'Redo',       badge: 'badge-danger',  icon: XCircle,      color: 'text-orange-400',  desc: 'Please fix issues and resubmit.' },
  'pending':            { label: 'In Review',  badge: 'badge-warning', icon: Clock,        color: 'text-amber-400',   desc: 'Your submission is being reviewed by the mentor.' },
  'under-review':       { label: 'In Review',  badge: 'badge-warning', icon: Clock,        color: 'text-amber-400',   desc: 'Your submission is under review.' },
};

// ── Submission form ───────────────────────────────────────────────────────────
function SubmitForm({ task, internshipId, onSubmitted }) {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm();
  const [links,       setLinks]       = useState(['']);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const fileRef = useRef(null);

  const updateLink  = (i, v) => setLinks(l => l.map((x, idx) => idx === i ? v : x));
  const removeLink  = (i)    => setLinks(l => l.filter((_, idx) => idx !== i));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMB = task.maxFileSize || 50;
    if (file.size > maxMB * 1024 * 1024) { toast.error(`Max file size: ${maxMB}MB`); return; }
    try {
      setUploading(true);
      const res = await uploadService.single(file, 'submission');
      setUploadedUrl(res.data.url || res.data.secure_url);
      toast.success('File uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const onSubmit = async (data) => {
    const validLinks = links.filter(l => l.trim());
    if (!data.content?.trim() && !uploadedUrl && validLinks.length === 0) {
      toast.error('Provide an answer, link, or file to submit');
      return;
    }
    try {
      await submissionService.submit({
        taskId:       task._id,
        internshipId: internshipId,
        content:      data.content || undefined,
        notes:        data.notes   || undefined,
        links:        validLinks,
        fileUrl:      uploadedUrl  || undefined,
      });
      toast.success('✅ Submitted for review!');
      reset();
      setLinks(['']);
      setUploadedUrl(null);
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Answer */}
      <div>
        <label className="label">Your Answer / Work</label>
        <textarea {...register('content')} rows={6}
          placeholder="Paste your code, explain your approach, describe your solution…"
          className="input resize-none font-mono text-sm" />
      </div>

      {/* Links */}
      <div>
        <label className="label">
          Submission Links <span className="text-gray-600">(GitHub, Live URL, Drive, etc.)</span>
        </label>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <div className="relative flex-1">
                <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={link} onChange={e => updateLink(i, e.target.value)}
                  placeholder="https://github.com/you/project" className="input pl-10 text-sm" />
              </div>
              {links.length > 1 && (
                <button type="button" onClick={() => removeLink(i)} className="btn-ghost p-2 text-gray-500 hover:text-red-400">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {links.length < 5 && (
            <button type="button" onClick={() => setLinks(l => [...l, ''])}
              className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 transition-colors">
              <Plus size={12} /> Add another link
            </button>
          )}
        </div>
      </div>

      {/* File upload */}
      <div>
        <label className="label">Attach File <span className="text-gray-600">(max {task.maxFileSize || 50}MB)</span></label>
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary flex items-center gap-2 text-sm">
            {uploading ? <><Loader2 size={14} className="animate-spin" />Uploading…</> : <><Paperclip size={14} />Choose File</>}
          </button>
          {uploadedUrl && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 size={13} />
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer"
                className="hover:underline text-xs truncate max-w-[200px]">File attached</a>
              <button type="button" onClick={() => setUploadedUrl(null)} className="text-gray-500 hover:text-red-400">
                <X size={12} />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes to Mentor <span className="text-gray-600">(optional)</span></label>
        <textarea {...register('notes')} rows={2}
          placeholder="Any context, challenges, or things you want to mention…" className="input resize-none text-sm" />
      </div>

      <button type="submit" disabled={isSubmitting || uploading}
        className="btn-primary flex items-center gap-2 disabled:opacity-50">
        {isSubmitting
          ? <><Loader2 size={15} className="animate-spin" />Submitting…</>
          : <><Send size={15} />Submit for Review</>
        }
      </button>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TaskDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [task,        setTask]        = useState(null);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showSubmit,  setShowSubmit]  = useState(false);

  const loadTask = async () => {
    try {
      setLoading(true);
      const res = await taskService.getById(id);
      setTask(res.data.task);
      setAttemptInfo(res.data.attemptInfo);
    } catch {
      toast.error('Task not found');
      navigate('/dashboard/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTask(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!task) return null;

  const typeConf     = TYPE_CONFIG[task.type] || TYPE_CONFIG['coding'];
  const TaskIcon     = typeConf.icon;
  const latest       = attemptInfo?.latest;
  const statusConf   = latest ? STATUS_CONFIG[latest.status] : null;
  const StatusIcon   = statusConf?.icon;
  const isApproved   = latest?.status === 'approved';
  const canSubmit    = (attemptInfo?.canSubmit !== false) && !isApproved;
  const maxAttempts  = task.maxAttempts || 3;
  const attemptsUsed = attemptInfo?.used || 0;
  const isDue        = task.deadline && new Date(task.deadline) < new Date();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/dashboard/tasks')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Tasks
      </motion.button>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="card p-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 ${typeConf.bg}`}>
            <TaskIcon size={24} className={typeConf.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-white font-bold text-xl leading-tight">{task.title}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{task.internship?.title}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {statusConf && (
                  <span className={`badge ${statusConf.badge} text-xs`}>
                    <StatusIcon size={10} className="inline mr-0.5" />{statusConf.label}
                  </span>
                )}
                {task.isFinalProject && <span className="badge-brand text-xs">Final Project</span>}
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`badge border text-xs ${typeConf.bg}`}>{typeConf.label}</span>
              {task.points > 0 && (
                <span className="flex items-center gap-1 text-brand-400 text-xs font-semibold">
                  <Zap size={11} />{task.points} points
                </span>
              )}
              {task.passingScore != null && (
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Star size={11} />Pass: {task.passingScore}%
                </span>
              )}
              {task.deadline && (
                <span className={`text-xs flex items-center gap-1 ${isDue && !isApproved ? 'text-red-400' : 'text-gray-500'}`}>
                  <Clock size={11} />
                  {isDue ? 'Overdue · ' : 'Due '}
                  {new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {task.module && (
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <BookOpen size={11} />{task.module.title}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Attempt tracker */}
        {attemptInfo && (
          <div className="mt-5 p-4 bg-surface-elevated rounded-xl border border-surface-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs font-medium">Attempts Used</span>
              <span className="text-white text-xs font-semibold">{attemptsUsed} / {maxAttempts}</span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: maxAttempts }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                  i < attemptsUsed
                    ? isApproved ? 'bg-emerald-500' : 'bg-brand-500'
                    : 'bg-surface-border'
                }`} />
              ))}
            </div>
            {isApproved && (
              <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                <CheckCircle2 size={11} /> Task completed! Great work.
              </p>
            )}
            {!canSubmit && !isApproved && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <Lock size={11} /> Maximum attempts reached
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Feedback from latest submission */}
      {latest && statusConf && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className={`card p-5 border ${
            latest.status === 'approved' ? 'border-emerald-500/30'
            : ['rejected','resubmit-required'].includes(latest.status) ? 'border-red-500/30'
            : 'border-amber-500/20'
          }`}>
          <div className="flex items-center gap-3 mb-3">
            <StatusIcon size={18} className={statusConf.color} />
            <div className="flex-1">
              <p className={`font-semibold ${statusConf.color}`}>{statusConf.label}</p>
              <p className="text-gray-500 text-xs">{statusConf.desc}</p>
            </div>
            {latest.score != null && (
              <div className="text-right">
                <p className="text-white font-bold text-2xl">{latest.score}%</p>
                <p className="text-gray-500 text-xs">Score</p>
              </div>
            )}
          </div>
          {latest.feedback && (
            <div className="bg-surface-elevated rounded-xl p-4 border border-surface-border">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} className="text-brand-400" />
                <span className="text-brand-400 font-medium text-xs">Mentor Feedback</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{latest.feedback}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Description + Instructions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="card p-6 space-y-4">
        <h2 className="text-white font-semibold">Task Description</h2>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>

        {task.instructions && (
          <>
            <div className="border-t border-surface-border" />
            <div>
              <h3 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                <Info size={14} className="text-brand-400" /> Instructions
              </h3>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-surface-elevated rounded-xl p-4 border border-surface-border font-mono text-xs">
                {task.instructions}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Resources */}
      {task.resources?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-6">
          <h2 className="text-white font-semibold mb-4">Resources</h2>
          <div className="space-y-2">
            {task.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-surface-border hover:border-brand-500/30 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium group-hover:text-brand-400 transition-colors truncate">{r.title}</p>
                  <p className="text-gray-500 text-xs capitalize">{r.type || 'link'}</p>
                </div>
                <ExternalLink size={13} className="text-gray-600 group-hover:text-brand-400 flex-shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Submit section */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="card overflow-hidden">
        <button
          onClick={() => canSubmit && setShowSubmit(v => !v)}
          className={`w-full flex items-center justify-between p-5 transition-colors ${canSubmit ? 'hover:bg-surface-elevated/50 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${canSubmit ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface-elevated border-surface-border'}`}>
              {isApproved ? <CheckCircle2 size={18} className="text-emerald-400" />
               : !canSubmit ? <Lock size={18} className="text-gray-500" />
               : <Send size={18} className="text-brand-400" />}
            </div>
            <div className="text-left">
              <p className={`font-semibold text-sm ${canSubmit ? 'text-white' : 'text-gray-500'}`}>
                {isApproved ? 'Task Completed ✓'
                 : !canSubmit ? 'No Attempts Remaining'
                 : attemptsUsed > 0 ? `Resubmit (Attempt ${attemptsUsed + 1}/${maxAttempts})`
                 : 'Submit Your Work'}
              </p>
              <p className="text-gray-500 text-xs">
                {isApproved ? 'Your work was approved by the mentor'
                 : !canSubmit ? `Used all ${maxAttempts} attempts`
                 : `Attempt ${attemptsUsed + 1} of ${maxAttempts}`}
              </p>
            </div>
          </div>
          {canSubmit && (
            showSubmit ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showSubmit && canSubmit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden">
              <div className="p-5 border-t border-surface-border">
                <SubmitForm
                  task={task}
                  internshipId={task.internship?._id || task.internship}
                  onSubmitted={() => { setShowSubmit(false); loadTask(); }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}