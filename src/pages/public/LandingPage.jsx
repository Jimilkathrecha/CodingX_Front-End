import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Code2, Award, BarChart3, Users,
  CheckCircle2, Star, Zap, Shield, Globe, ChevronRight
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' } })
};

const programs = [
  { icon: '⚛️', name: 'Full Stack MERN', duration: '8 weeks', level: 'Intermediate', enrolled: 1240 },
  { icon: '🤖', name: 'AI & Machine Learning', duration: '10 weeks', level: 'Advanced', enrolled: 890 },
  { icon: '📱', name: 'React Developer', duration: '6 weeks', level: 'Beginner', enrolled: 2100 },
  { icon: '☁️', name: 'DevOps & Cloud', duration: '8 weeks', level: 'Intermediate', enrolled: 650 },
];

const features = [
  { icon: Code2, title: 'Hands-On Projects', desc: 'Build real-world projects guided by industry mentors and earn practical experience.' },
  { icon: Award, title: 'Verified Certificates', desc: 'QR-code verified certificates that employers trust and can verify instantly.' },
  { icon: BarChart3, title: 'Progress Analytics', desc: 'Visual dashboards to track your learning journey and performance metrics.' },
  { icon: Users, title: 'Expert Mentors', desc: 'Get code reviews, feedback, and guidance from experienced industry professionals.' },
  { icon: Zap, title: 'Task-Based Learning', desc: 'Structured task system with automatic grading and instant feedback loops.' },
  { icon: Shield, title: 'Industry Recognition', desc: 'Programs designed with industry standards used by top tech companies.' },
];

const stats = [
  { value: '12,000+', label: 'Students Enrolled' },
  { value: '95%', label: 'Completion Rate' },
  { value: '50+', label: 'Expert Mentors' },
  { value: '8,500+', label: 'Certificates Issued' },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-grid-pattern bg-grid">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="absolute inset-0 bg-noise pointer-events-none opacity-50" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial="hidden" animate="show" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 badge-brand text-xs px-4 py-2 mb-8"
          >
            <Zap size={12} className="text-brand-400" />
            <span>Now accepting applications for 2026 cohort</span>
          </motion.div>

          <motion.h1
            initial="hidden" animate="show" variants={fadeUp} custom={1}
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
          >
            Launch Your
            <span className="text-gradient block">Tech Career</span>
            With Real Experience
          </motion.h1>

          <motion.p
            initial="hidden" animate="show" variants={fadeUp} custom={2}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Industry-grade internship programs with hands-on projects, expert mentorship,
            and verified certificates that set you apart.
          </motion.p>

          <motion.div
            initial="hidden" animate="show" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5 glow">
              Start Your Journey <ArrowRight size={18} />
            </Link>
            <Link to="/internships" className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
              Explore Programs <ChevronRight size={18} />
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial="hidden" animate="show" variants={fadeUp} custom={4}
            className="flex items-center justify-center gap-6 mt-12 text-sm text-gray-500"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-brand-400" />
              <span>No experience required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-brand-400" />
              <span>Free & Premium plans</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-brand-400" />
              <span>Certificate on completion</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-surface-border bg-surface-card">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Internship Programs</h2>
          <p className="text-gray-400 text-lg">Choose your path and start building real skills today</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {programs.map((p, i) => (
            <motion.div
              key={p.name}
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="card p-6 cursor-pointer group hover:border-brand-500/50 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="text-white font-semibold text-base mb-2 group-hover:text-brand-400 transition-colors">{p.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-gray">{p.duration}</span>
                <span className="badge-brand">{p.level}</span>
              </div>
              <p className="text-gray-500 text-xs">{p.enrolled.toLocaleString()} enrolled</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/internships" className="btn-secondary inline-flex items-center gap-2">
            View All Programs <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-surface-card border-y border-surface-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-400 text-lg">Built for developers, by developers</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                className="card-elevated p-6 group hover:border-brand-500/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <f.icon size={20} className="text-brand-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your
              <span className="text-gradient"> Journey?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join thousands of developers who've accelerated their careers with CodingX.
            </p>
            <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 glow">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Code2 size={14} className="text-white" />
            </div>
            <span className="text-white font-bold">CodingX</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} CodingX. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/internships" className="hover:text-white transition-colors">Programs</Link>
            <Link to="/verify" className="hover:text-white transition-colors">Verify Certificate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
