import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StubPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">Page Coming Soon</h2>
        <p className="text-gray-400 text-sm">This page is fully scaffolded in the codebase. Connect your backend API to populate this view.</p>
      </motion.div>
    </div>
  );
}
