import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Search, X, Download, ExternalLink, Copy,
  ChevronLeft, ChevronRight, CheckCircle2, ShieldOff, RefreshCw
} from 'lucide-react';
import { certificateService } from '../../services/index';
import toast from 'react-hot-toast';

const LIMIT = 15;

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
}

function GradeBadge({ grade }) {
  const map = {
    'A+': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'A':  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'B':  'bg-brand-500/10   text-brand-400   border-brand-500/20',
    'C':  'bg-amber-500/10   text-amber-400   border-amber-500/20',
    'D':  'bg-red-500/10     text-red-400     border-red-500/20',
  };
  return grade
    ? <span className={`badge border text-xs ${map[grade] || 'badge-gray'}`}>{grade}</span>
    : null;
}

export default function MentorCertificates() {
  const [certs,   setCerts]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const searchTimer = useRef(null);

  const fetchCerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await certificateService.getAll({
        page, limit: LIMIT,
        ...(search.trim() && { search: search.trim() }),
      });
      setCerts(res.data.certificates || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load certificates'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const handleSearchChange = (v) => {
    setSearch(v);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchCerts, 400);
  };

  const handleDownload = (cert) => {
    const url = `/api/certificates/download/${cert.certificateId}`;
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `CodingX-${cert.certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started!');
  };

  const handleVerify = (certId) => {
    window.open(`/verify/${certId}`, '_blank', 'noopener,noreferrer');
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates Issued</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total.toLocaleString()} certificates across all programs</p>
        </div>
        <button onClick={fetchCerts} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
          <RefreshCw size={13} />
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }} className="card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by student name, program, or certificate ID…"
            className="input pl-10 py-2.5 text-sm" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-20">
            <Award size={44} className="text-gray-700 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No certificates found</p>
            <p className="text-gray-500 text-sm">Certificates appear here once students complete programs</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
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
                      transition={{ delay: i * 0.025 }} className="table-row">

                      {/* Student */}
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs flex-shrink-0 overflow-hidden">
                            {cert.student?.avatar?.url
                              ? <img src={cert.student.avatar.url} alt="" className="w-full h-full object-cover" />
                              : cert.studentName?.[0]?.toUpperCase()
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">{cert.studentName}</p>
                            <p className="text-gray-500 text-xs truncate">{cert.student?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="table-cell hidden md:table-cell">
                        <p className="text-gray-300 text-sm truncate max-w-[180px]">{cert.internshipTitle}</p>
                      </td>

                      {/* Certificate ID */}
                      <td className="table-cell hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs font-mono">{cert.certificateId}</span>
                          <button onClick={() => copyToClipboard(cert.certificateId)}
                            className="text-gray-600 hover:text-brand-400 transition-colors">
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
                        <GradeBadge grade={cert.grade} />
                      </td>

                      {/* Issued */}
                      <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Status */}
                      <td className="table-cell">
                        <span className={`badge text-xs ${cert.isValid ? 'badge-success' : 'badge-danger'}`}>
                          {cert.isValid
                            ? <><CheckCircle2 size={9} className="inline mr-0.5" />Valid</>
                            : <><ShieldOff size={9} className="inline mr-0.5" />Revoked</>
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-0.5">
                          <button onClick={() => handleVerify(cert.certificateId)}
                            title="Verify publicly" className="btn-ghost p-2 text-brand-400 hover:text-brand-300">
                            <ExternalLink size={14} />
                          </button>
                          {cert.fileUrl && (
                            <button onClick={() => handleDownload(cert)}
                              title="Download PDF" className="btn-ghost p-2 text-gray-400 hover:text-white">
                              <Download size={14} />
                            </button>
                          )}
                          <button onClick={() => copyToClipboard(`${window.location.origin}/verify/${cert.certificateId}`)}
                            title="Copy verify link" className="btn-ghost p-2 text-gray-400 hover:text-white">
                            <Copy size={13} />
                          </button>
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
    </div>
  );
}