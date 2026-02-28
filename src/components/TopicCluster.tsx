"use client";

import { useState } from "react";
import type { TopicCluster as TopicClusterType } from "@/types";
import ArticleCard from "./ArticleCard";
import { BIAS_CONFIG } from "./BiasLabel";
import type { BiasLabel } from "@/types";

interface Props {
  cluster: TopicClusterType;
}

const BIAS_BAR_COLORS: Record<string, string> = {
  "-2": "#1e40af",
  "-1": "#3b82f6",
  "0": "#64748b",
  "1": "#ea580c",
  "2": "#dc2626",
};

const BIAS_ORDER = ["-2", "-1", "0", "1", "2"];

function SpectrumBar({ cluster }: { cluster: TopicClusterType }) {
  const counts: Record<string, number> = {
    "-2": 0,
    "-1": 0,
    "0": 0,
    "1": 0,
    "2": 0,
  };
  for (const a of cluster.articles) {
    counts[String(a.source.biasScore)]++;
  }
  const total = cluster.articles.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
          Political spectrum coverage
        </span>
        <span className="ml-auto text-[10px] text-text-muted">
          Balance:{" "}
          <span
            className={`font-bold ${
              cluster.balanceScore >= 60
                ? "text-green-600"
                : cluster.balanceScore >= 30
                ? "text-amber-600"
                : "text-red-500"
            }`}
          >
            {cluster.balanceScore}
          </span>
          /100
        </span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
        {BIAS_ORDER.map((score) => {
          const count = counts[score];
          if (!count) return null;
          return (
            <div
              key={score}
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: BIAS_BAR_COLORS[score],
              }}
              title={`${count} article${count !== 1 ? "s" : ""}`}
              className="h-full rounded-sm"
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-text-muted">
        <span>Left</span>
        <span>Center</span>
        <span>Right</span>
      </div>
    </div>
  );
}

function SourcePills({ cluster }: { cluster: TopicClusterType }) {
  // Deduplicate sources and sort by bias score
  const seen = new Set<string>();
  const sources = cluster.articles
    .filter((a) => {
      if (seen.has(a.source.id)) return false;
      seen.add(a.source.id);
      return true;
    })
    .sort((a, b) => a.source.biasScore - b.source.biasScore);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto source-scroll pb-0.5">
      <span className="text-[10px] text-text-muted font-medium flex-shrink-0">
        Sources:
      </span>
      {sources.map((article) => {
        const cfg = BIAS_CONFIG[article.source.biasLabel as BiasLabel];
        return (
          <span
            key={article.source.id}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {article.source.name}
          </span>
        );
      })}
    </div>
  );
}

export default function TopicCluster({ cluster }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Sort articles: center first for featured, then by bias diversity
  const sortedArticles = [...cluster.articles].sort(
    (a, b) => Math.abs(a.source.biasScore) - Math.abs(b.source.biasScore)
  );

  const featured = sortedArticles[0];
  const rest = sortedArticles.slice(1);
  const visibleRest = expanded ? rest : rest.slice(0, 3);
  const hasMore = rest.length > 3;

  return (
    <article className="bg-bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Cluster header */}
      <div className="px-5 pt-4 pb-3 border-b border-border-light">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-base font-bold text-text-primary leading-snug flex-1">
            {cluster.headline}
          </h2>
          <span className="flex-shrink-0 inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-200">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6"
              />
            </svg>
            {cluster.articles.length} articles
          </span>
        </div>
        <SpectrumBar cluster={cluster} />
        <div className="mt-2.5">
          <SourcePills cluster={cluster} />
        </div>
      </div>

      {/* Content: featured + sidebar or single column */}
      <div className="p-4">
        {cluster.articles.length === 1 ? (
          <ArticleCard article={featured} featured />
        ) : (
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Featured article */}
            <div className="lg:w-1/2 flex-shrink-0">
              <ArticleCard article={featured} featured />
            </div>

            {/* Rest of articles */}
            <div className="flex-1 flex flex-col gap-2.5">
              {visibleRest.map((article) => (
                <ArticleCard key={article.id} article={article} compact />
              ))}

              {hasMore && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors text-left flex items-center gap-1"
                >
                  {expanded ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                      Show fewer sources
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      {rest.length - 3} more source{rest.length - 3 !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
