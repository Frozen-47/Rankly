import React from 'react';
import { Search, BarChart2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 uppercase">Rankly</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-black">Phones</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-black">Laptops</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-black">Headphones</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-black transition-all w-64"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
