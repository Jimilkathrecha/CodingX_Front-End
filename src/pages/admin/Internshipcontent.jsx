import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft, Plus, Edit2, Trash2, GripVertical,
  ChevronDown, ChevronUp, Layers, CheckSquare, X,
  Eye, EyeOff, AlertTriangle, Code2, FileText,
  HelpCircle, Zap, Clock, Star, Save, RefreshCw, BookOpen
} from 'lucide-react';
import { internshipService, moduleService, taskService } from '../../services/index';
import toast from 'react-hot-toast';

// ── Task type config (matches backend enum exactly) ───────────────────────────
const TASK_TYPES = [
  { value: 'coding',           label: 'Coding',       icon: Code2,      color: 'text-violet-400',  bg: 'bg-violet-500/10  border-violet-500/20'  },
  { value: 'file-submission',  label: 'File Upload',  icon: FileText,   color: 'text-brand-400',   bg: 'bg-brand-500/10   border-brand-500/20'   },
  { value: 'project',          label: 'Project',      icon: Star,       color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/20'   },
  { value: 'mcq',              label: 'MCQ Quiz',     icon: HelpCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { value: 'video-submission', label: 'Video Submit', icon: BookOpen,   color: 'text-pink-400',    bg: 'bg-pink-500/10    border-pink-500/20'    },
];
const typeConf = (type) => TASK_TYPES.find(t => t.value === type) || TASK_TYPES[0];

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }} className="card w-full max-w-sm p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-center mb-1">{title}</h3>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ModuleModal({ module, internshipId, onClose, onSaved }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title:       module?.title       || '',
      description: module?.description || '',
      isPublished: module?.isPublished ?? true,
    },
  });

  const onSubmit = async (data) => {
    try {
      if (module?._id) {
        await moduleService.update(module._id, data);
        toast.success('Module updated!');
      } else {
        await moduleService.create({ ...data, internship: internshipId });
        toast.success('Module created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save module');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }} className="card w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <h2 className="text-white font-semibold">{module ? 'Edit Module' : 'Add Module'}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="label">Module Title *</label>
            <input {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Introduction to React" className="input" autoFocus />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Description <span className="text-gray-600">(optional)</span></label>
            <textarea {...register('description')} rows={3}
              placeholder="What will students learn in this module?" className="input resize-none" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-surface-border">
            <input type="checkbox" id="mod-pub" {...register('isPublished')} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="mod-pub" className="text-gray-300 text-sm cursor-pointer">Publish immediately</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save size={14} />
              }
              {module ? 'Update Module' : 'Create Module'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK MODAL
// ─────────────────────────────────────────────────────────────────────────────
function TaskModal({ task, moduleId, internshipId, onClose, onSaved }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title:          task?.title          || '',
      description:    task?.description    || '',
      instructions:   task?.instructions   || '',
      type:           task?.type           || 'coding',
      points:         task?.points         ?? 10,
      maxAttempts:    task?.maxAttempts    ?? 3,
      passingScore:   task?.passingScore   ?? 70,
      isRequired:     task?.isRequired     ?? true,
      isFinalProject: task?.isFinalProject ?? false,
      isPublished:    task?.isPublished    ?? false,
      deadline:       task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data) => {
    try {
      const payload = {
        title:          data.title.trim(),
        description:    data.description.trim(),
        instructions:   data.instructions.trim() || undefined,
        type:           data.type,
        points:         Number(data.points),
        maxAttempts:    Number(data.maxAttempts),
        passingScore:   Number(data.passingScore),
        isRequired:     data.isRequired,
        isFinalProject: data.isFinalProject,
        isPublished:    data.isPublished,
        deadline:       data.deadline || undefined,
        internship:     internshipId,
        module:         moduleId || undefined,
      };

      if (task?._id) {
        await taskService.update(task._id, payload);
        toast.success('Task updated!');
      } else {
        await taskService.create(payload);
        toast.success('Task created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }} className="card w-full max-w-2xl my-6 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div>
            <h2 className="text-white font-semibold">{task ? 'Edit Task' : 'Add Task'}</h2>
            {moduleId && <p className="text-gray-500 text-xs mt-0.5">Will be added to this module</p>}
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title + Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Task Title *</label>
              <input {...register('title', { required: 'Title is required' })}
                placeholder="e.g. Build a REST API" className="input" autoFocus />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Task Type *</label>
              <select {...register('type')} className="input cursor-pointer">
                {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description', { required: 'Description is required' })} rows={3}
              placeholder="What is this task about? What will the student build or learn?"
              className="input resize-none" />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Instructions */}
          <div>
            <label className="label">Detailed Instructions <span className="text-gray-600">(optional)</span></label>
            <textarea {...register('instructions')} rows={4}
              placeholder="Step-by-step instructions, acceptance criteria, what to submit…"
              className="input resize-none font-mono text-sm" />
          </div>

          {/* Points + Attempts + Passing score */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Points</label>
              <input type="number" min="0" max="1000" {...register('points')} className="input" />
            </div>
            <div>
              <label className="label">Max Attempts</label>
              <input type="number" min="1" max="10" {...register('maxAttempts')} className="input" />
            </div>
            <div>
              <label className="label">Passing Score %</label>
              <input type="number" min="0" max="100" {...register('passingScore')} className="input" />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="label">Deadline <span className="text-gray-600">(optional)</span></label>
            <input type="datetime-local" {...register('deadline')} className="input" />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'task-required',  field: 'isRequired',     label: 'Required'      },
              { id: 'task-final',     field: 'isFinalProject', label: 'Final Project' },
              { id: 'task-published', field: 'isPublished',    label: 'Published'     },
            ].map(({ id, field, label }) => (
              <div key={id} className="flex items-center gap-2.5 p-3 bg-surface-elevated rounded-xl border border-surface-border cursor-pointer"
                onClick={() => {}}>
                <input type="checkbox" id={id} {...register(field)} className="w-4 h-4 accent-brand-500 cursor-pointer" />
                <label htmlFor={id} className="text-gray-300 text-xs font-medium cursor-pointer select-none">{label}</label>
              </div>
            ))}
          </div>

          {/* MCQ note */}
          {selectedType === 'mcq' && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2">
              <HelpCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-400 text-xs">
                MCQ questions can be added after creating this task — click Edit on the task to add them.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-surface-border">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save size={14} />
              }
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK ROW (inside module accordion)
// ─────────────────────────────────────────────────────────────────────────────
function TaskRow({ task, onEdit, onDelete, onTogglePublish }) {
  const conf = typeConf(task.type);
  const Icon = conf.icon;

  return (
    <div className={`flex items-center gap-3 px-5 py-3 border-b border-surface-border/40 last:border-b-0 hover:bg-surface-elevated/30 transition-colors group ${!task.isPublished ? 'opacity-60' : ''}`}>
      <GripVertical size={14} className="text-gray-700 cursor-grab flex-shrink-0" />

      {/* Type icon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${conf.bg}`}>
        <Icon size={13} className={conf.color} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white text-sm font-medium truncate max-w-[260px]">{task.title}</span>
          {task.isFinalProject && <span className="badge-brand text-xs">Final</span>}
          {task.isRequired      && <span className="badge text-xs bg-red-500/10 text-red-400 border border-red-500/20">Required</span>}
          {!task.isPublished    && <span className="badge-gray text-xs">Draft</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
          <span>{conf.label}</span>
          <span className="flex items-center gap-0.5 text-brand-400/70"><Zap size={9} />{task.points || 0} pts</span>
          {task.deadline && (
            <span className="flex items-center gap-0.5">
              <Clock size={9} />Due {new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Actions — shown on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onTogglePublish(task)}
          title={task.isPublished ? 'Unpublish' : 'Publish'}
          className={`btn-ghost p-1.5 ${task.isPublished ? 'text-emerald-400 hover:text-emerald-300' : 'text-gray-500 hover:text-white'}`}>
          {task.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={() => onEdit(task)} className="btn-ghost p-1.5 text-brand-400 hover:text-brand-300">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(task)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE CARD (accordion)
// ─────────────────────────────────────────────────────────────────────────────
function ModuleCard({ module, internshipId, index, onModuleChanged }) {
  const [open,      setOpen]      = useState(index === 0);  // first module open by default
  const [tasks,     setTasks]     = useState([]);
  const [loadingT,  setLoadingT]  = useState(false);
  const [taskModal, setTaskModal] = useState(null);  // null | 'new' | taskObj
  const [modModal,  setModModal]  = useState(false);
  const [confirm,   setConfirm]   = useState(null);

  // Load tasks for this module (admin sees all including drafts)
  const loadTasks = useCallback(async () => {
    setLoadingT(true);
    try {
      const res = await taskService.getByInternship(internshipId, {
        moduleId: module._id,
        showAll:  true,           // ← admin sees unpublished tasks too
      });
      // Filter client-side to only tasks belonging to this module
      const filtered = (res.data.tasks || []).filter(t => {
        const tMod = t.module?._id || t.module;
        return tMod?.toString() === module._id?.toString();
      });
      setTasks(filtered);
    } catch { /* silent */ }
    finally { setLoadingT(false); }
  }, [module._id, internshipId]);

  useEffect(() => {
    if (open) loadTasks();
  }, [open, loadTasks]);

  const toggleTaskPublish = async (task) => {
    try {
      await taskService.update(task._id, { isPublished: !task.isPublished });
      setTasks(ts => ts.map(t => t._id === task._id ? { ...t, isPublished: !t.isPublished } : t));
      toast.success(task.isPublished ? 'Task unpublished' : 'Task published');
    } catch { toast.error('Failed'); }
  };

  const deleteTask = async (task) => {
    try {
      await taskService.delete(task._id);
      setTasks(ts => ts.filter(t => t._id !== task._id));
      toast.success('Task deleted');
      setConfirm(null);
    } catch { toast.error('Failed to delete task'); }
  };

  const toggleModulePublish = async () => {
    try {
      await moduleService.update(module._id, { isPublished: !module.isPublished });
      onModuleChanged();
      toast.success(module.isPublished ? 'Module unpublished' : 'Module published');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className={`card overflow-hidden transition-all ${!module.isPublished ? 'opacity-75 border-dashed' : ''}`}>
      {/* Module header row */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-border/60">
        <GripVertical size={16} className="text-gray-700 cursor-grab flex-shrink-0" />

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          module.isPublished
            ? 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
            : 'bg-surface-elevated border border-surface-border text-gray-500'
        }`}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold text-sm">{module.title}</p>
            {!module.isPublished && <span className="badge-gray text-xs">Draft</span>}
          </div>
          <p className="text-gray-600 text-xs mt-0.5">
            {tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? 's' : ''}` : 'No tasks yet'}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={toggleModulePublish}
            title={module.isPublished ? 'Unpublish module' : 'Publish module'}
            className={`btn-ghost p-1.5 ${module.isPublished ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}>
            {module.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={() => setModModal(true)} className="btn-ghost p-1.5 text-brand-400 hover:text-brand-300">
            <Edit2 size={13} />
          </button>
          <button onClick={() => setConfirm({ type: 'module' })} className="btn-ghost p-1.5 text-red-400 hover:text-red-300">
            <Trash2 size={13} />
          </button>
          <button onClick={() => setOpen(v => !v)} className="btn-ghost p-1.5 text-gray-400">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Tasks accordion body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {loadingT ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {tasks.length === 0 && (
                  <p className="text-gray-600 text-sm px-5 py-4">No tasks yet — add the first one below.</p>
                )}
                {tasks.map(task => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onEdit={t => setTaskModal(t)}
                    onTogglePublish={toggleTaskPublish}
                    onDelete={t => setConfirm({ type: 'task', item: t })}
                  />
                ))}
              </>
            )}

            {/* Add task button */}
            <div className="px-5 py-3 border-t border-surface-border/40">
              <button
                onClick={() => setTaskModal('new')}
                className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-xs font-semibold transition-colors"
              >
                <Plus size={13} /> Add Task to this Module
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-modals */}
      <AnimatePresence>
        {modModal && (
          <ModuleModal
            module={module}
            internshipId={internshipId}
            onClose={() => setModModal(false)}
            onSaved={() => { onModuleChanged(); setModModal(false); }}
          />
        )}
        {taskModal && (
          <TaskModal
            task={taskModal === 'new' ? null : taskModal}
            moduleId={module._id}
            internshipId={internshipId}
            onClose={() => setTaskModal(null)}
            onSaved={() => { loadTasks(); setTaskModal(null); }}
          />
        )}
        {confirm && (
          <ConfirmDialog
            title={`Delete ${confirm.type === 'module' ? 'Module' : 'Task'}?`}
            message={
              confirm.type === 'module'
                ? `This will permanently delete "${module.title}" and all its tasks.`
                : `Delete "${confirm.item?.title}"? This cannot be undone.`
            }
            onConfirm={() => {
              if (confirm.type === 'module') {
                moduleService.delete(module._id)
                  .then(() => { toast.success('Module deleted'); onModuleChanged(); })
                  .catch(() => toast.error('Failed to delete module'));
                setConfirm(null);
              } else {
                deleteTask(confirm.item);
              }
            }}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function InternshipContent() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [internship,  setInternship]  = useState(null);
  const [modules,     setModules]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modModal,    setModModal]    = useState(false);
  const [taskModal,   setTaskModal]   = useState(false); // standalone task (no module)

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [iRes, mRes] = await Promise.all([
        internshipService.getById(id),
        moduleService.getByInternship(id),
      ]);
      setInternship(iRes.data.internship);
      setModules(mRes.data.modules || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load';
      toast.error(msg);
      if (err.response?.status === 404) navigate('/admin/internships');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const totalTasks = modules.reduce((sum, m) => sum + (m.tasks?.length || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/internships')}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Programs
          </button>
          <h1 className="text-2xl font-bold text-white">{internship?.title || 'Loading…'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {modules.length} module{modules.length !== 1 ? 's' : ''} · {totalTasks} task{totalTasks !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={load} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
            <RefreshCw size={13} />
          </button>
          <button onClick={() => setTaskModal(true)} className="btn-secondary flex items-center gap-2 text-sm py-2">
            <CheckSquare size={14} /> Standalone Task
          </button>
          <button onClick={() => setModModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus size={14} /> Add Module
          </button>
        </div>
      </motion.div>

      {/* Internship info strip */}
      {internship && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          className="card p-4 flex items-center gap-3 flex-wrap text-sm">
          <span className={`badge text-xs ${internship.isPublished ? 'badge-success' : 'badge-gray'}`}>
            {internship.isPublished ? '🟢 Published' : '⚪ Draft'}
          </span>
          <span className="text-gray-400 capitalize">{internship.category?.replace(/-/g, ' ')}</span>
          <span className="text-gray-400 capitalize">{internship.difficulty}</span>
          <span className="text-gray-400">{internship.duration?.value} {internship.duration?.unit}</span>
          <span className="text-gray-400">{internship.totalEnrolled || 0} enrolled</span>
          {internship.certificatePrice > 0 && (
            <span className="text-amber-400">Cert ₹{Math.round(internship.certificatePrice / 100)}</span>
          )}
        </motion.div>
      )}

      {/* Module list */}
      {modules.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-16 text-center">
          <Layers size={44} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No Modules Yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Organize your content into modules, then add tasks to each module.
          </p>
          <button onClick={() => setModModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={15} /> Create First Module
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, i) => (
            <motion.div key={mod._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <ModuleCard
                module={mod}
                internshipId={id}
                index={i}
                onModuleChanged={load}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Module modal */}
      <AnimatePresence>
        {modModal && (
          <ModuleModal
            internshipId={id}
            onClose={() => setModModal(false)}
            onSaved={() => { load(); setModModal(false); }}
          />
        )}
        {/* Standalone task (not inside any module) */}
        {taskModal && (
          <TaskModal
            internshipId={id}
            onClose={() => setTaskModal(false)}
            onSaved={() => { load(); setTaskModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}