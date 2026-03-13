import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { internshipService } from '../../services/index';

const CATEGORIES = ['all', 'web-development', 'mobile-development', 'ai-ml', 'data-science', 'devops', 'design'];
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

const diffColor = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-danger' };

export default function InternshipsListPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await internshipService.getAll({
        category: category === 'all' ? undefined : category,
        difficulty: difficulty === 'all' ? undefined : difficulty,
        search: search || undefined,
        limit: 24
      });
      setInternships(res.data.internships || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInternships(); }, [category, difficulty]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Internship Programs</h1>
        <p className="text-gray-400 text-lg">Gain real experience, earn verified certificates</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchInternships()}
            placeholder="Search programs..." className="input pl-10" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input w-auto">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input w-auto">
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-surface-elevated" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internships.map((prog, i) => (
            <motion.div key={prog._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card overflow-hidden group hover:border-brand-500/40 transition-all duration-300">
              <div className="h-32 bg-gradient-to-br from-brand-900/40 to-violet-900/40 flex items-center justify-center text-4xl">
                {prog.category === 'ai-ml' ? '🤖' : prog.category === 'web-development' ? '🌐' : prog.category === 'mobile-development' ? '📱' : prog.category === 'data-science' ? '📊' : prog.category === 'devops' ? '☁️' : '🎨'}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`badge text-xs ${diffColor[prog.difficulty] || 'badge-gray'}`}>{prog.difficulty}</span>
                  <span className="badge-gray text-xs">{prog.duration?.value} {prog.duration?.unit}</span>
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-brand-400 transition-colors">{prog.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">{prog.shortDescription || prog.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Users size={12} />
                    <span>{prog.totalEnrolled?.toLocaleString()} enrolled</span>
                  </div>
                  <Link to={`/internships/${prog._id}`} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    View <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {internships.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500">No programs found matching your filters.</div>
      )}
    </div>
  );
}
