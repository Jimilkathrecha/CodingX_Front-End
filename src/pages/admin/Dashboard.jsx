import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { Users, BookOpen, Award, FileText, TrendingUp, Clock, CheckCircle2, ArrowRight, Trophy, Zap } from 'lucide-react';
import { analyticsService } from '../../services/index';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } })
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAdminStats()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, charts, recentSubmissions, topStudents } = data || {};

  const enrollmentChartData = charts?.enrollmentTrend?.map(item => ({
    name: months[item._id.month - 1],
    enrollments: item.count
  })) || [];

  const categoryData = charts?.categoryStats?.map((c, i) => ({
    name: c._id?.replace(/-/g, ' '),
    value: c.count,
    enrolled: c.enrolled,
    fill: COLORS[i % COLORS.length]
  })) || [];

  const statCards = [
    { icon: Users, label: 'Total Students', value: stats?.totalStudents || 0, color: 'bg-brand-500/10 text-brand-400', sub: `${stats?.activeEnrollments || 0} active` },
    { icon: BookOpen, label: 'Active Programs', value: stats?.totalInternships || 0, color: 'bg-emerald-500/10 text-emerald-400', sub: 'Published internships' },
    { icon: FileText, label: 'Pending Reviews', value: stats?.submissionsToday || 0, color: 'bg-amber-500/10 text-amber-400', sub: 'Awaiting your review' },
    { icon: Award, label: 'Certificates Issued', value: stats?.totalCertificates || 0, color: 'bg-violet-500/10 text-violet-400', sub: 'All time total' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Platform overview and key metrics</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, sub }, i) => (
          <motion.div key={label} initial="hidden" animate="show" variants={fadeUp} custom={i} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon size={18} />
              </div>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-gray-400 text-xs font-medium mt-0.5">{label}</p>
            <p className="text-gray-600 text-xs mt-1">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enrollment trend */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={2} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Enrollment Trend</h2>
              <p className="text-gray-400 text-xs mt-0.5">Student enrollments over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={enrollmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#fff', fontSize: 12 }} />
              <Line type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category distribution */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3} className="card p-6">
          <h2 className="text-white font-semibold mb-5">Programs by Category</h2>
          <PieChart width={180} height={160} style={{ margin: '0 auto' }}>
            <Pie data={categoryData} dataKey="value" cx={85} cy={75} outerRadius={70} strokeWidth={0}>
              {categoryData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
          <div className="space-y-2 mt-4">
            {categoryData.slice(0, 5).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.fill }} />
                  <span className="text-gray-400 capitalize">{c.name}</span>
                </div>
                <span className="text-white font-medium">{c.enrolled}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending submissions */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={4} className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <h2 className="text-white font-semibold">Pending Submissions</h2>
            <Link to="/admin/submissions" className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-border">
            {(recentSubmissions || []).slice(0, 6).map(sub => (
              <div key={sub._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-elevated/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
                  {sub.student?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{sub.student?.name}</p>
                  <p className="text-gray-500 text-xs truncate">{sub.task?.title}</p>
                </div>
                <span className="badge-warning text-xs flex-shrink-0">Pending</span>
              </div>
            ))}
            {(!recentSubmissions || recentSubmissions.length === 0) && (
              <div className="text-center py-10 text-gray-500 text-sm">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500/40" />
                All submissions reviewed!
              </div>
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={5} className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <h2 className="text-white font-semibold flex items-center gap-2"><Trophy size={16} className="text-amber-400" /> Top Students</h2>
          </div>
          <div className="divide-y divide-surface-border">
            {(topStudents || []).slice(0, 6).map((student, i) => (
              <div key={student._id} className="flex items-center gap-3 px-5 py-3.5">
                <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                  #{i + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
                  {student.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{student.name}</p>
                  <p className="text-gray-500 text-xs">{student.enrolledInternships?.length || 0} programs</p>
                </div>
                <div className="flex items-center gap-1 text-brand-400 text-sm font-semibold">
                  <Zap size={12} />
                  {student.points}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
