import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Award, Download, Share2, QrCode, Code2 } from 'lucide-react';
import { certificateService } from '../../services/index';

// ── Public Certificate Verification ──────────────────────────────────────────
export function VerifyCertificatePage() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState(certificateId || '');

  const verify = async (id) => {
    try {
      setLoading(true);
      setNotFound(false);
      const res = await certificateService.verify(id || search);
      setCert(res.data.certificate);
    } catch {
      setNotFound(true);
      setCert(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (certificateId) verify(certificateId); else setLoading(false); }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50 pointer-events-none" />
      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center glow">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">CodingX</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Certificate Verification</h1>
          <p className="text-gray-400 text-sm mt-1">Verify the authenticity of a CodingX certificate</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verify()}
              placeholder="Enter Certificate ID (e.g. CX-ABC123-DEF456)"
              className="input flex-1"
            />
            <button onClick={() => verify()} disabled={loading || !search} className="btn-primary px-5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify'}
            </button>
          </div>
        </div>

        {notFound && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
            <XCircle size={48} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg mb-1">Certificate Not Found</h3>
            <p className="text-gray-400 text-sm">This certificate ID doesn't exist or may have been revoked.</p>
          </motion.div>
        )}

        {cert && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            {/* Valid banner */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-brand-500/20 border-b border-emerald-500/20 px-6 py-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-semibold text-sm">Certificate Verified ✓</p>
                <p className="text-gray-400 text-xs">This is an authentic CodingX certificate</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-surface-border">
                <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-3">
                  <Award size={28} className="text-brand-400" />
                </div>
                <h2 className="text-white font-bold text-xl">{cert.studentName}</h2>
                <p className="text-gray-400 text-sm">Successfully completed</p>
                <h3 className="text-brand-400 font-semibold text-lg mt-1">{cert.internshipTitle}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-elevated rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Certificate ID</p>
                  <p className="text-white text-xs font-mono font-medium">{cert.certificateId}</p>
                </div>
                <div className="bg-surface-elevated rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Issued On</p>
                  <p className="text-white text-sm font-medium">
                    {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {cert.qrCodeUrl && (
                <div className="flex justify-center">
                  <img src={cert.qrCodeUrl} alt="QR Code" className="w-24 h-24 rounded-lg" />
                </div>
              )}

              {cert.fileUrl && (
                <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Download size={16} /> Download Certificate
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default VerifyCertificatePage;
