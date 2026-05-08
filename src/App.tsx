/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Info, Star, Bookmark, BookmarkCheck, Sun, Moon } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { compareProducts } from './services/groqService';
import { ComparisonData, Product } from './types';
import { db } from './services/dbService';

function ProductCard({ product, index = 0 }: { product: Product, index?: number }) {
  const { isSignedIn, user } = useUser();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!isSignedIn || !user) return;
    setIsSaved(!isSaved);
    if (!isSaved) {
      await db.saveFavorite(user.id, product);
    } else {
      await db.removeFavorite(user.id, product.id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-sm"
      id={`product-${product.id}`}
    >
      {isSignedIn && (
        <button 
          onClick={handleSave}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-zinc-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={isSaved ? "Remove from favorites" : "Save to favorites"}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> : <Bookmark className="w-4 h-4" />}
        </button>
      )}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Info className="w-20 h-20" />
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-semibold text-foreground leading-tight">{product.name}</h3>
          <p className="text-muted-foreground text-xs font-mono mt-1 tracking-wider uppercase">{product.price}</p>
        </div>
        <div className="flex items-center gap-1 bg-muted border border-border px-2 py-1 rounded-md">
          <Star className="w-3 h-3 fill-indigo-500 text-indigo-500" />
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{product.rating}</span>
        </div>
      </div>

      <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed">
        "{product.summary}"
      </p>

      <div className="flex gap-4 mt-2">
        <div className="flex-1">
          <h4 className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">Key Strengths</h4>
          <ul className="space-y-1">
            {product.pros.slice(0, 3).map((pro, i) => (
              <li key={i} className="text-[11px] flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-500 rounded-full shrink-0" />
                <span className="truncate text-foreground/80">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <h4 className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">Limitations</h4>
          <ul className="space-y-1">
            {product.cons.slice(0, 3).map((con, i) => (
              <li key={i} className="text-[11px] flex items-center gap-2 text-foreground/60">
                <div className="w-1 h-1 bg-zinc-400 dark:bg-zinc-700 rounded-full shrink-0" />
                <span className="truncate">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Rankly Score</span>
          <span className="text-4xl font-semibold text-foreground">
            {product.ranklyScore}
          </span>
        </div>
        <div className="w-12 h-1 bg-muted border border-border rounded-full overflow-hidden self-end mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${product.ranklyScore}%` }}
            className={`h-full ${product.ranklyScore > 80 ? 'bg-indigo-500' : product.ranklyScore > 60 ? 'bg-purple-500' : 'bg-fuchsia-500'}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

function ComparisonMatrix({ data }: { data: ComparisonData }) {
  return (
    <div className="flex flex-col gap-6" id="comparison-matrix">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-x-auto pb-4 bg-card border border-border rounded-xl p-0 overflow-hidden shadow-sm"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="p-8 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold w-1/4">Core Specifications</th>
              {data.products.map(p => (
                <th key={p.id} className="p-8 font-semibold text-lg text-foreground">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.commonSpecs.map((spec, idx) => (
              <tr key={spec} className="hover:bg-muted/30 transition-colors group">
                <td className="p-8 text-sm text-foreground/70 font-medium border-b border-border/40 group-last:border-0">{spec}</td>
                {data.products.map(p => (
                  <td key={p.id} className="p-8 text-sm font-mono text-foreground/90 border-b border-border/40 group-last:border-0">
                    {p.specs[spec] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-10 bg-card border border-border rounded-xl border-l-indigo-500 border-l-2 shadow-sm"
        id="expert-verdict"
      >
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold mb-6 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          Rankly AI Synthesis
        </h3>
        <p className="text-xl leading-relaxed text-foreground/90 max-w-4xl">
          "{data.verdict}"
        </p>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (user) {
        await db.saveSearch(user.id, query);
      }
      const result = await compareProducts(query);
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze products. Please try another search term or link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col w-full overflow-x-hidden" id="rankly-root">
      
      {/* Background Mesh Gradients */}
      <img src="/bg_gradient.avif" className="fixed inset-0 w-full h-full object-cover z-[-50] opacity-40 dark:opacity-60 pointer-events-none" alt="" />

      <div className="p-8 md:p-12 flex flex-col gap-10 flex-1 w-full">
        {/* Header */}
        <div className="flex justify-center w-full pt-4 md:pt-6 px-4 md:px-0">
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 bg-background/80 backdrop-blur-md border border-border px-4 md:px-6 py-4 md:py-3 rounded-2xl md:rounded-full w-full max-w-5xl shadow-sm dark:shadow-2xl dark:shadow-black/50"
          >
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
                  <div className="w-3 h-3 bg-background rounded-sm" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Rankly</h1>
              </div>
              <div className="md:hidden flex items-center gap-4">
                <button 
                  onClick={() => setIsDark(!isDark)} 
                  className="hover:text-foreground transition-colors p-1 text-muted-foreground"
                  title="Toggle Theme"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-full border border-border" } }} />
                </SignedIn>
              </div>
            </div>

            <div className="flex-1 w-full max-w-full md:max-w-md">
              <form onSubmit={handleSearch} className="relative group" id="search-form">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Paste URLs or search..."
                  className="w-full bg-muted/50 md:bg-transparent border border-border md:border-none py-2.5 md:py-2 px-4 rounded-lg md:rounded-none text-sm focus:outline-none focus:border-zinc-500 placeholder:text-muted-foreground text-foreground transition-all"
                />
                <div className="absolute right-4 top-3 md:top-2 text-muted-foreground group-focus-within:text-foreground transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                {loading && (
                  <div className="absolute right-10 top-3 md:top-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </form>
            </div>

            <nav className="flex gap-4 md:gap-6 text-sm font-medium text-muted-foreground items-center justify-between w-full md:w-auto">
              <div className="flex gap-4 md:gap-6">
                <a href="#about" className="hover:text-foreground transition-colors">About</a>
                <a href="#use-cases" className="hover:text-foreground transition-colors">Use Case</a>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => setIsDark(!isDark)} 
                  className="hover:text-foreground transition-colors p-1"
                  title="Toggle Theme"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <SignedIn>
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-full border border-border" } }} />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-foreground text-background px-5 py-2 rounded-full hover:opacity-90 transition-opacity font-medium">Get Started</button>
                  </SignInButton>
                </SignedOut>
              </div>

              <div className="md:hidden">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-foreground text-background px-4 py-1.5 text-xs rounded-full hover:opacity-90 transition-opacity font-medium">Get Started</button>
                  </SignInButton>
                </SignedOut>
              </div>
            </nav>
          </motion.header>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-center mb-8 font-medium"
              >
                {error}
              </motion.div>
            )}

            {data ? (
              <div className="grid grid-cols-12 gap-8">
                {/* Product Grid & Matrix */}
                <section className="col-span-12 lg:col-span-9 flex flex-col gap-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data.products.map((product, idx) => (
                      <ProductCard key={product.id} product={product} index={idx} />
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold text-foreground">Comparison Matrix</h2>
                      <div className="flex gap-3">
                        <span className="bg-muted text-muted-foreground text-[9px] px-3 py-1.5 rounded-full uppercase tracking-widest border border-border">
                          {data.products.length} Products Analyzed
                        </span>
                      </div>
                    </div>
                    <ComparisonMatrix data={data} />
                  </div>
                </section>

                {/* Sidebar Analysis */}
                <motion.aside 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="col-span-12 lg:col-span-3 flex flex-col gap-8"
                >
                  <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60"></div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4 font-bold">Top Value Pick</span>
                    <div className="text-8xl font-bold text-foreground leading-none mb-2 tracking-tighter">
                      {Math.max(...data.products.map(p => p.ranklyScore))}
                    </div>
                    <span className="text-[11px] text-foreground/70 mb-8 font-medium tracking-wide uppercase">Rankly Intelligence</span>
                    <div className="w-full space-y-3">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 opacity-80" 
                          style={{ width: `${Math.max(...data.products.map(p => p.ranklyScore))}%` }} 
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground text-center uppercase tracking-[0.2em] font-bold">
                        Value-to-Performance Ratio
                      </p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-8 flex-1 flex flex-col shadow-sm">
                    <h3 className="font-semibold text-foreground text-xl mb-6">AI Insights</h3>
                    <div className="space-y-6 flex-1">
                      {data.products.slice(0, 2).map((p, i) => (
                        <div key={p.id} className="flex gap-4">
                          <div className={`w-5 h-5 rounded-full ${i === 0 ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'} flex items-center justify-center shrink-0 border border-current/10`}>
                            <div className={`w-1.5 h-1.5 ${i === 0 ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-purple-500 dark:bg-purple-400'} rounded-full`}></div>
                          </div>
                          <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                            <strong className="text-foreground">{p.name}</strong> is identified as the {i === 0 ? 'premium choice' : 'most balanced option'} based on current market sentiment.
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <button className="bg-transparent border border-border text-foreground px-6 py-3 rounded-full hover:bg-muted transition-colors w-full mt-10 font-medium">
                      Git Repository
                    </button>
                  </div>
                </motion.aside>
              </div>
            ) : !loading ? (
              <div className="flex flex-col gap-32 pb-20 pt-20">
                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center gap-8 text-center min-h-[50vh]">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                  >
                    <h2 className="text-6xl md:text-8xl font-bold text-foreground leading-none tracking-tighter mb-6">
                      Deciphering<br />
                      <span className="text-muted-foreground opacity-80">the Market.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light leading-relaxed">
                      The sophisticated engine for online researchers. Search or paste URLs to reveal the hidden value in any product landscape.
                    </p>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl opacity-20 pointer-events-none grayscale mt-10">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2, duration: 0.8 }}
                        className="bg-card border border-border rounded-xl aspect-[4/5]" 
                      />
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col md:flex-row gap-12 items-center max-w-5xl mx-auto w-full px-6"
                  id="about"
                >
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
                      <Star className="w-3 h-3" /> About Rankly
                    </div>
                    <h3 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Intelligence at the speed of thought.</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Rankly isn't just a search engine; it's an automated research assistant powered by Groq's lightning-fast LPU inference engine. We crawl, parse, and synthesize complex product data in milliseconds.
                    </p>
                  </div>
                  <div className="flex-1 w-full bg-card border border-border rounded-2xl p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="space-y-6 relative z-10">
                      {[
                        { title: "Real-time Synthesis", desc: "No pre-baked databases. We analyze live URLs instantly." },
                        { title: "Unbiased Scoring", desc: "Our proprietary AI evaluates objective strengths and weaknesses." },
                        { title: "Standardized Metrics", desc: "We normalize disparate specs into an easy-to-read matrix." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border text-foreground">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="text-foreground font-semibold mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>

                {/* Use Cases Section */}
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="max-w-6xl mx-auto w-full px-6"
                  id="use-cases"
                >
                  <div className="text-center mb-16 space-y-4">
                    <h3 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Built for every workflow.</h3>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From casual shoppers to enterprise procurement, Rankly scales to meet your research needs.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Consumer Tech",
                        role: "For Shoppers",
                        desc: "Stop reading 10 different affiliate blogs. Paste the Amazon URLs of three laptops and instantly see which one actually has the better value-to-performance ratio."
                      },
                      {
                        title: "B2B Software",
                        role: "For Founders",
                        desc: "Choosing between Stripe, Paddle, and LemonSqueezy? Rankly breaks down the API limitations, pricing tiers, and hidden fees into a single matrix."
                      },
                      {
                        title: "Market Research",
                        role: "For Analysts",
                        desc: "Export our raw AI synthesized matrices directly to PDF or CSV to include in your industry reports and stakeholder presentations."
                      }
                    ].map((useCase, i) => (
                      <div key={i} className="bg-card border border-border rounded-2xl p-8 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400 font-bold mb-4 block">
                          {useCase.role}
                        </span>
                        <h4 className="text-xl font-semibold text-foreground mb-4">{useCase.title}</h4>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {useCase.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-60 gap-4">
                  <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
                  <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold animate-pulse">Analyzing Product Data...</span>
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-border/40 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
          <p>© 2024 Rankly AI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
