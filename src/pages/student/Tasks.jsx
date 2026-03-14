import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CheckSquare, Clock, BookOpen, ChevronRight,
  Search, Zap, FileText, Code2, HelpCircle,
  CheckCircle2, XCircle, AlertCircle, X, Video
} from 'lucide-react';
import { taskService, internshipService } from '../../services/index';
import toast from 'react-hot-toast';

// Match backend task type enum: coding | mcq | file-submission | project | video-submission
const TYPE_CONFIG = {
  'coding':           { icon: Code2,       color: 'text-violet-400',  bg: 'bg-violet-500/10  border-violet-500/20',  label: 'Coding'       },
  'file-submission':  { icon: FileText,    color: 'text-brand-400',   bg: 'bg-brand-500/10   border-brand-500/20',   label: 'File Upload'  },
  'project':          { icon: BookOpen,    color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/20',   label: 'Project'      },
  'mcq':              { icon: HelpCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'MCQ Quiz'     },
  'video-submission': { icon: Video,       color: 'text-pink-400',    bg: 'bg-pink-500/10    border-pink-500/20',    label: 'Video'        },
};

const STATUS_CONFIG = {
  'approved':             { icon: CheckCircle2, color: 'text-emerald-400', bg: 'badge-success', label: 'Approved'  },
  'pending':              { icon: AlertCircle,  color: 'text-amber-400',   bg: 'badge-warning', label: 'In Review' },
  'under-review':         { icon: AlertCircle,  color: 'text-amber-400',   bg: 'badge-warning', label: 'In Review' },
  'rejected':             { icon: XCircle,      color: 'text-red-400',     bg: 'badge-danger',  label: 'Rejected'  },
  'resubmit-required':    { icon: XCircle,      color: 'text-orange-400',  bg: 'badge-danger',  label: 'Redo'      },
  'not_submitted':        { icon: CheckSquare,  color: 'text-gray-500',    bg: 'badge-gray',    label: 'Todo'      },
};

export default function StudentTasks() {
  const navigate        = useNavigate();
  const { user }        = useSelector(s => s.auth);
  const [programs,      setPrograms]     = useState([]);  // enrolled only
  const [selectedId,    setSelectedId]   = useState(null);
  const [tasks,         setTasks]        = useState([]);
  const [loadingProgs,  setLoadingProgs] = useState(true);
  const [loadingTasks,  setLoadingTasks] = useState(false);
  const [search,        setSearch]       = useState('');
  const [statusFilter,  setStatusFilter] = useState('all');

  // ── Load ONLY enrolled programs ───────────────────────────────────────────
  useEffect(() => {
    // First try from Redux user state (instant, no API call)
    const enrollments = user?.enrolledInternships || [];
    if (enrollments.length > 0) {
      // enrolled internships are populated objects from getMe
      const progs = enrollments
        .filter(e => e.status !== 'dropped' && e.internship)
        .map(e => ({
          _id:    e.internship?._id || e.internship,
          title:  e.internship?.title || 'Program',
          status: e.status,
          plan:   e.plan,
        }));
      setPrograms(progs);
      if (progs.length > 0) setSelectedId(progs[0]._id);
      setLoadingProgs(false);
      return;
    }

    // Fallback: fetch from API (handles edge cases)
    internshipService.getEnrolled()
      .then(res => {
        const progs = (res.data.internships || []).map(p => ({
          _id: p._id, title: p.title, status: p.enrollmentStatus, plan: p.plan,
        }));
        setPrograms(progs);
        if (progs.length > 0) setSelectedId(progs[0]._id);
      })
      .catch(() => toast.error('Failed to load programs'))
      .finally(() => setLoadingProgs(false));
  }, [user]);

  // ── Load tasks for selected program ──────────────────────────────────────
  const loadTasks = useCallback(async () => {
    if (!selectedId) return;
    setLoadingTasks(true);
    try {
      const res = await taskService.getByInternship(selectedId);
      setTasks(res.data.tasks || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    const subStatus = t.mySubmission?.status || 'not_submitted';
    const matchSearch = !search.trim() || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || subStatus === statusFilter ||
      (statusFilter === 'pending' && ['pending','under-review'].includes(subStatus));
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    tasks.length,
    done:     tasks.filter(t => t.mySubmission?.status === 'approved').length,
    pending:  tasks.filter(t => ['pending','under-review'].includes(t.mySubmission?.status)).length,
    todo:     tasks.filter(t => !t.mySubmission).length,
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingProgs) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Not enrolled ──────────────────────────────────────────────────────────
  if (programs.length === 0) return (
    <div className="card p-20 text-center">
      <BookOpen size={48} className="text-gray-700 mx-auto mb-4" />
      <h3 className="text-white font-semibold text-xl mb-2">No Active Programs</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Enroll in an internship to start working on tasks.</p>
      <button onClick={() => navigate('/internships')} className="btn-primary">Browse Programs</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-gray-400 text-sm mt-0.5">Complete tasks to progress through your internship</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks',  value: stats.total,   color: 'text-gray-300'    },
          { label: 'Completed',    value: stats.done,    color: 'text-emerald-400' },
          { label: 'In Review',    value: stats.pending, color: 'text-amber-400'   },
          { label: 'To Do',        value: stats.todo,    color: 'text-brand-400'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Program selector — only shows enrolled programs */}
      {programs.length > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {programs.map(prog => (
            <button key={prog._id} onClick={() => setSelectedId(prog._id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedId === prog._id
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-surface-elevated border-surface-border text-gray-400 hover:text-white'
              }`}>
              {prog.title}
            </button>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…" className="input pl-10 py-2.5 text-sm" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {[
            { id: 'all',       label: 'All'    },
            { id: 'approved',  label: 'Done'   },
            { id: 'pending',   label: 'Review' },
            { id: 'rejected',  label: 'Redo'   },
            { id: 'not_submitted', label: 'Todo' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setStatusFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === id ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Task list */}
      {loadingTasks ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckSquare size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">
            {tasks.length === 0 ? 'No tasks published yet' : 'No tasks match your filters'}
          </p>
          <p className="text-gray-500 text-sm">
            {tasks.length === 0 ? 'Your mentor hasn\'t published any tasks yet. Check back soon!' : 'Try adjusting the filters above'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => {
            const conf       = TYPE_CONFIG[task.type] || TYPE_CONFIG['coding'];
            const Icon       = conf.icon;
            const subStatus  = task.mySubmission?.status || 'not_submitted';
            const statusConf = STATUS_CONFIG[subStatus] || STATUS_CONFIG['not_submitted'];
            const SIcon      = statusConf.icon;
            const isDone     = subStatus === 'approved';

            return (
              <motion.div key={task._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}>
                <button
                  onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
                  className={`w-full card p-5 text-left flex items-center gap-4 hover:border-brand-500/30 transition-all group ${isDone ? 'opacity-70' : ''}`}
                >
                  {/* Type icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${conf.bg}`}>
                    <Icon size={18} className={conf.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className={`font-semibold text-sm ${isDone ? 'text-gray-400 line-through' : 'text-white'} group-hover:text-brand-400 transition-colors`}>
                          {task.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{task.description}</p>
                      </div>
                      <span className={`badge text-xs flex-shrink-0 ${statusConf.bg}`}>
                        <SIcon size={9} className="inline mr-0.5" />{statusConf.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                      <span className={`badge border text-xs ${conf.bg}`}>{conf.label}</span>
                      {task.points > 0 && (
                        <span className="flex items-center gap-1 text-brand-400"><Zap size={10} />{task.points} pts</span>
                      )}
                      {task.isFinalProject && <span className="text-amber-400 font-medium">Final Project</span>}
                      {task.deadline && (
                        <span className={`flex items-center gap-1 ${new Date(task.deadline) < new Date() && subStatus !== 'approved' ? 'text-red-400' : ''}`}>
                          <Clock size={10} />
                          Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {task.mySubmission?.score != null && (
                        <span className="text-emerald-400 font-semibold">{task.mySubmission.score}%</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-gray-600 group-hover:text-brand-400 flex-shrink-0 transition-colors" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}