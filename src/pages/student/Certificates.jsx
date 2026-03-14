import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Award, Download, Share2, ExternalLink, Trophy,
  CheckCircle2, Calendar, Star, RefreshCw, Lock,
  CreditCard, ShieldCheck, Zap, AlertCircle, X,
  IndianRupee, Loader2
} from 'lucide-react';
import { certificateService, paymentService } from '../../services/index';
import toast from 'react-hot-toast';

// ── Load Razorpay checkout.js on demand ───────────────────────────────────────
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Grade badge ───────────────────────────────────────────────────────────────
function GradeBadge({ grade }) {
  const colors = {
    A: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    B: 'bg-brand-500/10   text-brand-400   border-brand-500/20',
    C: 'bg-amber-500/10   text-amber-400   border-amber-500/20',
    D: 'bg-red-500/10     text-red-400     border-red-500/20',
    F: 'bg-red-500/10     text-red-400     border-red-500/20',
  };
  return grade
    ? <span className={`badge border text-xs font-bold ${colors[grade] || 'badge-gray'}`}>{grade}</span>
    : null;
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ cert, onClose, onPaid }) {
  const { user }   = useSelector(s => s.auth);
  const [busy, setBusy] = useState(false);

  const amountRupees = Math.round((cert.paymentAmount || 49900) / 100);

  const handlePay = async () => {
    setBusy(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Could not load payment gateway. Check your internet connection.');
        setBusy(false);
        return;
      }

      // Create order on backend
      const orderRes = await paymentService.createCertOrder(cert.certificateId);

      // Already paid (e.g. refreshed page mid-flow)
      if (orderRes.data.alreadyPaid) {
        toast.success('Certificate already unlocked!');
        onPaid();
        onClose();
        return;
      }

      const { orderId, amount, currency, keyId, prefill } = orderRes.data;

      const options = {
        key:          keyId,
        amount,
        currency,
        name:         'CodingX',
        description:  `Certificate · ${cert.internshipTitle}`,
        order_id:     orderId,
        prefill: {
          name:  prefill?.name  || user?.name  || '',
          email: prefill?.email || user?.email || '',
        },
        theme:  { color: '#6366f1' },
        handler: async (response) => {
          try {
            await paymentService.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              certificateId:       cert.certificateId,
            });
            toast.success('🎉 Payment successful! Downloading your certificate…');
            onPaid();
            onClose();
          } catch {
            toast.error('Payment verification failed. Contact support with your payment ID.');
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        toast.error(`Payment failed: ${r.error.description}`);
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="card w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-brand-600 to-violet-600 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Award size={28} className="text-white" />
            </div>
            <h2 className="text-white font-bold text-xl">Unlock Your Certificate</h2>
            <p className="text-white/70 text-sm mt-1">{cert.internshipTitle}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* What you get */}
          <div className="space-y-2.5">
            {[
              { icon: Download,    text: 'High-quality PDF certificate' },
              { icon: ShieldCheck, text: 'Publicly verifiable certificate ID' },
              { icon: Share2,      text: 'Shareable verification link' },
              { icon: Zap,         text: 'Lifetime download access' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={12} className="text-emerald-400" />
                </div>
                {text}
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-surface-border">
            <span className="text-gray-400 text-sm">Certificate download fee</span>
            <div className="text-right">
              <span className="text-white font-bold text-2xl flex items-center gap-0.5">
                <IndianRupee size={18} strokeWidth={2.5} />{amountRupees}
              </span>
              <p className="text-gray-600 text-xs">One-time · Non-refundable</p>
            </div>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={busy}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-60"
          >
            {busy
              ? <><Loader2 size={18} className="animate-spin" /> Processing…</>
              : <><CreditCard size={18} /> Pay ₹{amountRupees} &amp; Download</>
            }
          </button>

          <p className="text-center text-gray-600 text-xs flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-500" />
            Secured by Razorpay · UPI · Cards · Net Banking
          </p>

          <button onClick={onClose} className="w-full text-center text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Certificate Card ──────────────────────────────────────────────────────────
function CertCard({ cert, onDownload, onPay, onShare }) {
  const needsPayment = cert.paymentStatus === 'pending';
  const isFree       = cert.paymentStatus === 'not_required';
  const isPaid       = cert.paymentStatus === 'paid';
  const isRevoked    = !cert.isValid;
  const canDownload  = (isFree || isPaid) && !isRevoked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden group transition-all duration-300 ${
        isRevoked     ? 'opacity-60 border-red-500/20'
        : needsPayment? 'border-amber-500/30 hover:border-amber-500/50'
        : 'hover:border-brand-500/30'
      }`}
    >
      {/* Banner */}
      <div className="relative h-36 bg-gradient-to-br from-brand-900/60 via-violet-900/40 to-surface-elevated border-b border-brand-500/20 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        {/* Frame corners */}
        {[['top-0 left-0', 'right'], ['top-0 right-0', 'left'], ['bottom-0 left-0', 'right'], ['bottom-0 right-0', 'left']].map(([pos]) => (
          <div key={pos} className={`absolute ${pos} w-8 h-1 bg-brand-500`} />
        ))}

        <div className="relative text-center px-6">
          {needsPayment
            ? <Lock size={26} className="text-amber-400 mx-auto mb-2" />
            : <Award size={26} className="text-brand-400 mx-auto mb-2" />
          }
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Certificate of Completion</p>
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">
            {cert.internship?.title || cert.internshipTitle}
          </h3>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`badge text-xs border ${
            isRevoked     ? 'badge-danger   border-red-500/30'
            : needsPayment? 'badge-warning  border-amber-500/30'
            : isPaid      ? 'badge-success  border-emerald-500/30'
            :               'badge-success  border-emerald-500/30'
          }`}>
            {isRevoked ? '⛔ Revoked' : needsPayment ? `🔒 ₹${Math.round(cert.paymentAmount/100)}` : '✓ Valid'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Cert ID */}
        <p className="text-brand-400 font-mono text-xs tracking-wider text-center select-all">{cert.certificateId}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-elevated rounded-xl p-3 border border-surface-border">
            <p className="text-gray-500 text-xs flex items-center gap-1 mb-1"><Calendar size={10} />Issued</p>
            <p className="text-white text-sm font-medium">
              {new Date(cert.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-3 border border-surface-border">
            <p className="text-gray-500 text-xs flex items-center gap-1 mb-1"><Star size={10} />Score</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium">{cert.finalScore != null ? `${cert.finalScore}%` : '—'}</p>
              <GradeBadge grade={cert.grade} />
            </div>
          </div>
        </div>

        {/* Payment notice */}
        {needsPayment && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <AlertCircle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-400 text-xs font-semibold">Payment required to download</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Pay ₹{Math.round(cert.paymentAmount / 100)} once to unlock lifetime download access for this certificate.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {isRevoked ? (
            <div className="text-center text-gray-500 text-xs py-2 border border-surface-border rounded-xl">
              Certificate has been revoked
            </div>
          ) : needsPayment ? (
            <button
              onClick={() => onPay(cert)}
              className="w-full py-3 bg-gradient-to-r from-brand-500 to-violet-500 hover:from-brand-600 hover:to-violet-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]"
            >
              <CreditCard size={15} />
              Pay ₹{Math.round(cert.paymentAmount / 100)} &amp; Download Certificate
            </button>
          ) : (
            <button
              onClick={() => onDownload(cert)}
              className="w-full py-2.5 btn-primary flex items-center justify-center gap-2 text-sm"
            >
              <Download size={14} /> Download PDF Certificate
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onShare(cert)}
              className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5 py-2"
            >
              <Share2 size={12} /> Share Link
            </button>
            <button
              onClick={() => window.open(`/verify/${cert.certificateId}`, '_blank', 'noopener,noreferrer')}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
              title="Verify certificate publicly"
            >
              <ExternalLink size={12} /> Verify
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentCertificates() {
  const [certs,    setCerts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null); // cert to pay for

  const load = useCallback(() => {
    setLoading(true);
    certificateService.getMine()
      .then(res => setCerts(res.data.certificates || []))
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Download: hits /api/certificates/download/:id — backend streams the PDF
  const handleDownload = useCallback((cert) => {
    const url = `/api/certificates/download/${cert.certificateId}`;
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `CodingX-Certificate-${cert.certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Certificate download started!');
  }, []);

  // After successful payment: refresh list, then auto-download
  const handlePaid = useCallback((cert) => {
    load();
    setTimeout(() => handleDownload(cert), 1000);
  }, [load, handleDownload]);

  const handleShare = (cert) => {
    const url = `${window.location.origin}/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Verification link copied to clipboard!'))
      .catch(() => toast.error('Could not copy link'));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {certs.length > 0
              ? `${certs.length} certificate${certs.length > 1 ? 's' : ''} earned`
              : 'Complete an internship program to earn your first certificate'}
          </p>
        </div>
        <button onClick={load} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* Empty */}
      {certs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
            <Trophy size={36} className="text-brand-400" />
          </div>
          <h3 className="text-white font-semibold text-xl mb-2">No Certificates Yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
            Complete all required tasks in your internship program to earn a certificate of completion.
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certs.map(cert => (
            <CertCard
              key={cert._id}
              cert={cert}
              onDownload={handleDownload}
              onPay={setPayModal}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* Payment modal */}
      <AnimatePresence>
        {payModal && (
          <PaymentModal
            cert={payModal}
            onClose={() => setPayModal(null)}
            onPaid={() => handlePaid(payModal)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}