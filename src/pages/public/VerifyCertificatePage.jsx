import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Award, Download, ShieldOff,
  Code2, Calendar, BookOpen, User, Search, Hash
} from 'lucide-react';
import { certificateService } from '../../services/index';

export default function VerifyCertificatePage() {
  const { certificateId } = useParams();
  const [cert,     setCert]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [query,    setQuery]    = useState(certificateId || '');

  const verify = async (id) => {
    const target = id || query;
    if (!target?.trim()) return;
    setLoading(true);
    setNotFound(false);
    setCert(null);
    try {
      const res = await certificateService.verify(target.trim());
      setCert(res.data.certificate);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateId) verify(certificateId);
    else setLoading(false);
  }, []);

  const handleDownload = () => {
    const url = `/api/certificates/download/${cert.certificateId}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `CodingX-Certificate-${cert.certificateId}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center glow">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">CodingX</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Certificate Verification</h1>
          <p className="text-gray-400 text-sm mt-2">Enter a certificate ID to verify its authenticity</p>
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
                placeholder="e.g. CX-L2XYZ0-AB3C4D5E"
                className="input pl-10"
              />
            </div>
            <button
              onClick={() => verify()}
              disabled={loading || !query.trim()}
              className="btn-primary px-5 flex items-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Search size={15} /> Verify</>
              }
            </button>
          </div>
        </motion.div>

        {/* Not found */}
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card p-10 text-center border-red-500/20">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <XCircle size={28} className="text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Certificate Not Found</h3>
              <p className="text-gray-400 text-sm">This ID doesn't match any certificate in our records. It may have been revoked or the ID may be incorrect.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Found */}
        <AnimatePresence>
          {cert && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`card overflow-hidden ${!cert.isValid ? 'border-red-500/30' : 'border-emerald-500/30'}`}>

              {/* Status banner */}
              <div className={`px-6 py-4 flex items-center gap-3 border-b ${
                !cert.isValid
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/20'
              }`}>
                {cert.isValid
                  ? <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                  : <ShieldOff    size={20} className="text-red-400 flex-shrink-0" />
                }
                <div>
                  <p className={`font-semibold text-sm ${cert.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {cert.isValid ? 'Certificate Verified ✓' : 'Certificate Revoked ✗'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {cert.isValid
                      ? 'This is an authentic CodingX certificate'
                      : 'This certificate has been revoked and is no longer valid'
                    }
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Award graphic */}
                <div className="text-center pb-5 border-b border-surface-border">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                    <Award size={36} className="text-brand-400" />
                  </div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1.5">Certificate of Completion</p>
                  <h2 className="text-white font-bold text-2xl mb-1">{cert.studentName}</h2>
                  <p className="text-gray-400 text-sm">Successfully completed</p>
                  <h3 className="text-brand-400 font-bold text-lg mt-1">{cert.internshipTitle}</h3>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Hash,      label: 'Certificate ID', value: cert.certificateId, mono: true },
                    { icon: Calendar,  label: 'Issued On',      value: new Date(cert.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: User,      label: 'Recipient',      value: cert.student?.name || cert.studentName },
                    { icon: BookOpen,  label: 'Program',        value: cert.internship?.title || cert.internshipTitle },
                  ].map(({ icon: Icon, label, value, mono }) => (
                    <div key={label} className="bg-surface-elevated rounded-xl p-3 border border-surface-border">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                        <Icon size={10} />{label}
                      </div>
                      <p className={`text-white text-xs font-medium leading-snug ${mono ? 'font-mono tracking-wide' : ''}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Score / grade */}
                {(cert.finalScore != null || cert.grade) && (
                  <div className="flex items-center justify-center gap-4 p-4 bg-surface-elevated rounded-xl border border-surface-border">
                    {cert.finalScore != null && (
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-0.5">Final Score</p>
                        <p className="text-white font-bold text-2xl">{cert.finalScore}%</p>
                      </div>
                    )}
                    {cert.grade && (
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-0.5">Grade</p>
                        <p className={`font-bold text-2xl ${
                          cert.grade === 'A' ? 'text-emerald-400'
                          : cert.grade === 'B' ? 'text-brand-400'
                          : cert.grade === 'C' ? 'text-amber-400'
                          : 'text-red-400'
                        }`}>{cert.grade}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Download — only if valid, uses backend stream endpoint */}
                {cert.isValid && (
                  <button onClick={handleDownload}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <Download size={16} /> Download Certificate PDF
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}