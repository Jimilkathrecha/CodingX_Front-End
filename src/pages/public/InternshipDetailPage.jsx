import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Clock, Users, BookOpen, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { internshipService } from '../../services/index';
import toast from 'react-hot-toast';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const [internship, setInternship] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    internshipService.getById(id).then(r => setInternship(r.data.internship)).catch(() => navigate('/internships'));
  }, [id]);

  const isEnrolled = user?.enrolledInternships?.some(e => e.internship?._id === id || e.internship === id);

  const handleEnroll = async () => {
    if (!isAuthenticated) return navigate('/register');
    try {
      setEnrolling(true);
      await internshipService.enroll(id);
      toast.success('Enrolled successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  if (!internship) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-brand">{internship.category?.replace(/-/g, ' ')}</span>
              <span className="badge-gray capitalize">{internship.difficulty}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{internship.title}</h1>
            <p className="text-gray-400 leading-relaxed">{internship.description}</p>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-surface-border">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Clock size={16} className="text-brand-400" />{internship.duration?.value} {internship.duration?.unit}</div>
            <div className="flex items-center gap-2 text-gray-300 text-sm"><BookOpen size={16} className="text-brand-400" />{internship.modules?.length || 0} modules</div>
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Users size={16} className="text-brand-400" />{internship.totalEnrolled?.toLocaleString()} enrolled</div>
          </div>

          {internship.skills?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Skills You'll Learn</h3>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map(s => <span key={s} className="badge-brand text-xs">{s}</span>)}
              </div>
            </div>
          )}

          {internship.modules?.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Curriculum</h3>
              <div className="space-y-2">
                {internship.modules.map((mod, i) => (
                  <div key={mod._id} className="card-elevated p-4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-bold">{i + 1}</div>
                    <div><p className="text-white text-sm font-medium">{mod.title}</p><p className="text-gray-400 text-xs">{mod.tasks?.length || 0} tasks</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-5">
              <div className="text-3xl font-bold text-white mb-1">{internship.plans?.[0]?.price === 0 ? 'Free' : `₹${internship.plans?.[0]?.price}`}</div>
              <p className="text-gray-400 text-sm">Full access included</p>
            </div>
            {isEnrolled ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary w-full flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full flex items-center justify-center gap-2">
                {enrolling ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enroll Now <ArrowRight size={16} /></>}
              </button>
            )}
            <div className="mt-5 space-y-2">
              {['Certificate on completion', 'Expert mentor reviews', 'Hands-on projects', 'Lifetime access'].map(f => (
                <div key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                  <CheckCircle2 size={14} className="text-brand-400" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
