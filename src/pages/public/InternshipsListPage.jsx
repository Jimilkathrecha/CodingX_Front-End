import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Users, ArrowRight, Award, BookOpen, IndianRupee } from 'lucide-react';
import { internshipService } from '../../services/index';

const CATEGORIES = ['all', 'web-development', 'mobile-development', 'ai-ml', 'data-science', 'devops', 'design', 'other'];
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

const CAT_ICONS = {
  'web-development':    '🌐',
  'mobile-development': '📱',
  'ai-ml':              '🤖',
  'data-science':       '📊',
  'devops':             '☁️',
  'design':             '🎨',
  'other':              '💡',
};

const DIFF_COLOR = {
  beginner:     'badge-success',
  intermediate: 'badge-warning',
  advanced:     'badge-danger',
};

export default function InternshipsListPage() {
  const [internships, setInternships] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [category,    setCategory]    = useState('all');
  const [difficulty,  setDifficulty]  = useState('all');
  const [search,      setSearch]      = useState('');

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await internshipService.getAll({
        category:   category   === 'all' ? undefined : category,
        difficulty: difficulty === 'all' ? undefined : difficulty,
        search:     search || undefined,
        limit: 24,
      });
      setInternships(res.data.internships || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [category, difficulty]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Internship Programs</h1>
        <p className="text-gray-400 text-lg">Gain real experience, earn verified certificates</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetch()}
            placeholder="Search programs…" className="input pl-10" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input w-auto cursor-pointer">
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input w-auto cursor-pointer">
          {DIFFICULTIES.map(d => (
            <option key={d} value={d}>{d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-72 animate-pulse bg-surface-elevated" />)}
        </div>
      ) : internships.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={44} className="text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-2">No programs found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internships.map((prog, i) => {
            const certPrice = prog.certificatePrice || 0;
            return (
              <motion.div key={prog._id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card overflow-hidden group hover:border-brand-500/40 transition-all duration-300 flex flex-col">

                {/* Thumbnail / Icon banner */}
                <div className="h-32 bg-gradient-to-br from-brand-900/40 via-violet-900/30 to-surface-elevated flex items-center justify-center text-5xl relative overflow-hidden border-b border-surface-border">
                  <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                  <span className="relative">{CAT_ICONS[prog.category] || '💡'}</span>
                  {prog.isFeatured && (
                    <span className="absolute top-2.5 left-2.5 badge-brand text-xs">⭐ Featured</span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`badge text-xs capitalize ${DIFF_COLOR[prog.difficulty] || 'badge-gray'}`}>
                      {prog.difficulty}
                    </span>
                    <span className="badge-gray text-xs">{prog.duration?.value} {prog.duration?.unit}</span>
                    {/* Certificate price badge */}
                    {certPrice > 0
                      ? <span className="badge text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                          <Award size={9} /> Cert ₹{Math.round(certPrice / 100)}
                        </span>
                      : <span className="badge text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                          <Award size={9} /> Free Cert
                        </span>
                    }
                  </div>

                  <h3 className="text-white font-semibold mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
                    {prog.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
                    {prog.shortDescription || prog.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Users size={12} />
                      <span>{prog.totalEnrolled?.toLocaleString() || 0} enrolled</span>
                    </div>
                    <Link to={`/internships/${prog._id}`}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      View <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}