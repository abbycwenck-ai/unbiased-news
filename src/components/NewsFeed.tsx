"use client";

import { useState } from "react";
import type { FeedResponse } from "@/types";
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

const BIAS_FILTERS = [
  { score: null, label: "All Stories" },
  { score: -2, label: "Far Left" },
  { score: -1, label: "Lean Left" },
  { score: 0, label: "Center" },
  { score: 1, label: "Lean Right" },
  { score: 2, label: "Far Right" },
] as const;

// The political spectrum gradient bar shown in the header
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

export default function NewsFeed({ initialData }: Props) {
  const [data, setData] = useState<FeedResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [biasFilter, setBiasFilter] = useState<number | null>(null);
  const [showUnclustered, setShowUnclustered] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredClusters =
    biasFilter !== null
      ? data.clusters.filter((c) =>
          c.articles.some((a) => a.source.biasScore === biasFilter)
        )
      : data.clusters;

  return (
    <div className="min-h-screen bg-bg-page">
      {/* ── Masthead ── */}
      <header className="bg-bg-header border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-red-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6l9-3 9 3v6c0 5.25-4.5 9-9 10.5C7.5 21 3 17.25 3 12V6z"
                    />
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

            {/* Stats + Refresh */}
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
                <svg
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mission statement ── */}
        <div className="border-t border-white/5 bg-white/5">
          <div className="max-w-5xl mx-auto px-4 py-2">
            <p className="text-[11px] text-slate-400 text-center">
              Read the news, not the algorithm. Stories sorted by political
              balance — coverage from across the spectrum rises to the top.
            </p>
          </div>
        </div>
      </header>

      {/* ── Filter bar ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto source-scroll">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide flex-shrink-0 mr-1">
              Filter:
            </span>
            {BIAS_FILTERS.map(({ score, label }) => {
              const isActive = score === biasFilter;
              return (
                <button
                  key={label}
                  onClick={() =>
                    setBiasFilter(
                      score === biasFilter || score === null ? null : score
                    )
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-text-secondary border-border hover:border-slate-400 hover:text-text-primary"
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {biasFilter !== null && (
              <span className="ml-auto text-[10px] text-text-muted flex-shrink-0">
                {filteredClusters.length} cluster
                {filteredClusters.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
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
              <p className="text-xs text-text-muted mt-1">
                This may take a moment
              </p>
            </div>
          </div>
        ) : filteredClusters.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-text-primary">
              No stories found
            </p>
            <p className="text-sm text-text-muted mt-1">
              Try a different filter or click Refresh
            </p>
          </div>
        ) : (
          <>
            {/* Section label */}
            {biasFilter === null && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                  Top Stories · Balanced First
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            <div className="flex flex-col gap-5">
              {filteredClusters.map((cluster) => (
                <TopicCluster key={cluster.id} cluster={cluster} />
              ))}
            </div>

            {/* ── Unclustered section ── */}
            {data.unclustered.length > 0 && biasFilter === null && (
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-border" />
                  <button
                    onClick={() => setShowUnclustered(!showUnclustered)}
                    className="flex items-center gap-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    More Stories ({data.unclustered.length})
                    <svg
                      className={`w-3 h-3 transition-transform ${showUnclustered ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {showUnclustered && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.unclustered.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </div>
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
              <span className="text-sm font-bold text-text-primary">
                Unbiased News
              </span>
            </div>
            <p className="text-xs text-text-muted text-center">
              {SOURCES.length} outlets · Bias ratings via{" "}
              <a
                href="https://www.allsides.com/media-bias/ratings"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-secondary"
              >
                AllSides
              </a>{" "}
              &{" "}
              <a
                href="https://adfontesmedia.com/interactive-media-bias-chart/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-secondary"
              >
                Ad Fontes Media
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
