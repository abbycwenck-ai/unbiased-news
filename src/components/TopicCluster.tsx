"use client";

import { useState } from "react";
import type { TopicCluster as TopicClusterType, NewsArticle } from "@/types";
import ArticleCard from "./ArticleCard";
import { BIAS_CONFIG } from "./BiasLabel";
import type { BiasLabel } from "@/types";

interface Props {
  cluster: TopicClusterType;
  isFeatured?: boolean;
}

const BIAS_BAR_COLORS: Record<string, string> = {
  "-2": "#1e40af",
  "-1": "#3b82f6",
  "0":  "#64748b",
  "1":  "#ea580c",
  "2":  "#dc2626",
};
const BIAS_ORDER = ["-2", "-1", "0", "1", "2"];

// ── Spectrum coverage bar ────────────────────────────────────────────────────
function SpectrumBar({ cluster }: { cluster: TopicClusterType }) {
  const counts: Record<string, number> = { "-2": 0, "-1": 0, "0": 0, "1": 0, "2": 0 };
  for (const a of cluster.articles) counts[String(a.source.biasScore)]++;
  const total = cluster.articles.length;

  return (
    <div className="space-y-1">
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {BIAS_ORDER.map((score) => {
          const count = counts[score];
          if (!count) return null;
          return (
            <div
              key={score}
              style={{ width: `${(count / total) * 100}%`, backgroundColor: BIAS_BAR_COLORS[score] }}
              title={`${count} article${count !== 1 ? "s" : ""}`}
              className="h-full rounded-sm"
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-text-muted">
        <span>◀ Left</span>
        <span>Right ▶</span>
      </div>
    </div>
  );
}

// ── Three-column perspective view for a single cluster ───────────────────────
function PerspectivesPanel({ articles }: { articles: NewsArticle[] }) {
  const left   = articles.filter((a) => a.source.biasScore < 0);
  const center = articles.filter((a) => a.source.biasScore === 0);
  const right  = articles.filter((a) => a.source.biasScore > 0);

  const COLS = [
    {
      label: "Left-Leaning",
      articles: left,
      headerDot: "bg-blue-500",
      headerText: "text-blue-700",
      headerBorder: "border-blue-400",
      emptyText: "No left-leaning coverage",
    },
    {
      label: "Center",
      articles: center,
      headerDot: "bg-slate-400",
      headerText: "text-slate-600",
      headerBorder: "border-slate-300",
      emptyText: "No center coverage",
    },
    {
      label: "Right-Leaning",
      articles: right,
      headerDot: "bg-red-500",
      headerText: "text-red-700",
      headerBorder: "border-red-400",
      emptyText: "No right-leaning coverage",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border-light">
      {COLS.map(({ label, articles: colArticles, headerDot, headerText, headerBorder, emptyText }) => (
        <div key={label} className="flex flex-col gap-2.5">
          {/* Column header */}
          <div className={`flex items-center gap-2 pb-2 border-b-2 ${headerBorder}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${headerDot}`} />
            <span className={`text-xs font-bold ${headerText}`}>{label}</span>
            <span className="ml-auto text-[10px] text-text-muted">
              {colArticles.length} {colArticles.length === 1 ? "article" : "articles"}
            </span>
          </div>
          {colArticles.length === 0 ? (
            <div className="flex items-center justify-center py-6 rounded-lg bg-gray-50 border border-dashed border-border">
              <p className="text-[11px] text-text-muted italic">{emptyText}</p>
            </div>
          ) : (
            colArticles.map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main cluster component ───────────────────────────────────────────────────
export default function TopicCluster({ cluster, isFeatured = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  // The "hero" article: most center source (lowest absolute bias score), newest as tiebreak
  const heroArticle = [...cluster.articles].sort(
    (a, b) =>
      Math.abs(a.source.biasScore) - Math.abs(b.source.biasScore) ||
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];

  const sourceCount = cluster.articles.length;
  const hasMultipleLeanings =
    cluster.articles.some((a) => a.source.biasScore < 0) &&
    cluster.articles.some((a) => a.source.biasScore > 0);

  // Deduplicated source pills sorted left → right
  const seen = new Set<string>();
  const sourcePills = cluster.articles
    .filter((a) => { if (seen.has(a.source.id)) return false; seen.add(a.source.id); return true; })
    .sort((a, b) => a.source.biasScore - b.source.biasScore);

  return (
    <article
      className={`bg-bg-card rounded-2xl border overflow-hidden transition-shadow duration-200 ${
        isFeatured
          ? "border-green-300 shadow-md shadow-green-50"
          : "border-border shadow-sm hover:shadow-md"
      }`}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-4">

        {/* Headline row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {isFeatured && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">
                  Most Balanced Story
                </span>
              </div>
            )}
            <h2 className={`font-bold text-text-primary leading-snug ${isFeatured ? "text-lg" : "text-base"}`}>
              {cluster.headline}
            </h2>
          </div>

          {/* Article count badge */}
          <span className="flex-shrink-0 inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-200">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sourceCount}
          </span>
        </div>

        {/* Spectrum bar + balance score */}
        <div className="flex items-end gap-4 mb-3">
          <div className="flex-1">
            <SpectrumBar cluster={cluster} />
          </div>
          <div className="flex-shrink-0 text-right pb-4">
            <span className="text-[9px] text-text-muted block">Balance</span>
            <span
              className={`text-sm font-black ${
                cluster.balanceScore >= 60
                  ? "text-green-600"
                  : cluster.balanceScore >= 30
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            >
              {cluster.balanceScore}
              <span className="text-[9px] font-normal text-text-muted">/100</span>
            </span>
          </div>
        </div>

        {/* Source pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto source-scroll">
          {sourcePills.map((article) => {
            const cfg = BIAS_CONFIG[article.source.biasLabel as BiasLabel];
            return (
              <span
                key={article.source.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {article.source.name}
                {article.source.isPaid && (
                  <span className="text-[8px] opacity-60 ml-0.5">💳</span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Hero article (most unbiased source) ── */}
      <div className="px-4 pb-4">
        <ArticleCard article={heroArticle} featured />
      </div>

      {/* ── Expand / Perspectives toggle ── */}
      {sourceCount > 1 && (
        <div className="border-t border-border-light">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              {/* Mini spectrum preview dots */}
              <div className="flex items-center gap-0.5">
                {sourcePills.slice(0, 6).map((a) => {
                  const cfg = BIAS_CONFIG[a.source.biasLabel as BiasLabel];
                  return <span key={a.source.id} className={`w-2 h-2 rounded-full ${cfg.dot}`} />;
                })}
              </div>
              <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                {expanded ? "Hide perspectives" : `See all ${sourceCount} perspectives`}
                {!expanded && hasMultipleLeanings && (
                  <span className="ml-1.5 text-[10px] font-normal text-green-600">
                    · Left, Center & Right covered
                  </span>
                )}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="px-4 pb-4">
              <PerspectivesPanel articles={cluster.articles} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
