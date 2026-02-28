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
  { score: -2, label: "Far Left" },
  { score: -1, label: "Lean Left" },
  { score: 0, label: "Center" },
  { score: 1, label: "Lean Right" },
  { score: 2, label: "Far Right" },
] as const;

const LEGEND = [
  { label: "Far Left", color: "bg-blue-800" },
  { label: "Lean Left", color: "bg-blue-400" },
  { label: "Center", color: "bg-gray-400" },
  { label: "Lean Right", color: "bg-orange-400" },
  { label: "Far Right", color: "bg-red-400" },
];

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
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-header border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Unbiased News
              </h1>
              <p className="text-[10px] text-text-muted">
                {data.articleCount} articles from {data.sourceCount} sources
                {data.fetchedAt &&
                  ` · Updated ${formatTimestamp(data.fetchedAt)}`}
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-700 cursor-pointer"
              }`}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Bias filter tabs */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <button
              onClick={() => setBiasFilter(null)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                biasFilter === null
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-text-secondary border-border hover:border-gray-400"
              }`}
            >
              All
            </button>
            {BIAS_FILTERS.map(({ score, label }) => (
              <button
                key={score}
                onClick={() =>
                  setBiasFilter(biasFilter === score ? null : score)
                }
                className={`px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                  biasFilter === score
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-text-secondary border-border hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Bias legend */}
      <div className="max-w-4xl mx-auto px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-text-muted mr-2 font-medium">
            Bias scale:
          </span>
          {LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1 mr-3">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-[10px] text-text-muted">{label}</span>
            </div>
          ))}
          <span className="text-[10px] text-text-muted ml-auto">
            Sorted: most balanced coverage first
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-12">
        {loading && filteredClusters.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-text-muted">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-3" />
              <p className="text-sm">
                Loading articles from {SOURCES.length} sources...
              </p>
            </div>
          </div>
        ) : filteredClusters.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <p className="text-lg font-medium">No clustered stories found</p>
            <p className="text-sm mt-1">
              Try removing your filter or clicking Refresh
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-muted mb-3">
              {filteredClusters.length} topic cluster
              {filteredClusters.length !== 1 ? "s" : ""}
              {biasFilter !== null && " (filtered)"}
            </p>

            <div className="flex flex-col gap-4">
              {filteredClusters.map((cluster) => (
                <TopicCluster key={cluster.id} cluster={cluster} />
              ))}
            </div>

            {/* Unclustered articles */}
            {data.unclustered.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setShowUnclustered(!showUnclustered)}
                  className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3 cursor-pointer hover:text-text-secondary transition-colors"
                >
                  <span>More Stories</span>
                  <span className="text-text-muted text-xs">
                    ({data.unclustered.length})
                  </span>
                  <span className="text-text-muted text-xs">
                    {showUnclustered ? "▲" : "▼"}
                  </span>
                </button>
                {showUnclustered && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-text-muted">
          News sourced from {SOURCES.length} outlets across the political
          spectrum.
        </p>
        <p className="text-xs text-text-muted mt-1">
          Bias ratings based on{" "}
          <a
            href="https://www.allsides.com/media-bias/ratings"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-secondary"
          >
            AllSides
          </a>{" "}
          and{" "}
          <a
            href="https://adfontesmedia.com/interactive-media-bias-chart/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-secondary"
          >
            Ad Fontes Media
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
