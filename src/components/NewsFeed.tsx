"use client";

import { useState, useMemo } from "react";
import type { FeedResponse, NewsArticle, TopicCluster as TopicClusterType } from "@/types";
import TopicCluster from "./TopicCluster";
import ArticleCard from "./ArticleCard";
import { SOURCES } from "@/lib/sources";

interface Props {
  initialData: FeedResponse;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function SpectrumGradient() {
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[9px] text-blue-300 font-medium">Left</span>
      <div
        className="flex-1 h-1 rounded-full"
        style={{
          background:
            "linear-gradient(to right, #1e40af, #3b82f6, #64748b, #ea580c, #dc2626)",
        }}
      />
      <span className="text-[9px] text-red-300 font-medium">Right</span>
    </div>
  );
}

// ── Balance Score Explainer ──────────────────────────────────────────────────
function BalanceExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer underline decoration-dotted"
      >
        What is the Balance Score?
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-50 w-72 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl text-left">
          <p className="text-xs font-semibold text-white mb-2">Balance Score (0–100)</p>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Measures how broadly a story is covered across the political spectrum. A higher score means more viewpoints are represented.
          </p>
          <div className="space-y-1.5">
            {[
              { range: "80–100", color: "bg-green-500", label: "Both left & right + center coverage" },
              { range: "40–79", color: "bg-amber-500", label: "Left + right, or center coverage" },
              { range: "0–39",  color: "bg-red-500",   label: "Only one side of the spectrum" },
            ].map(({ range, color, label }) => (
              <div key={range} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <span className="text-[10px] text-slate-400">
                  <strong className="text-slate-200">{range}</strong> — {label}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-3 text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Close ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ── Three-column feed (Left | Center | Right) ────────────────────────────────
function ThreeColumnFeed({
  allArticles,
  paidFilter,
}: {
  allArticles: NewsArticle[];
  paidFilter: "all" | "free" | "paid";
}) {
  const filtered = useMemo(() => {
    return allArticles.filter((a) => {
      if (paidFilter === "free") return !a.source.isPaid;
      if (paidFilter === "paid") return a.source.isPaid;
      return true;
    });
  }, [allArticles, paidFilter]);

  const left   = filtered.filter((a) => a.source.biasScore < 0);
  const center = filtered.filter((a) => a.source.biasScore === 0);
  const right  = filtered.filter((a) => a.source.biasScore > 0);

  const COLS: Array<{ label: string; articles: NewsArticle[]; headerClass: string; dotClass: string }> = [
    { label: "Left-Leaning",  articles: left,   headerClass: "text-blue-700 border-b-2 border-blue-500",  dotClass: "bg-blue-500" },
    { label: "Center",        articles: center, headerClass: "text-slate-600 border-b-2 border-slate-400", dotClass: "bg-slate-400" },
    { label: "Right-Leaning", articles: right,  headerClass: "text-red-700 border-b-2 border-red-500",    dotClass: "bg-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {COLS.map(({ label, articles, headerClass, dotClass }) => (
        <div key={label} className="flex flex-col gap-3">
          {/* Column header */}
          <div className={`pb-2 flex items-center gap-2 ${headerClass}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
            <span className="text-sm font-bold">{label}</span>
            <span className="ml-auto text-xs text-text-muted font-normal">
              {articles.length} articles
            </span>
          </div>
          {articles.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-xs">
              No articles match this filter
            </div>
          ) : (
            articles.slice(0, 20).map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))
          )}
        </div>
      ))}
    </div>
  );
}

// ── Featured balanced story ──────────────────────────────────────────────────
function FeaturedStory({ cluster }: { cluster: TopicClusterType }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Most Balanced Story
          </span>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>
      <TopicCluster cluster={cluster} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function NewsFeed({ initialData }: Props) {
  const [data, setData] = useState<FeedResponse>(initialData);
  const [loading, setLoading] = useState(false);
  // "spectrum" filters articles by political leaning
  const [spectrumFilter, setSpectrumFilter] = useState<number | null>(null);
  // "paid" filters articles by access type
  const [paidFilter, setPaidFilter] = useState<"all" | "free" | "paid">("all");

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  // All articles flat (clusters + unclustered)
  const allArticles = useMemo(() => {
    const fromClusters = data.clusters.flatMap((c) => c.articles);
    return [...fromClusters, ...data.unclustered];
  }, [data]);

  // Apply paid filter to clusters for the cluster view
  const filteredClusters = useMemo(() => {
    let clusters = data.clusters;
    if (spectrumFilter !== null) {
      // When a spectrum filter is active, show ONLY articles from that leaning
      clusters = clusters
        .map((c) => ({
          ...c,
          articles: c.articles.filter(
            (a) => a.source.biasScore === spectrumFilter
          ),
        }))
        .filter((c) => c.articles.length > 0);
    }
    if (paidFilter !== "all") {
      clusters = clusters
        .map((c) => ({
          ...c,
          articles: c.articles.filter((a) =>
            paidFilter === "free" ? !a.source.isPaid : a.source.isPaid
          ),
        }))
        .filter((c) => c.articles.length > 0);
    }
    return clusters;
  }, [data.clusters, spectrumFilter, paidFilter]);

  // Best balanced cluster for the featured slot
  const featuredCluster = useMemo(
    () => (data.clusters.length > 0 ? data.clusters[0] : null),
    [data.clusters]
  );

  const isFiltered = spectrumFilter !== null || paidFilter !== "all";

  const SPECTRUM_BTNS = [
    { score: null,  label: "All" },
    { score: -2,    label: "Far Left" },
    { score: -1,    label: "Lean Left" },
    { score: 0,     label: "Center" },
    { score: 1,     label: "Lean Right" },
    { score: 2,     label: "Far Right" },
  ] as const;

  return (
    <div className="min-h-screen bg-bg-page">

      {/* ── Masthead ── */}
      <header className="bg-bg-header border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-red-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3v6c0 5.25-4.5 9-9 10.5C7.5 21 3 17.25 3 12V6z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-text-header leading-none tracking-tight">
                    Unbiased News
                  </h1>
                  <SpectrumGradient />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[11px] text-slate-300 font-medium">
                  {data.articleCount} articles · {data.sourceCount} sources
                </p>
                {data.fetchedAt && (
                  <p className="text-[10px] text-slate-500">
                    Updated {formatTimestamp(data.fetchedAt)}
                  </p>
                )}
              </div>
              <button
                onClick={refresh}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  loading
                    ? "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed"
                    : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/20 cursor-pointer"
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[11px] text-slate-400">
              Read the news, not the algorithm — balanced coverage rises to the top.
            </p>
            <BalanceExplainer />
          </div>
        </div>
      </header>

      {/* ── Filter bar ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">

          {/* Spectrum filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto source-scroll">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide flex-shrink-0">
              Leaning:
            </span>
            {SPECTRUM_BTNS.map(({ score, label }) => {
              const isActive = score === spectrumFilter;
              return (
                <button
                  key={label}
                  onClick={() =>
                    setSpectrumFilter(
                      score === null || score === spectrumFilter ? null : score
                    )
                  }
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-text-secondary border-border hover:border-slate-400 hover:text-text-primary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-border flex-shrink-0" />

          {/* Paid/free filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide flex-shrink-0">
              Access:
            </span>
            {(["all", "free", "paid"] as const).map((val) => (
              <button
                key={val}
                onClick={() => setPaidFilter(val)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all cursor-pointer flex-shrink-0 capitalize ${
                  paidFilter === val
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-text-secondary border-border hover:border-slate-400 hover:text-text-primary"
                }`}
              >
                {val === "all" ? "All" : val === "free" ? "🆓 Free" : "💳 Paid"}
              </button>
            ))}
          </div>

          {/* Active filter count */}
          {isFiltered && (
            <span className="ml-auto text-[10px] text-text-muted flex-shrink-0">
              {filteredClusters.length} cluster{filteredClusters.length !== 1 ? "s" : ""}
              {" · "}
              <button
                onClick={() => { setSpectrumFilter(null); setPaidFilter("all"); }}
                className="underline hover:text-text-secondary cursor-pointer"
              >
                Clear filters
              </button>
            </span>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {loading && filteredClusters.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-text-secondary">
                Fetching from {SOURCES.length} sources...
              </p>
            </div>
          </div>
        ) : filteredClusters.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-text-primary">No stories match your filters</p>
            <p className="text-sm text-text-muted mt-1">Try a different leaning or access filter</p>
            <button
              onClick={() => { setSpectrumFilter(null); setPaidFilter("all"); }}
              className="mt-3 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured balanced cluster — only when no filters active */}
            {!isFiltered && featuredCluster && (
              <FeaturedStory cluster={featuredCluster} />
            )}

            {/* 3-column Left | Center | Right */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex-shrink-0">
                {isFiltered ? "Filtered Stories" : "All Stories by Leaning"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {spectrumFilter !== null ? (
              // Single leaning selected — show flat list
              <div className="flex flex-col gap-4">
                {filteredClusters.map((cluster) => (
                  <TopicCluster key={cluster.id} cluster={cluster} />
                ))}
              </div>
            ) : (
              // No spectrum filter — show 3-column raw feed
              <ThreeColumnFeed allArticles={allArticles} paidFilter={paidFilter} />
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-bg-card">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-400 to-red-500" />
              <span className="text-sm font-bold text-text-primary">Unbiased News</span>
            </div>
            <p className="text-xs text-text-muted text-center">
              {SOURCES.length} outlets · Bias ratings via{" "}
              <a href="https://www.allsides.com/media-bias/ratings" target="_blank" rel="noopener noreferrer" className="underline hover:text-text-secondary">AllSides</a>
              {" & "}
              <a href="https://adfontesmedia.com/interactive-media-bias-chart/" target="_blank" rel="noopener noreferrer" className="underline hover:text-text-secondary">Ad Fontes Media</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
