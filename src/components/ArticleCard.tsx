import type { NewsArticle } from "@/types";
import BiasLabel from "./BiasLabel";

interface Props {
  article: NewsArticle;
  compact?: boolean;
}

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ArticleCard({ article, compact = false }: Props) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group bg-bg-card border border-border rounded-lg p-3 hover:border-gray-400 hover:shadow-sm transition-all"
    >
      {article.imageUrl && !compact && (
        <div className="mb-2 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-text-secondary">
            {article.source.name}
          </span>
          <BiasLabel label={article.source.biasLabel} size="sm" />
        </div>
        <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0">
          {timeAgo(article.publishedAt)}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-text-primary group-hover:text-blue-600 transition-colors leading-snug">
        {article.title}
      </h3>

      {!compact && article.description && (
        <p className="mt-1.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
          {article.description}
        </p>
      )}
    </a>
  );
}
