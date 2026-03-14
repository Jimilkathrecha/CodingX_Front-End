import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Search, Edit2, Trash2,
  Globe, Lock, Star, StarOff, ChevronLeft, ChevronRight,
  X, Check, AlertTriangle, Users, Layers, RefreshCw, Settings
} from 'lucide-react';
import { internshipService } from '../../services/index';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'web-development',    label: 'Web Development',    icon: '🌐' },
  { value: 'mobile-development', label: 'Mobile Development', icon: '📱' },
  { value: 'ai-ml',              label: 'AI / ML',            icon: '🤖' },
  { value: 'data-science',       label: 'Data Science',       icon: '📊' },
  { value: 'devops',             label: 'DevOps',             icon: '☁️' },
  { value: 'design',             label: 'Design',             icon: '🎨' },
  { value: 'other',              label: 'Other',              icon: '💡' },
];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const DIFF_BADGE   = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-danger' };
const CAT_MAP      = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));
const LIMIT        = 12;

// ─────────────────────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
        className="card w-full max-w-sm p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-center text-lg mb-1">{title}</h3>
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
function InternshipModal({ internship, onClose, onSave }) {
  const isEdit = !!internship;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit ? {
      title:            internship.title,
      description:      internship.description,
      shortDescription: internship.shortDescription || '',
      category:         internship.category,
      difficulty:       internship.difficulty,
      durationValue:    internship.duration?.value || 8,
      durationUnit:     internship.duration?.unit  || 'weeks',
      skills:           internship.skills?.join(', ') || '',
      minScore:         internship.completionCriteria?.minScore || 70,
      certificatePrice: internship.certificatePrice ? Math.round(internship.certificatePrice / 100) : 0,
      isPublished:      internship.isPublished ?? false,
      isFeatured:       internship.isFeatured   ?? false,
    } : {
      difficulty: 'beginner', durationValue: 8, durationUnit: 'weeks',
      minScore: 70, certificatePrice: 0, isPublished: false, isFeatured: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      await onSave({
        title:            data.title.trim(),
        description:      data.description.trim(),
        shortDescription: data.shortDescription?.trim() || '',
        category:         data.category,
        difficulty:       data.difficulty,
        duration:         { value: Number(data.durationValue), unit: data.durationUnit },
        skills:           data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        completionCriteria: { minScore: Number(data.minScore), finalProjectRequired: true, minTasksRequired: 80 },
        certificatePrice: Math.round(Number(data.certificatePrice || 0) * 100),
        isPublished:      data.isPublished,
        isFeatured:       data.isFeatured,
      });
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        className="card w-full max-w-2xl my-6 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div>
            <h2 className="text-white font-semibold text-lg">{isEdit ? 'Edit Internship' : 'Create New Internship'}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{isEdit ? 'Update program details' : 'Add a new internship program'}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="label">Title *</label>
              <input {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'At least 5 characters' } })}
                placeholder="e.g. Full Stack MERN Development Internship" className="input" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category *</label>
                <select {...register('category', { required: 'Category is required' })} className="input">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="label">Difficulty *</label>
                <select {...register('difficulty')} className="input">
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Duration *</label>
                <div className="flex gap-2">
                  <input type="number" min="1" max="52"
                    {...register('durationValue', { required: true, min: 1, max: 52 })}
                    placeholder="8" className="input flex-1" />
                  <select {...register('durationUnit')} className="input w-28">
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Min Passing Score (%)</label>
                <input type="number" min="0" max="100" {...register('minScore')} placeholder="70" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Short Description <span className="text-gray-600">(card preview)</span></label>
              <input {...register('shortDescription')} placeholder="One-line summary…" className="input" maxLength={200} />
            </div>
            <div>
              <label className="label">Full Description *</label>
              <textarea {...register('description', { required: 'Description is required' })} rows={5}
                placeholder="Detailed overview of the program…" className="input resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="label">Skills Covered <span className="text-gray-600">(comma-separated)</span></label>
              <input {...register('skills')} placeholder="React, Node.js, MongoDB, REST APIs" className="input" />
            </div>
            <div>
              <label className="label">
                Certificate Download Fee (₹)
                <span className="text-gray-600 text-xs font-normal ml-2">— 0 = free, e.g. 499 for ₹499</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input type="number" min="0" step="1"
                  {...register('certificatePrice', { min: { value: 0, message: 'Cannot be negative' } })}
                  placeholder="0" className="input pl-8" />
              </div>
              {errors.certificatePrice && <p className="text-red-400 text-xs mt-1">{errors.certificatePrice.message}</p>}
              <p className="text-gray-600 text-xs mt-1">Students pay once to download certificate after completing.</p>
            </div>
            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded accent-brand-500" />
                <span className="text-gray-300 text-sm font-medium">Publish immediately</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded accent-brand-500" />
                <span className="text-gray-300 text-sm font-medium">Feature on landing page</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-border">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 min-w-[140px] justify-center">
              {isSubmitting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Check size={15} /> {isEdit ? 'Save Changes' : 'Create Program'}</>
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ProgramCard({ prog, onEdit, onDelete, onTogglePublish, onToggleFeatured, index }) {
  const cat      = CAT_MAP[prog.category] || { icon: '💡', label: prog.category };
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card flex flex-col hover:border-brand-500/30 transition-all duration-300 group"
    >
      {/* Thumbnail */}
      <div className="h-32 bg-gradient-to-br from-surface-elevated to-surface flex items-center justify-center text-4xl relative border-b border-surface-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <span className="relative z-10">{cat.icon}</span>
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
          <span className={`badge text-xs ${prog.isPublished ? 'badge-success' : 'badge-gray'}`}>
            {prog.isPublished
              ? <><Globe size={9} className="inline mr-0.5" />Live</>
              : <><Lock size={9} className="inline mr-0.5" />Draft</>
            }
          </span>
        </div>
        {prog.isFeatured && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">⭐</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className={`badge text-xs capitalize ${DIFF_BADGE[prog.difficulty] || 'badge-gray'}`}>{prog.difficulty}</span>
          <span className="badge-gray text-xs">{prog.duration?.value} {prog.duration?.unit}</span>
          {prog.certificatePrice > 0
            ? <span className="badge text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Cert ₹{Math.round(prog.certificatePrice / 100)}
              </span>
            : <span className="badge text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Cert Free
              </span>
          }
        </div>

        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
          {prog.title}
        </h3>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">
          {prog.shortDescription || prog.description}
        </p>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-border text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users size={11} />{prog.totalEnrolled?.toLocaleString() || 0} enrolled</span>
          <span className="flex items-center gap-1"><Layers size={11} />{prog.modules?.length || 0} modules</span>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-3">
          {/* PRIMARY: Manage Content → navigates to /admin/internships/:id/content */}
          <button
            onClick={() => navigate(`/admin/internships/${prog._id}/content`)}
            className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5 py-2.5"
          >
            <Settings size={13} /> Manage Content
          </button>

          {/* Edit details */}
          <button
            onClick={() => onEdit(prog)}
            title="Edit details"
            className="btn-secondary text-xs py-2.5 px-3 flex items-center justify-center"
          >
            <Edit2 size={13} />
          </button>

          {/* Publish toggle */}
          <button
            onClick={() => onTogglePublish(prog._id, prog.isPublished)}
            title={prog.isPublished ? 'Unpublish' : 'Publish'}
            className={`text-xs py-2.5 px-3 rounded-xl border font-medium transition-all ${
              prog.isPublished
                ? 'bg-surface-elevated border-surface-border text-gray-400 hover:text-white'
                : 'bg-brand-500/10 border-brand-500/20 text-brand-400 hover:bg-brand-500/20'
            }`}
          >
            {prog.isPublished ? <Lock size={13} /> : <Globe size={13} />}
          </button>

          {/* Feature star */}
          <button onClick={() => onToggleFeatured(prog._id, prog.isFeatured)}
            title={prog.isFeatured ? 'Remove from featured' : 'Mark featured'}
            className="btn-ghost py-2.5 px-2.5">
            {prog.isFeatured
              ? <Star size={14} className="text-amber-400 fill-amber-400" />
              : <StarOff size={14} className="text-gray-600" />
            }
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(prog)}
            title="Delete"
            className="btn-ghost py-2.5 px-2.5 text-red-400 hover:bg-red-500/10">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminInternships() {
  const [internships, setInternships] = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('all');
  const [difficulty,  setDifficulty]  = useState('all');
  const [published,   setPublished]   = useState('all');
  const [page,        setPage]        = useState(1);
  const [modal,       setModal]       = useState(null);   // null | 'new' | progObj
  const [confirm,     setConfirm]     = useState(null);
  const searchTimer = useRef(null);

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      const res = await internshipService.getAll({
        page,
        limit:   LIMIT,
        showAll: true,                                    // ← admin sees ALL including drafts
        ...(category   !== 'all' && { category }),
        ...(difficulty !== 'all' && { difficulty }),
        ...(published  !== 'all' && { isPublished: published === 'published' }),
        ...(search.trim() && { search: search.trim() }),
      });
      setInternships(res.data.internships || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load programs'); }
    finally  { setLoading(false); }
  }, [page, category, difficulty, published, search]);

  useEffect(() => { fetchInternships(); }, [fetchInternships]);

  const handleSearchChange = (val) => {
    setSearch(val); setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchInternships, 400);
  };

  const handleSave = async (payload) => {
    if (modal === 'new') {
      await internshipService.create(payload);
      toast.success('Internship created!');
    } else {
      await internshipService.update(modal._id, payload);
      toast.success('Internship updated!');
    }
    setModal(null);
    fetchInternships();
  };

  const handleDelete = (prog) => {
    setConfirm({
      title:   'Delete this program?',
      message: `"${prog.title}" and all its modules and tasks will be permanently removed.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await internshipService.delete(prog._id);
          toast.success('Internship deleted');
          fetchInternships();
        } catch { toast.error('Failed to delete'); }
      },
    });
  };

  const handleTogglePublish = async (id, current) => {
    try {
      await internshipService.update(id, { isPublished: !current });
      toast.success(current ? 'Unpublished' : 'Published!');
      setInternships(prev => prev.map(p => p._id === id ? { ...p, isPublished: !p.isPublished } : p));
    } catch { toast.error('Failed'); }
  };

  const handleToggleFeatured = async (id, current) => {
    try {
      await internshipService.update(id, { isFeatured: !current });
      toast.success(current ? 'Removed from featured' : 'Featured!');
      setInternships(prev => prev.map(p => p._id === id ? { ...p, isFeatured: !p.isFeatured } : p));
    } catch { toast.error('Failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Internship Programs</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total · {internships.filter(p => p.isPublished).length} live</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchInternships} className="btn-secondary py-2 px-3"><RefreshCw size={14} /></button>
          <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Internship
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
        className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search programs…" className="input pl-10 py-2.5 text-sm" />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="bg-surface-elevated border border-surface-border text-gray-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-500 cursor-pointer">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>

        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {['all', ...DIFFICULTIES].map(d => (
            <button key={d} onClick={() => { setDifficulty(d); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${difficulty === d ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {['all', 'published', 'draft'].map(s => (
            <button key={s} onClick={() => { setPublished(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${published === s ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-surface-elevated" />)}
        </div>
      ) : internships.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-20 text-center">
          <BookOpen size={44} className="text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-2">No programs found</p>
          <p className="text-gray-500 text-sm mb-6">Create your first internship to get started</p>
          <button onClick={() => setModal('new')} className="btn-primary inline-flex items-center gap-2">
            <Plus size={15} /> Create Internship
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {internships.map((prog, i) => (
            <ProgramCard
              key={prog._id}
              prog={prog}
              index={i}
              onEdit={setModal}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-ghost p-2 disabled:opacity-30"><ChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) =>
            Math.max(1, Math.min(page - 3, totalPages - 6)) + i
          ).map(pg => (
            <button key={pg} onClick={() => setPage(pg)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                pg === page ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
              }`}>{pg}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn-ghost p-2 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <InternshipModal
            internship={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      </AnimatePresence>
    </div>
  );
}