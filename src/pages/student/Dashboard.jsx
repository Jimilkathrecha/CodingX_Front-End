import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, PieChart, Pie
} from 'recharts';
import {
  BookOpen, CheckSquare, Award, Zap, TrendingUp,
  Clock, ArrowRight, Star, Trophy
} from 'lucide-react';
import { internshipService, submissionService } from '../../services/index';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } })
};

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp} custom={delay} className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium mb-0.5">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { user } = useSelector(s => s.auth);
  const [progressData, setProgressData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeEnrollment = user?.enrolledInternships?.find(e => e.status === 'active');

  useEffect(() => {
    async function load() {
      try {
        const [subsRes] = await Promise.all([
          submissionService.getMine({ limit: 5 })
        ]);
        setSubmissions(subsRes.data.submissions || []);

        if (activeEnrollment?.internship?._id) {
          const progRes = await internshipService.getProgress(activeEnrollment.internship._id);
          setProgressData(progRes.data.progress);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const moduleChartData = progressData?.moduleProgress?.map(m => ({
    name: m.title.length > 12 ? m.title.slice(0, 12) + '…' : m.title,
    completed: m.completedTasks,
    total: m.totalTasks,
    pct: m.progress
  })) || [];

  const submissionStatusData = [
    { name: 'Approved', value: submissions.filter(s => s.status === 'approved').length, fill: '#6366f1' },
    { name: 'Pending', value: submissions.filter(s => s.status === 'pending').length, fill: '#f59e0b' },
    { name: 'Rejected', value: submissions.filter(s => s.status === 'rejected').length, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const overallPct = progressData?.overallProgress ?? (activeEnrollment?.progress ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track your progress and keep the momentum going.</p>
        </div>
        <div className="flex items-center gap-2 badge-brand px-4 py-2">
          <Zap size={14} className="text-brand-400" />
          <span className="text-sm font-semibold">{user?.points || 0} pts</span>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Enrolled Programs" value={user?.enrolledInternships?.length || 0}
          color="bg-brand-500/10 border border-brand-500/20 text-brand-400" delay={0} />
        <StatCard icon={CheckSquare} label="Tasks Completed" value={progressData?.completedTasks ?? 0}
          color="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" delay={1} />
        <StatCard icon={Award} label="Certificates" value={user?.enrolledInternships?.filter(e => e.status === 'completed').length || 0}
          color="bg-amber-500/10 border border-amber-500/20 text-amber-400" delay={2} />
        <StatCard icon={Star} label="Badges Earned" value={user?.badges?.length || 0}
          color="bg-violet-500/10 border border-violet-500/20 text-violet-400" delay={3} />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Active Internship Progress */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={2} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold">Active Internship</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {activeEnrollment?.internship?.title || 'No active internship'}
              </p>
            </div>
            {activeEnrollment && (
              <Link to={`/dashboard/internship/${activeEnrollment.internship._id}`} className="btn-ghost text-xs flex items-center gap-1">
                View Details <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {activeEnrollment ? (
            <>
              {/* Overall progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-white font-semibold">{overallPct}%</span>
                </div>
                <div className="progress-bar h-3">
                  <motion.div
                    className="progress-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallPct}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                  <span>{progressData?.completedTasks || 0} completed</span>
                  <span>{progressData?.totalTasks || 0} total tasks</span>
                </div>
              </div>

              {/* Module progress chart */}
              {moduleChartData.length > 0 && (
                <div>
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Module Progress</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={moduleChartData} barSize={24}>
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ background: '#16161f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                        formatter={(v) => [`${v}%`, 'Progress']}
                      />
                      <Bar dataKey="pct" radius={[4, 4, 0, 0]} fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">You haven't enrolled in any internship yet.</p>
              <Link to="/internships" className="btn-primary text-sm inline-flex items-center gap-2">
                Browse Programs <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Right: Quick stats + submissions */}
        <div className="space-y-5">
          {/* Submission distribution */}
          {submissions.length > 0 && (
            <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3} className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Submission Status</h3>
              <div className="flex items-center gap-4">
                <PieChart width={80} height={80}>
                  <Pie data={submissionStatusData} dataKey="value" cx={35} cy={35} innerRadius={20} outerRadius={36} strokeWidth={0}>
                    {submissionStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="space-y-2">
                  {submissionStatusData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                      <span className="text-gray-400">{d.name}: <span className="text-white font-medium">{d.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Points & Rank */}
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={4} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Your Points</h3>
              <Trophy size={16} className="text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-gradient mb-1">{user?.points || 0}</div>
            <p className="text-gray-400 text-xs">Keep completing tasks to earn more!</p>

            {/* Badges */}
            {user?.badges?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.badges.slice(0, 4).map((badge, i) => (
                  <div key={i} className="badge-brand text-xs px-2 py-1">{badge.icon} {badge.name}</div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Recent submissions */}
      {submissions.length > 0 && (
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={5} className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <h2 className="text-white font-semibold">Recent Submissions</h2>
            <Link to="/dashboard/submissions" className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-border">
            {submissions.slice(0, 5).map(sub => (
              <div key={sub._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-elevated/50 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{sub.task?.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub.internship?.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  {sub.score != null && (
                    <span className="text-white text-sm font-semibold">{sub.score}%</span>
                  )}
                  <span className={`badge text-xs ${
                    sub.status === 'approved' ? 'badge-success' :
                    sub.status === 'pending' ? 'badge-warning' :
                    sub.status === 'rejected' ? 'badge-danger' : 'badge-gray'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
