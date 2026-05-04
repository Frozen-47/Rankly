import React from 'react';
import { Product } from '../types';
import { Check, X, ShieldCheck } from 'lucide-react';

interface ComparisonTableProps {
  products: Product[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ products }) => {
  if (products.length === 0) return null;

  const specKeys = Object.keys(products[0].specs);

  return (
    <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-6 text-sm font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100 italic font-serif">Feature</th>
            {products.map(p => (
              <th key={p.id} className="p-6 border-b border-gray-100 min-w-[200px]">
                <div className="flex items-center gap-3">
                  <img src={p.image} className="w-12 h-12 rounded-lg object-cover border border-gray-200" alt="" />
                  <div>
                    <div className="text-sm font-bold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">₹{p.price.toLocaleString()}</div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specKeys.map(key => (
            <tr key={key} className="hover:bg-gray-50 transition-colors">
              <td className="p-6 text-sm font-medium text-gray-500 capitalize border-b border-gray-100 bg-gray-50/30">
                {key}
              </td>
              {products.map(p => (
                <td key={p.id} className="p-6 text-sm border-b border-gray-100 font-mono text-gray-700">
                  {p.specs[key]}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-black text-white">
            <td className="p-6 text-sm font-bold uppercase tracking-widest italic font-serif">Rankly Score</td>
            {products.map(p => (
              <td key={p.id} className="p-6 border-b border-white/10 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black mb-1">{Math.round(p.score || 0)}</span>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden max-w-[80px]">
                    <div 
                      className="bg-white h-full" 
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
