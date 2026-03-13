import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, BookOpen, Award, FileText, TrendingUp,
  RefreshCw, Zap, CheckCircle2, Clock, Trophy,
  ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';
import { analyticsService, userService } from '../../services/index';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS     = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={19} />
        </div>
        {trend != null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-white font-bold text-3xl mb-0.5">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, action, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [data,        setData]        = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [period,      setPeriod]      = useState('6m'); // 3m | 6m | 12m

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, leaderRes] = await Promise.all([
        analyticsService.getAdminStats(),
        userService.getLeaderboard(),
      ]);
      setData(analyticsRes.data);
      setLeaderboard(leaderRes.data.leaders || []);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-surface-elevated rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-32 bg-surface-elevated rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-surface-elevated" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card h-72 animate-pulse bg-surface-elevated" />
          <div className="card h-72 animate-pulse bg-surface-elevated" />
        </div>
      </div>
    );
  }

  const { stats, charts, recentSubmissions } = data || {};

  // Enrollment trend data — map month index to readable month name
  const enrollmentData = (() => {
    const raw = charts?.enrollmentTrend || [];
    const periodMap = { '3m': 3, '6m': 6, '12m': 12 };
    const limit = periodMap[period] || 6;
    return raw
      .slice(-limit)
      .map(item => ({
        name:        MONTHS[(item._id?.month ?? 1) - 1],
        enrollments: item.count || 0,
        completions: item.completions || 0,
      }));
  })();

  // Category breakdown
  const categoryData = (charts?.categoryStats || []).map((c, i) => ({
    name:     c._id ? c._id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Other',
    enrolled: c.enrolled || 0,
    programs: c.count || 0,
    fill:     PIE_COLORS[i % PIE_COLORS.length],
  }));

  // Submission status breakdown
  const submissionData = [
    { name: 'Approved',         value: stats?.approvedSubmissions || 0, fill: '#10b981' },
    { name: 'Pending Review',   value: stats?.pendingSubmissions  || 0, fill: '#f59e0b' },
    { name: 'Rejected',         value: stats?.rejectedSubmissions || 0, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const totalSubmissions = submissionData.reduce((s, d) => s + d.value, 0);

  // Completion rate
  const completionRate = stats?.totalEnrollments
    ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-0.5">Platform performance overview</p>
        </div>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Total Students"      value={stats?.totalStudents || 0}       sub={`${stats?.newStudentsThisMonth || 0} this month`}   color="bg-brand-500/10   text-brand-400"   trend={stats?.studentGrowth}    delay={0}    />
        <StatCard icon={BookOpen}     label="Active Programs"     value={stats?.totalInternships || 0}    sub={`${stats?.publishedInternships || 0} published`}    color="bg-emerald-500/10 text-emerald-400" trend={null}                    delay={0.04} />
        <StatCard icon={FileText}     label="Total Submissions"   value={totalSubmissions}                sub={`${stats?.pendingSubmissions || 0} pending review`} color="bg-amber-500/10   text-amber-400"   trend={null}                    delay={0.08} />
        <StatCard icon={Award}        label="Certificates Issued" value={stats?.totalCertificates || 0}  sub={`${completionRate}% completion rate`}               color="bg-violet-500/10  text-violet-400"  trend={null}                    delay={0.12} />
      </div>

      {/* ── Secondary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Enrollments',  value: stats?.activeEnrollments  || 0, icon: TrendingUp,   color: 'text-brand-400'   },
          { label: 'Avg Score',           value: stats?.avgScore ? `${stats.avgScore}%` : '—', icon: Target, color: 'text-emerald-400' },
          { label: 'Mentors',             value: stats?.totalMentors || 0,        icon: Users,        color: 'text-violet-400'  },
          { label: 'Completion Rate',     value: `${completionRate}%`,            icon: CheckCircle2, color: 'text-amber-400'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="card-elevated rounded-2xl p-4 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main charts ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Enrollment trend area chart */}
        <ChartCard
          title="Enrollment Trend"
          subtitle="Student signups over time"
          delay={0.2}
          action={
            <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
              {['3m', '6m', '12m'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={enrollmentData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2.5} fill="url(#enrollGrad)" name="Enrollments" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Submission breakdown pie */}
        <ChartCard title="Submission Status" subtitle="All-time breakdown" delay={0.24}>
          {submissionData.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <PieChart width={160} height={160}>
                    <Pie data={submissionData} dataKey="value" cx={76} cy={76} innerRadius={40} outerRadius={72} strokeWidth={0} paddingAngle={3}>
                      {submissionData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                  </PieChart>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-white font-bold text-lg">{totalSubmissions}</p>
                    <p className="text-gray-500 text-xs">total</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {submissionData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-gray-400 text-sm">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{d.value}</span>
                      <span className="text-gray-600 text-xs">({Math.round((d.value / totalSubmissions) * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No submission data yet</div>
          )}
        </ChartCard>

        {/* Leaderboard */}
        <ChartCard title="Top Students" subtitle="Ranked by points earned" delay={0.28}>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {leaderboard.slice(0, 10).map((student, i) => (
              <div key={student._id} className="flex items-center gap-3 py-2">
                {/* Rank */}
                <div className={`w-6 text-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'
                }`}>
                  {i < 3
                    ? ['🥇', '🥈', '🥉'][i]
                    : `#${i + 1}`
                  }
                </div>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs flex-shrink-0 overflow-hidden">
                  {student.avatar?.url
                    ? <img src={student.avatar.url} alt="" className="w-full h-full object-cover" />
                    : student.name?.[0]?.toUpperCase()
                  }
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{student.name}</p>
                  <p className="text-gray-600 text-xs">{student.completedPrograms || 0} programs done</p>
                </div>
                {/* Points */}
                <div className="flex items-center gap-1 text-brand-400 font-semibold text-sm flex-shrink-0">
                  <Zap size={11} />{student.points?.toLocaleString()}
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-sm">No student data yet</div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* ── Category breakdown bar chart ── */}
      {categoryData.length > 0 && (
        <ChartCard title="Enrollments by Category" subtitle="Which programs are most popular" delay={0.32}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="enrolled" name="Enrollments" radius={[6, 6, 0, 0]}>
                {categoryData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Recent submissions table ── */}
      {recentSubmissions?.length > 0 && (
        <ChartCard title="Recent Submissions" subtitle="Latest activity needing review" delay={0.36}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b border-surface-border">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Task</th>
                  <th className="table-header hidden md:table-cell">Program</th>
                  <th className="table-header hidden lg:table-cell">Submitted</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.slice(0, 8).map((sub, i) => (
                  <tr key={sub._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-bold">
                          {sub.student?.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-white text-sm font-medium">{sub.student?.name}</p>
                      </div>
                    </td>
                    <td className="table-cell text-gray-300 text-sm">{sub.task?.title}</td>
                    <td className="table-cell hidden md:table-cell text-gray-500 text-xs">{sub.internship?.title}</td>
                    <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="table-cell">
                      <span className={`badge text-xs ${
                        sub.status === 'approved'  ? 'badge-success' :
                        sub.status === 'pending'   ? 'badge-warning' :
                        sub.status === 'rejected'  ? 'badge-danger'  : 'badge-gray'
                      }`}>{sub.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}