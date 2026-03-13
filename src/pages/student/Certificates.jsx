import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, Trophy } from 'lucide-react';
import { certificateService } from '../../services/index';
import toast from 'react-hot-toast';

export default function StudentCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService.getMine()
      .then(res => setCerts(res.data.certificates))
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = (cert) => {
    const url = `${window.location.origin}/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied!');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Certificates</h1>
        <p className="text-gray-400 text-sm mt-1">Your earned certificates of completion</p>
      </div>

      {certs.length === 0 ? (
        <div className="card p-16 text-center">
          <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No Certificates Yet</h3>
          <p className="text-gray-400 text-sm">Complete an internship program to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certs.map((cert, i) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card overflow-hidden group"
            >
              {/* Certificate preview header */}
              <div className="bg-gradient-to-br from-brand-900/50 to-violet-900/50 border-b border-brand-500/20 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
                <div className="relative">
                  <Award size={40} className="text-brand-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Certificate of Completion</p>
                  <h3 className="text-white font-bold text-lg">{cert.internship?.title}</h3>
                  <p className="text-brand-400 text-sm mt-1 font-mono">{cert.certificateId}</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-elevated rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-0.5">Issued</p>
                    <p className="text-white text-sm font-medium">
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {cert.finalScore != null && (
                    <div className="bg-surface-elevated rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-0.5">Final Score</p>
                      <p className="text-white text-sm font-medium">{cert.finalScore}% ({cert.grade})</p>
                    </div>
                  )}
                </div>

                {/* QR + actions */}
                <div className="flex items-center justify-between">
                  {cert.qrCodeUrl && (
                    <img src={cert.qrCodeUrl} alt="QR" className="w-16 h-16 rounded-lg" />
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => handleShare(cert)}
                      className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"
                    >
                      <Share2 size={13} /> Share
                    </button>
                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-primary text-xs flex items-center gap-1.5 px-3 py-2"
                      >
                        <Download size={13} /> Download
                      </a>
                    )}
                  </div>
                </div>

                {/* Verify link */}
                <a
                  href={`/verify/${cert.certificateId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-brand-400 text-xs transition-colors"
                >
                  <ExternalLink size={12} /> Verify certificate publicly
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
