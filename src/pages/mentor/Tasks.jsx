import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Search, X, BookOpen, Code2, FileText,
  HelpCircle, Zap, Clock, ChevronRight, Eye, EyeOff,
  RefreshCw, Layers, Users
} from 'lucide-react';
import { taskService, submissionService } from '../../services/index';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  assignment: { icon: FileText,   color: 'text-brand-400',   bg: 'bg-brand-500/10  border-brand-500/20',   label: 'Assignment' },
  project:    { icon: Code2,      color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20',  label: 'Project'    },
  quiz:       { icon: HelpCircle, color: 'text-amber-400',   bg: 'bg-amber-500/10  border-amber-500/20',   label: 'Quiz'       },
  reading:    { icon: BookOpen,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',label: 'Reading'    },
};

export default function MentorTasks() {
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [expandedId,  setExpandedId]  = useState(null);
  const [taskSubs,    setTaskSubs]    = useState({}); // taskId → { total, pending }

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch submissions and derive unique tasks from them
      const res = await submissionService.getAll({ limit: 500 });
      const subs = res.data.submissions || [];

      // Build unique task list from submissions
      const taskMap = {};
      subs.forEach(sub => {
        if (!sub.task) return;
        const id = sub.task._id;
        if (!taskMap[id]) {
          taskMap[id] = {
            _id:           id,
            title:         sub.task.title,
            type:          sub.task.type || 'assignment',
            points:        sub.task.points || 0,
            isFinalProject:sub.task.isFinalProject,
            internship:    sub.internship,
            totalSubs:     0, pendingSubs: 0, approvedSubs: 0,
          };
        }
        taskMap[id].totalSubs++;
        if (['pending','submitted'].includes(sub.status)) taskMap[id].pendingSubs++;
        if (sub.status === 'approved') taskMap[id].approvedSubs++;
      });

      setTasks(Object.values(taskMap));
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filtered = tasks.filter(t => {
    const matchSearch = !search.trim() || t.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">All tasks across your assigned programs with submission stats</p>
        </div>
        <button onClick={loadTasks} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
          <RefreshCw size={13} />
        </button>
      </motion.div>

      {/* Summary strip */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks',      value: tasks.length,                                                 color: 'text-gray-300' },
          { label: 'With Pending',     value: tasks.filter(t => t.pendingSubs  > 0).length,                 color: 'text-amber-400' },
          { label: 'Final Projects',   value: tasks.filter(t => t.isFinalProject).length,                   color: 'text-violet-400' },
          { label: 'Total Submissions',value: tasks.reduce((s, t) => s + (t.totalSubs || 0), 0),            color: 'text-brand-400' },
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
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…" className="input pl-10 py-2.5 text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
        </div>
        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {['all', 'assignment', 'project', 'quiz', 'reading'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${typeFilter === t ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckSquare size={44} className="text-gray-700 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No tasks found</p>
          <p className="text-gray-500 text-sm">Tasks appear here once students start submitting work</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => {
            const conf    = TYPE_CONFIG[task.type] || TYPE_CONFIG.assignment;
            const Icon    = conf.icon;
            const hasPending = task.pendingSubs > 0;

            return (
              <motion.div key={task._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                className={`card overflow-hidden transition-all duration-200 ${hasPending ? 'border-amber-500/20' : ''}`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${conf.bg}`}>
                    <Icon size={16} className={conf.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{task.title}</p>
                      {task.isFinalProject && <span className="badge-brand text-xs">Final Project</span>}
                      {hasPending && (
                        <span className="badge-warning text-xs">{task.pendingSubs} pending</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{task.type}</span>
                      {task.points > 0 && <span className="flex items-center gap-1 text-brand-400"><Zap size={10} />{task.points} pts</span>}
                      <span className="flex items-center gap-1"><Users size={10} />{task.totalSubs} total submissions</span>
                      <span className="hidden sm:flex items-center gap-1 text-emerald-400"><CheckSquare size={10} />{task.approvedSubs} approved</span>
                    </div>
                  </div>

                  {/* Progress mini bar */}
                  {task.totalSubs > 0 && (
                    <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0 w-24">
                      <p className="text-xs text-gray-500">{Math.round((task.approvedSubs / task.totalSubs) * 100)}% approved</p>
                      <div className="progress-bar h-1.5 w-full">
                        <div className="progress-fill" style={{ width: `${(task.approvedSubs / task.totalSubs) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Program badge */}
                  <div className="hidden lg:block flex-shrink-0">
                    <span className="badge-gray text-xs truncate max-w-[120px]">{task.internship?.title}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}