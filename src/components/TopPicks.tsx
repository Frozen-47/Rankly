import React from 'react';
import { Product } from '../types';
import { Award, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface TopPicksProps {
  products: Product[];
}

export const TopPicks: React.FC<TopPicksProps> = ({ products }) => {
  const sorted = [...products].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topProducts = sorted.slice(0, 3);

  const icons = [
    <Award className="w-5 h-5 text-yellow-600" />,
    <TrendingUp className="w-5 h-5 text-blue-600" />,
    <Zap className="w-5 h-5 text-purple-600" />
  ];

  const labels = ["Best Overall", "Best Value", "Performance Pick"];
  const colors = ["bg-yellow-50 text-yellow-800 border-yellow-200", "bg-blue-50 text-blue-800 border-blue-200", "bg-purple-50 text-purple-800 border-purple-200"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {topProducts.map((p, i) => (
        <motion.div 
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`p-6 rounded-3xl border ${colors[i]} relative overflow-hidden`}
        >
          <div className="flex items-center gap-3 mb-4">
            {icons[i]}
            <span className="text-xs font-black uppercase tracking-widest">{labels[i]}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <img src={p.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-white" alt="" />
            <div>
              <h4 className="font-bold leading-tight">{p.name}</h4>
              <p className="text-sm opacity-80">Rank: #{i + 1}</p>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Rankly Score</div>
              <div className="text-3xl font-black">{Math.round(p.score || 0)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Price</div>
              <div className="text-xl font-bold">₹{p.price.toLocaleString()}</div>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </motion.div>
      ))}
    </div>
  );
};
