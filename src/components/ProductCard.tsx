import React from 'react';
import { ShoppingCart, Star, Award } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
  isSelected: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isSelected }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`relative bg-white border ${isSelected ? 'border-black ring-1 ring-black' : 'border-gray-200'} rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md`}
      onClick={() => onClick(product.id)}
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
              {product.source}
            </span>
            <h3 className="font-semibold text-gray-900 leading-tight">{product.name}</h3>
          </div>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700">
            <Star className="w-3 h-3 fill-yellow-700 mr-1" />
            <span className="text-xs font-bold">{product.rating}</span>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <p className="text-xs text-gray-500 font-mono">{product.specs.processor}</p>
          <p className="text-xs text-gray-500 font-mono">{product.specs.ram} RAM | {product.specs.battery}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          <button className={`p-2 rounded-full transition-colors ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {product.score && product.score > 90 && (
        <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center shadow-lg">
          <Award className="w-3 h-3 mr-1" />
          Top Rated
        </div>
      )}
    </motion.div>
  );
};
