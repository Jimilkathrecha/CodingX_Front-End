import { motion } from 'framer-motion';
export default function MentorPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
        <h2 className="text-white font-semibold text-lg mb-2">Mentor Portal</h2>
        <p className="text-gray-400 text-sm">Connect your backend API to populate this view.</p>
      </motion.div>
    </div>
  );
}
