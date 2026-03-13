import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Award, Search, Download, ExternalLink, Shield, ShieldOff,
  ChevronLeft, ChevronRight, X, Plus, RefreshCw,
  AlertTriangle, Check, Copy, QrCode, CheckCircle2
} from 'lucide-react';
import { certificateService, userService, internshipService } from '../../services/index';
import toast from 'react-hot-toast';

const LIMIT = 15;

// ── Helpers ───────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
}

function GradeChip({ grade }) {
  const map = { 'A+': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', B: 'text-brand-400 bg-brand-500/10 border-brand-500/20', C: 'text-amber-400 bg-amber-500/10 border-amber-500/20', D: 'text-red-400 bg-red-500/10 border-red-500/20', F: 'text-red-400 bg-red-500/10 border-red-500/20' };
  return <span className={`badge text-xs border ${map[grade] || 'badge-gray'}`}>{grade || '—'}</span>;
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, danger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
        className="card w-full max-w-sm p-6 shadow-2xl">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-400' : 'text-amber-400'} />
        </div>
        <h3 className="text-white font-semibold text-center text-lg mb-1">{title}</h3>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-all active:scale-95 ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}>
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Certificate Detail Modal ──────────────────────────────────────────────────
function CertificateModal({ cert, onClose, onRevoke, onRestore }) {
  const verifyUrl = `${window.location.origin}/verify/${cert.certificateId}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header banner */}
        <div className={`px-6 py-4 flex items-center justify-between ${cert.isValid ? 'bg-gradient-to-r from-emerald-500/10 to-brand-500/10 border-b border-emerald-500/20' : 'bg-red-500/10 border-b border-red-500/20'}`}>
          <div className="flex items-center gap-2">
            {cert.isValid
              ? <><CheckCircle2 size={16} className="text-emerald-400" /><span className="text-emerald-400 font-semibold text-sm">Valid Certificate</span></>
              : <><ShieldOff size={16} className="text-red-400" /><span className="text-red-400 font-semibold text-sm">Revoked</span></>
            }
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Award icon + cert ID */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-3">
              <Award size={28} className="text-brand-400" />
            </div>
            <h3 className="text-white font-bold text-xl">{cert.studentName}</h3>
            <p className="text-gray-400 text-sm">has completed</p>
            <p className="text-brand-400 font-semibold mt-1">{cert.internshipTitle}</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Certificate ID', value: cert.certificateId, mono: true },
              { label: 'Final Score',    value: cert.finalScore != null ? `${cert.finalScore}%` : '—' },
              { label: 'Grade',          value: cert.grade || '—' },
              { label: 'Issued',         value: new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(({ label, value, mono }) => (
              <div key={label} className="card-elevated rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className={`text-white text-sm font-medium ${mono ? 'font-mono text-xs break-all' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* QR */}
          {cert.qrCodeUrl && (
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-xl">
                <img src={cert.qrCodeUrl} alt="QR Code" className="w-24 h-24" />
              </div>
            </div>
          )}

          {/* Verify URL */}
          <div className="flex items-center gap-2 bg-surface-elevated rounded-xl px-3 py-2.5 border border-surface-border">
            <p className="text-gray-400 text-xs flex-1 truncate font-mono">{verifyUrl}</p>
            <button onClick={() => copyToClipboard(verifyUrl)} className="text-brand-400 hover:text-brand-300 flex-shrink-0">
              <Copy size={13} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {cert.fileUrl && (
              <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                <Download size={14} /> Download PDF
              </a>
            )}
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 text-sm px-4">
              <ExternalLink size={13} />
            </a>
            {cert.isValid
              ? <button onClick={() => onRevoke(cert._id)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                  <ShieldOff size={13} /> Revoke
                </button>
              : <button onClick={() => onRestore(cert._id)} className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                  <Shield size={13} /> Restore
                </button>
            }
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Manual Generate Modal ─────────────────────────────────────────────────────
function GenerateModal({ onClose, onGenerated }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [users, setUsers]             = useState([]);
  const [programs, setPrograms]       = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getAll({ role: 'student', limit: 200 }),
      internshipService.getAll({ limit: 100 }),
    ]).then(([uRes, iRes]) => {
      setUsers(uRes.data.users || []);
      setPrograms(iRes.data.internships || []);
    }).finally(() => setLoadingData(false));
  }, []);

  const onSubmit = async (data) => {
    await certificateService.generate(data);
    toast.success('Certificate generated!');
    onGenerated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        className="card w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div>
            <h2 className="text-white font-semibold text-lg">Generate Certificate</h2>
            <p className="text-gray-400 text-sm">Manually issue a certificate to a student</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X size={16} /></button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="label">Student *</label>
              <select {...register('studentId', { required: 'Student is required' })} className="input">
                <option value="">Select student</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}
              </select>
              {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId.message}</p>}
            </div>

            <div>
              <label className="label">Internship Program *</label>
              <select {...register('internshipId', { required: 'Program is required' })} className="input">
                <option value="">Select program</option>
                {programs.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
              {errors.internshipId && <p className="text-red-400 text-xs mt-1">{errors.internshipId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Final Score (%)</label>
                <input type="number" min="0" max="100" {...register('finalScore', { min: 0, max: 100 })} placeholder="e.g. 85" className="input" />
              </div>
              <div>
                <label className="label">Grade</label>
                <select {...register('grade')} className="input">
                  <option value="">Auto</option>
                  {['A+', 'A', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-surface-border">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2 min-w-[140px] justify-center">
                {isSubmitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
                  : <><Award size={15} />Generate</>
                }
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCertificates() {
  const [certs,      setCerts]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [validity,   setValidity]   = useState('all'); // all | valid | revoked
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState(null);
  const [showGen,    setShowGen]    = useState(false);
  const [confirm,    setConfirm]    = useState(null);
  const searchTimer = useRef(null);

  const fetchCerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await certificateService.getAll({
        page, limit: LIMIT,
        ...(validity !== 'all' && { isValid: validity === 'valid' }),
        ...(search.trim() && { search: search.trim() }),
      });
      setCerts(res.data.certificates || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load certificates'); }
    finally { setLoading(false); }
  }, [page, validity, search]);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchCerts, 400);
  };

  const handleRevoke = (id) => {
    setSelected(null);
    setConfirm({
      title:   'Revoke this certificate?',
      message: 'The certificate will be marked invalid and the public verification page will show it as revoked.',
      danger:  true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await certificateService.revoke(id);
          toast.success('Certificate revoked');
          fetchCerts();
        } catch { toast.error('Failed to revoke'); }
      },
    });
  };

  const handleRestore = async (id) => {
    setSelected(null);
    try {
      await certificateService.restore(id);
      toast.success('Certificate restored');
      fetchCerts();
    } catch { toast.error('Failed to restore'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  // Stats derived from current page
  const validCount   = certs.filter(c => c.isValid).length;
  const revokedCount = certs.filter(c => !c.isValid).length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total.toLocaleString()} certificates issued</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchCerts} className="btn-secondary py-2 px-3"><RefreshCw size={14} /></button>
          <button onClick={() => setShowGen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Generate Certificate
          </button>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Issued',   value: total,        icon: Award,       color: 'text-brand-400   bg-brand-500/10' },
          { label: 'Valid',          value: validCount,   icon: CheckCircle2,color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Revoked',        value: revokedCount, icon: ShieldOff,   color: 'text-red-400     bg-red-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-white font-bold text-2xl">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by student name, program, or certificate ID…"
            className="input pl-10 py-2.5 text-sm" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
        </div>

        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {[
            { val: 'all',     lbl: 'All' },
            { val: 'valid',   lbl: 'Valid' },
            { val: 'revoked', lbl: 'Revoked' },
          ].map(({ val, lbl }) => (
            <button key={val} onClick={() => { setValidity(val); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${validity === val ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-20">
            <Award size={44} className="text-gray-700 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No certificates found</p>
            <p className="text-gray-500 text-sm">Generate one manually or approve student submissions</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="border-b border-surface-border bg-surface-elevated/40">
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header hidden md:table-cell">Program</th>
                    <th className="table-header hidden lg:table-cell">Certificate ID</th>
                    <th className="table-header hidden xl:table-cell">Score</th>
                    <th className="table-header hidden xl:table-cell">Grade</th>
                    <th className="table-header hidden lg:table-cell">Issued</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((cert, i) => (
                    <motion.tr key={cert._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }} className="table-row">

                      {/* Student */}
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs flex-shrink-0">
                            {cert.studentName?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">{cert.studentName}</p>
                            <p className="text-gray-500 text-xs truncate">{cert.student?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="table-cell hidden md:table-cell">
                        <p className="text-gray-300 text-sm truncate max-w-[200px]">{cert.internshipTitle}</p>
                      </td>

                      {/* Certificate ID */}
                      <td className="table-cell hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs font-mono">{cert.certificateId}</span>
                          <button onClick={() => copyToClipboard(cert.certificateId)}
                            className="text-gray-600 hover:text-brand-400 transition-colors flex-shrink-0">
                            <Copy size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="table-cell hidden xl:table-cell">
                        <span className="text-white font-semibold text-sm">
                          {cert.finalScore != null ? `${cert.finalScore}%` : '—'}
                        </span>
                      </td>

                      {/* Grade */}
                      <td className="table-cell hidden xl:table-cell">
                        <GradeChip grade={cert.grade} />
                      </td>

                      {/* Issued */}
                      <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Status */}
                      <td className="table-cell">
                        <span className={`badge text-xs ${cert.isValid ? 'badge-success' : 'badge-danger'}`}>
                          {cert.isValid ? 'Valid' : 'Revoked'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-0.5">
                          <button onClick={() => setSelected(cert)} title="View details" className="btn-ghost p-2 text-gray-400 hover:text-white">
                            <Award size={14} />
                          </button>
                          {cert.fileUrl && (
                            <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                              title="Download PDF" className="btn-ghost p-2 text-brand-400 hover:text-brand-300">
                              <Download size={14} />
                            </a>
                          )}
                          {cert.isValid
                            ? <button onClick={() => { setSelected(cert); setTimeout(() => handleRevoke(cert._id), 100); }}
                                title="Revoke" className="btn-ghost p-2 text-red-400 hover:bg-red-500/10">
                                <ShieldOff size={14} />
                              </button>
                            : <button onClick={() => handleRestore(cert._id)}
                                title="Restore" className="btn-ghost p-2 text-emerald-400 hover:bg-emerald-500/10">
                                <Shield size={14} />
                              </button>
                          }
                        </div>
                      </td>
                    </motion.tr>
                  ))}
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

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <CertificateModal
            cert={selected}
            onClose={() => setSelected(null)}
            onRevoke={handleRevoke}
            onRestore={handleRestore}
          />
        )}
      </AnimatePresence>

      {/* ── Generate Modal ── */}
      <AnimatePresence>
        {showGen && <GenerateModal onClose={() => setShowGen(false)} onGenerated={fetchCerts} />}
      </AnimatePresence>

      {/* ── Confirm ── */}
      <AnimatePresence>
        {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      </AnimatePresence>
    </div>
  );
}