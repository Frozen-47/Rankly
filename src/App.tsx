import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ComparisonTable } from './components/ComparisonTable';
import { TopPicks } from './components/TopPicks';
import { Product } from './types';
import { calculateScore, getFeatureScore } from './utils/engine';
import { getAIRecommendation } from './services/geminiService';
import { Sparkles, ArrowRight, MousePointer2, TrendingUp, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiDoc, setAiDoc] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        // Ensure we actually got JSON back, not an HTML error page from Vite
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Failed to get JSON from server");
        }
        return res.json();
      })
      .then(data => {
        const prices = data.map((p: any) => p.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);

        const scoredData = data.map((p: any) => ({
          ...p,
          score: calculateScore(p.rating, p.price, maxPrice, minPrice, getFeatureScore(p.specs))
        }));
        
        setProducts(scoredData);
      })
      .catch(err => {
        console.error("Failed to load products:", err);
      })
      .finally(() => {
        // This ensures the loading screen ALWAYS goes away, even if the fetch fails
        setLoading(false);
      });
  }, []);

  const selectedProducts = useMemo(() => 
    products.filter(p => selectedIds.includes(p.id)),
  [products, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 4) return prev; // Limit to 4
      return [...prev, id];
    });
  };

  const generateRecommendation = async () => {
    if (selectedProducts.length < 2) return;
    setIsAiLoading(true);
    const rec = await getAIRecommendation(selectedProducts);
    setAiDoc(rec);
    setIsAiLoading(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono uppercase tracking-widest animate-pulse">Initializing Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <header className="mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            Smartphone Niche / Q2 2024
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
            Ranked by <span className="font-serif italic font-medium text-gray-400">Intelligence.</span>
          </h1>
          <p className="max-w-2xl text-xl text-gray-500 font-medium">
            Our multi-variable scoring algorithm normalizes price, ratings, and specifications to give you an objective ranking.
          </p>
        </header>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Top Ranking Products
            </h2>
          </div>
          <TopPicks products={products} />
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Discover & Compare</h2>
              <p className="text-gray-500 text-sm">Select up to 4 products for detailed analysis</p>
            </div>
            {selectedIds.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedIds([])}
                className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
              >
                Clear Selection ({selectedIds.length})
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isSelected={selectedIds.includes(product.id)}
                onClick={handleToggleSelect}
              />
            ))}
          </div>
        </section>

        <AnimatePresence>
          {selectedIds.length >= 2 ? (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="mt-20 border-t border-gray-200 pt-20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black">Technical Deep Dive</h2>
                  </div>
                  <ComparisonTable products={selectedProducts} />
                </div>

                <div className="lg:col-span-4">
                  <div className="sticky top-24 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-purple-600 mb-6 font-bold uppercase tracking-widest text-xs">
                      <Sparkles className="w-4 h-4" />
                      AI Insight Engine
                    </div>
                    
                    {aiDoc ? (
                      <div className="prose prose-sm prose-gray max-w-none">
                        <div className="markdown-body">
                          {aiDoc}
                        </div>
                        <button 
                          onClick={generateRecommendation}
                          disabled={isAiLoading}
                          className="mt-6 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                        >
                          {isAiLoading ? 'Regenerating...' : 'Refresh Recommendation'}
                          <BarChart2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-500 text-sm leading-relaxed">
                          Compare the technical specifications side-by-side or launch our AI engine to get a personalized recommendation on which phone fits your budget best.
                        </p>
                        <button 
                          onClick={generateRecommendation}
                          disabled={isAiLoading}
                          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50"
                        >
                          {isAiLoading ? 'Processing...' : 'Run AI Recommendation'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-20 p-12 bg-gray-100/50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center text-center"
            >
              <div className="bg-white p-4 rounded-full shadow-sm mb-6 text-gray-400">
                <MousePointer2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select to Compare</h3>
              <p className="text-gray-500 max-w-md">Pick at least two products from the list above to unlock the ranking engine and technical comparison table.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40 grayscale">
            <div className="bg-black p-1 rounded-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-tight">Rankly</span>
          </div>
          <p className="text-xs text-gray-400 font-mono">Rankly Comparison Engine © 2024 • Data updated hourly</p>
        </div>
      </footer>
    </div>
  );
}