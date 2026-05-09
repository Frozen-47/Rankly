/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RANKLY — Redesigned with a solid, editorial brutalist aesthetic
 * Tailwind CSS · Motion/React · Lucide Icons
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Loader2, Info, Star, Bookmark, BookmarkCheck,
  Sun, Moon, ArrowRight, Zap, BarChart2, Shield,
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { compareProducts } from './services/groqService';
import { ComparisonData, Product } from './types';
import { db } from './services/dbService';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const ALL_TRENDING = [
  { category: "Laptops",     query: "MacBook Pro M3 vs Dell XPS 14",          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80" },
  { category: "Smartphones", query: "iPhone 15 Pro Max vs Galaxy S24 Ultra",   image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop" },
  { category: "Headphones",  query: "Sony WH-1000XM5 vs AirPods Max",         image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80" },
  { category: "Cameras",     query: "Sony A7IV vs Canon R6 Mark II",           image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80" },
  { category: "Tablets",     query: "iPad Pro M4 vs Galaxy Tab S9 Ultra",      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80" },
  { category: "Watches",     query: "Apple Watch Ultra 2 vs Garmin Epix",      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80" },
];

/* ─────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────── */
function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isSignedIn, user } = useUser();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!isSignedIn || !user) return;
    setIsSaved(!isSaved);
    if (!isSaved) await db.saveFavorite(user.id, product);
    else          await db.removeFavorite(user.id, product.id);
  };

  const score = product.ranklyScore;
  const accent = score > 80 ? 'bg-emerald-500' : score > 60 ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] transition-all duration-200 overflow-hidden"
      id={`product-${product.id}`}
    >
      {/* Score stripe */}
      <div className={`h-1.5 w-full ${accent}`} />

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            {product.url && product.url !== "https://example.com" ? (
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-zinc-500 underline-offset-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight font-[family-name:var(--font-display)]">
                  {product.name}
                </h3>
              </a>
            ) : (
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight font-[family-name:var(--font-display)]">
                {product.name}
              </h3>
            )}
            <p className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              {product.price}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1 border-2 border-zinc-900 dark:border-zinc-100 px-2 py-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black font-mono text-zinc-900 dark:text-zinc-50">{product.rating}</span>
            </div>
            {isSignedIn && (
              <button
                onClick={handleSave}
                className="p-1.5 border-2 border-zinc-900 dark:border-zinc-100 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors"
                title={isSaved ? 'Remove' : 'Save'}
              >
                {isSaved
                  ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                  : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3 border-l-4 border-zinc-200 dark:border-zinc-700 pl-3 italic">
          {product.summary}
        </p>

        {/* Pros / Cons */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1.5">Strengths</p>
            <ul className="space-y-1">
              {product.pros.slice(0, 3).map((pro, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <span className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <span className="leading-tight">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1.5">Limitations</p>
            <ul className="space-y-1">
              {product.cons.slice(0, 3).map((con, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                  <span className="mt-1 w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full shrink-0" />
                  <span className="leading-tight">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Rankly Score</p>
            <p className="text-5xl font-black text-zinc-900 dark:text-zinc-50 leading-none font-[family-name:var(--font-display)]">
              {score}
            </p>
          </div>
          <div className="flex-1 mb-1.5">
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: index * 0.08 + 0.3, duration: 0.7, ease: 'easeOut' }}
                className={`h-full ${accent}`}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   COMPARISON MATRIX
───────────────────────────────────────── */
function ComparisonMatrix({ data }: { data: ComparisonData }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="overflow-x-auto border-2 border-zinc-900 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
      >
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-100 dark:text-zinc-900 w-1/4">
                Specification
              </th>
              {data.products.map(p => (
                <th key={p.id} className="px-6 py-4 font-black text-sm uppercase tracking-wide text-zinc-100 dark:text-zinc-900">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.commonSpecs.map((spec, idx) => (
              <tr
                key={spec}
                className={`border-b border-zinc-200 dark:border-zinc-800 last:border-0 ${idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}
              >
                <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {spec}
                </td>
                {data.products.map(p => (
                  <td key={p.id} className="px-6 py-4 text-sm font-mono text-zinc-800 dark:text-zinc-200">
                    {p.specs[spec] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-2 border-zinc-900 dark:border-zinc-100 p-8 bg-zinc-900 dark:bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 mb-4 flex items-center gap-2">
          <Zap className="w-3 h-3 fill-amber-400 text-amber-400" /> Rankly AI Synthesis
        </p>
        <p className="text-xl leading-relaxed text-zinc-50 dark:text-zinc-900 max-w-4xl font-medium">
          "{data.verdict}"
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SEARCH INPUT (reusable)
───────────────────────────────────────── */
function SearchBar({
  value, onChange, onSubmit, loading, size = 'lg',
}: {
  value: string; onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean; size?: 'sm' | 'lg';
}) {
  return (
    <form onSubmit={onSubmit} className="relative w-full" id="search-form">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={size === 'lg' ? 'Paste URLs or type products to compare…' : 'Search products…'}
        className={`w-full border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none pr-14 transition-shadow hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] ${size === 'lg' ? 'py-4 pl-6 text-lg' : 'py-2.5 pl-4 text-sm'}`}
      />
      <button
        type="submit"
        disabled={loading}
        className={`absolute top-1/2 -translate-y-1/2 right-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 transition-colors flex items-center justify-center ${size === 'lg' ? 'p-2.5' : 'p-1.5'}`}
      >
        {loading ? <Loader2 className={`animate-spin ${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} /> : <Search className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
export default function App() {
  const { user } = useUser();
  const [query, setQuery]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [data, setData]                 = useState<ComparisonData | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [isDark, setIsDark]             = useState(true);
  const [trendingIndex, setTrendingIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTrendingIndex(p => (p + 3) % ALL_TRENDING.length), 5500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    // Read query from URL to make the site dynamically shareable
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      executeSearch(q, false);
    }
  }, []);

  const executeSearch = async (q: string, updateUrl = true) => {
    if (!q.trim()) return;
    setQuery(q);
    
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', q);
      window.history.pushState({}, '', url);
    }

    setLoading(true);
    setError(null);
    try {
      if (user) await db.saveSearch(user.id, q);
      setData(await compareProducts(q));
    } catch (err: any) {
      setError(err?.message || 'Analysis failed. Try a different query.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); executeSearch(query); };

  /* ── Fonts injected via style tag ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
        :root { --font-display: 'Barlow Condensed', sans-serif; }
        * { box-sizing: border-box; }
      `}</style>

      <div
        className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ══════════════ HEADER ══════════════ */}
        <header className="sticky top-0 z-50 border-b-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
            {/* Logo */}
            <a href="https://rankly.frozenn.in/" className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-zinc-50 dark:text-zinc-900" />
              </div>
              <span
                className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Rankly
              </span>
            </a>

            {/* Inline search (results view only) */}
            {(data || loading) && (
              <div className="flex-1 hidden md:block max-w-md">
                <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} loading={loading} size="sm" />
              </div>
            )}

            <nav className="ml-auto flex items-center gap-6 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              <a href="#about"     className="hidden md:inline hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors uppercase tracking-wide text-xs">About</a>
              <a href="#use-cases" className="hidden md:inline hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors uppercase tracking-wide text-xs">Use Cases</a>

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 border-2 border-zinc-900 dark:border-zinc-100 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors"
                title="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <SignedIn>
                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 border-2 border-zinc-900 dark:border-zinc-100 rounded-none" } }} />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-5 py-2 text-xs font-black uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors border-2 border-zinc-900 dark:border-zinc-100">
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>
            </nav>
          </div>
        </header>

        {/* ══════════════ MAIN ══════════════ */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
          <AnimatePresence mode="wait">

            {/* Error */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 border-2 border-rose-600 bg-rose-50 dark:bg-rose-950/30 p-5 text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-3"
              >
                <Info className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}

            {/* ── RESULTS VIEW ── */}
            {data ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-12">
                {/* section header */}
                <div className="flex items-center justify-between border-b-2 border-zinc-900 dark:border-zinc-100 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">Analysis for</p>
                    <h2
                      className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight text-zinc-900 dark:text-zinc-50"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {query}
                    </h2>
                  </div>
                  <span className="hidden md:block border-2 border-zinc-900 dark:border-zinc-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-zinc-900">
                    {data.products.length} Products
                  </span>
                </div>

                {/* grid + sidebar */}
                <div className="grid grid-cols-12 gap-8">
                  <section className="col-span-12 lg:col-span-9 flex flex-col gap-10">
                    {/* product cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {data.products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                    </div>

                    {/* matrix */}
                    <div className="flex flex-col gap-4">
                      <h2
                        className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50 border-b-2 border-dashed border-zinc-300 dark:border-zinc-700 pb-3"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        Comparison Matrix
                      </h2>
                      <ComparisonMatrix data={data} />
                    </div>
                  </section>

                  {/* sidebar */}
                  <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-12 lg:col-span-3 flex flex-col gap-6"
                  >
                    {/* top score */}
                    <div className="border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600 mb-2">Top Value Score</p>
                      <p
                        className="text-8xl font-black text-zinc-50 dark:text-zinc-900 leading-none"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {Math.max(...data.products.map(p => p.ranklyScore))}
                      </p>
                      <div className="mt-4 h-1.5 bg-zinc-800 dark:bg-zinc-300">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${Math.max(...data.products.map(p => p.ranklyScore))}%` }}
                        />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-600 mt-2">Value-to-Performance</p>
                    </div>

                    {/* ai insights */}
                    <div className="border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-5 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                      <p
                        className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        AI Insights
                      </p>
                      <div className="flex flex-col gap-4">
                        {[...data.products].sort((a, b) => b.ranklyScore - a.ranklyScore).slice(0, 2).map((p, i) => (
                          <div key={p.id} className={`p-4 border-l-4 ${i === 0 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'}`}>
                            <p className="text-xs font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-50 mb-1">{p.name}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              Ranked as the {i === 0 ? 'top recommended choice' : 'strong alternative'} based on its Rankly Score.
                            </p>
                          </div>
                        ))}
                      </div>
                      <a
                        href="https://github.com/Frozen-47"
                        className="mt-auto border-2 border-zinc-900 dark:border-zinc-100 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-center hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors flex items-center justify-center gap-2"
                      >
                        GitHub <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.aside>
                </div>
              </motion.div>

            ) : loading ? (
              /* ── LOADING ── */
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-48 gap-5">
                <div className="border-2 border-zinc-900 dark:border-zinc-100 p-5">
                  <Loader2 className="w-10 h-10 animate-spin text-zinc-900 dark:text-zinc-50" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 animate-pulse">
                  Analyzing Product Data…
                </p>
              </motion.div>

            ) : (
              /* ── HERO / LANDING ── */
              <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-28 pb-20">

                {/* Hero */}
                <section className="flex flex-col items-start gap-8 pt-12 md:pt-20 max-w-3xl">
                  <div className="inline-flex items-center gap-2 border-2 border-zinc-900 dark:border-zinc-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] bg-amber-400 text-zinc-900">
                    <Zap className="w-3 h-3" /> AI-Powered Comparison Engine
                  </div>
                  <h1
                    className="text-6xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 leading-[0.9]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Compare<br />
                    <span className="text-zinc-400 dark:text-zinc-600">Everything.</span>
                  </h1>
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed font-medium">
                    Search or paste product URLs to reveal data-driven comparisons, specs matrices, and AI verdicts — instantly.
                  </p>
                  <div className="w-full max-w-xl">
                    <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} loading={loading} size="lg" />
                  </div>
                </section>

                {/* Trending */}
                <section className="w-full">
                  <div className="flex items-center justify-between mb-5 border-b-2 border-dashed border-zinc-300 dark:border-zinc-700 pb-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Trending Now
                    </p>
                    <div className="flex gap-1.5">
                      {Array.from({ length: ALL_TRENDING.length / 3 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 transition-all duration-500 ${Math.floor(trendingIndex / 3) === i ? 'w-6 bg-zinc-900 dark:bg-zinc-100' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={trendingIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                      {ALL_TRENDING.slice(trendingIndex, trendingIndex + 3).map((item) => (
                        <button
                          key={item.query}
                          onClick={() => executeSearch(item.query)}
                          className="group text-left border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all duration-150 overflow-hidden"
                        >
                          <div className="relative h-28 overflow-hidden">
                            <img src={item.image} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-zinc-900/50" />
                            <span className="absolute bottom-2 left-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/90 bg-zinc-900/70 px-2 py-0.5">
                              {item.category}
                            </span>
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors leading-tight">
                              {item.query}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </section>

                {/* About */}
                <section
                  id="about"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start border-t-2 border-zinc-900 dark:border-zinc-100 pt-16"
                >
                  <div className="flex flex-col gap-6">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] border-2 border-zinc-900 dark:border-zinc-100 px-3 py-1.5 self-start bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900">
                      About Rankly
                    </span>
                    <h3
                      className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight text-zinc-900 dark:text-zinc-50"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Intelligence at the<br />
                      <span className="text-zinc-400 dark:text-zinc-500">Speed of Thought.</span>
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                      Rankly uses Groq's LPU inference engine to crawl, parse, and synthesize complex product data in milliseconds — delivering unbiased verdicts you can trust.
                    </p>
                  </div>

                  <div className="flex flex-col gap-0 border-2 border-zinc-900 dark:border-zinc-100 divide-y-2 divide-zinc-900 dark:divide-zinc-100">
                    {[
                      { icon: Zap,       title: "Real-time Synthesis",    desc: "No pre-baked databases. We analyze live URLs instantly." },
                      { icon: Shield,    title: "Unbiased Scoring",       desc: "Objective AI evaluation — zero ads, zero affiliate bias." },
                      { icon: BarChart2, title: "Standardized Metrics",   desc: "Disparate specs normalized into one clean, readable matrix." },
                    ].map(({ icon: Icon, title, desc }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-5 p-6 group hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors"
                      >
                        <div className="border-2 border-zinc-900 dark:border-zinc-100 group-hover:border-zinc-50 dark:group-hover:border-zinc-900 p-2 shrink-0">
                          <Icon className="w-4 h-4 text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-50 dark:group-hover:text-zinc-900" />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-wide text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-50 dark:group-hover:text-zinc-900 mb-1">{title}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-400 dark:group-hover:text-zinc-600 leading-relaxed">{desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Use Cases */}
                <section
                  id="use-cases"
                  className="border-t-2 border-zinc-900 dark:border-zinc-100 pt-16 flex flex-col gap-10"
                >
                  <div>
                    <h3
                      className="text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Built for Every Workflow.
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-3">From casual shoppers to enterprise procurement.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-zinc-900 dark:border-zinc-100 divide-y-2 md:divide-y-0 md:divide-x-2 divide-zinc-900 dark:divide-zinc-100">
                    {[
                      { role: "For Shoppers",  title: "Consumer Tech",   desc: "Stop reading affiliate blogs. Paste Amazon URLs and get instant value-to-performance breakdowns." },
                      { role: "For Founders",  title: "B2B Software",    desc: "Compare Stripe vs Paddle vs LemonSqueezy: API limits, pricing tiers, hidden fees — in one matrix." },
                      { role: "For Analysts",  title: "Market Research", desc: "Export AI-synthesized matrices to PDF or CSV for industry reports and stakeholder decks." },
                    ].map((uc, i) => (
                      <div key={i} className="p-8 flex flex-col gap-4 hover:bg-zinc-900 dark:hover:bg-zinc-100 group transition-colors">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] border-2 border-zinc-900 dark:border-zinc-100 group-hover:border-zinc-50 dark:group-hover:border-zinc-900 group-hover:bg-amber-400 group-hover:text-zinc-900 px-2 py-1 self-start text-zinc-700 dark:text-zinc-300 transition-colors">
                          {uc.role}
                        </span>
                        <h4
                          className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-50 dark:group-hover:text-zinc-900 transition-colors"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {uc.title}
                        </h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-400 dark:group-hover:text-zinc-600 leading-relaxed transition-colors">{uc.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer className="border-t-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 py-5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-500 font-medium">
            <a href="https://rankly.frozenn.in/" className="font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
              Rankly
            </a>
            <p>
              Built by <span className="font-black text-zinc-900 dark:text-zinc-50">Sabareesh</span> ·{' '}
              <a href="https://discord.com/users/1272910357517701147" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Discord</a>{' '}·{' '}
              <a href="https://github.com/Frozen-47"               className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">GitHub</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
