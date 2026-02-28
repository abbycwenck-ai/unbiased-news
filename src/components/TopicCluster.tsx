"use client";

import { useState } from "react";
import type { TopicCluster as TopicClusterType } from "@/types";
import ArticleCard from "./ArticleCard";

interface Props {
  cluster: TopicClusterType;
}

const BIAS_COLORS: Record<string, string> = {
  "-2": "#1d4ed8",
  "-1": "#3b82f6",
  "0": "#9ca3af",
  "1": "#f97316",
  "2": "#ef4444",
};

const BIAS_LABELS: Record<string, string> = {
  "-2": "Far Left",
  "-1": "Lean Left",
  "0": "Center",
  "1": "Lean Right",
  "2": "Far Right",
};

function BiasCoverageBar({ cluster }: { cluster: TopicClusterType }) {
  const counts: Record<string, number> = { "-2": 0, "-1": 0, "0": 0, "1": 0, "2": 0 };
  for (const a of cluster.articles) {
    counts[String(a.source.biasScore)]++;
  }
  const total = cluster.articles.length;

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[9px] text-text-muted w-14 flex-shrink-0 font-medium">
        Coverage
      </span>
      <div className="flex flex-1 h-2 rounded-full overflow-hidden gap-px bg-gray-100">
        {Object.entries(counts).map(([score, count]) =>
          count > 0 ? (
            <div
              key={score}
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: BIAS_COLORS[score],
              }}
              title={`${BIAS_LABELS[score]}: ${count} article${count !== 1 ? "s" : ""}`}
              className="h-full"
            />
          ) : null
        )}
      </div>
      <span className="text-[9px] text-text-muted whitespace-nowrap flex-shrink-0">
        Balance: <strong>{cluster.balanceScore}</strong>/100
      </span>
    </div>
  );
}

export default function TopicCluster({ cluster }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleArticles = expanded
    ? cluster.articles
    : cluster.articles.slice(0, 4);

  return (
    <article className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Cluster header */}
      <div className="px-4 py-3 border-b border-border-light">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-text-primary leading-snug">
              {cluster.headline}
            </h2>
            <BiasCoverageBar cluster={cluster} />
          </div>
          <span className="flex-shrink-0 text-[10px] text-text-muted bg-gray-50 px-2 py-1 rounded-full border border-border">
            {cluster.articles.length} sources
          </span>
        </div>

        {/* Source name badges */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {cluster.articles.map((article) => (
            <span
              key={article.id}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border text-text-secondary bg-gray-50"
            >
              {article.source.name}
            </span>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visibleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} compact />
        ))}
      </div>

      {/* Expand/collapse */}
      {cluster.articles.length > 4 && (
        <div className="border-t border-border-light px-4 py-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            {expanded
              ? "Show less ▲"
              : `Show ${cluster.articles.length - 4} more sources ▼`}
          </button>
        </div>
      )}
    </article>
  );
}
