import type { NewsArticle } from "@/types";
import { BIAS_CONFIG } from "./BiasLabel";

interface Props {
  article: NewsArticle;
  compact?: boolean;
  featured?: boolean;
}

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ArticleCard({
  article,
  compact = false,
  featured = false,
}: Props) {
  const cfg = BIAS_CONFIG[article.source.biasLabel];

  // Featured: big card with image hero or prominent text block
  if (featured) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group relative overflow-hidden rounded-xl bg-bg-card border border-border hover:shadow-lg transition-all duration-200"
      >
        {article.imageUrl ? (
          <div className="relative h-52 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {article.source.name}
                </span>
                <span className="text-[10px] text-white/60">
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
              <h3 className="text-white font-bold text-base leading-snug group-hover:text-blue-200 transition-colors">
                {article.title}
              </h3>
            </div>
          </div>
        ) : (
          <div className={`border-l-4 ${cfg.leftBorder} p-5`}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {article.source.name}
              </span>
              <span className="text-[10px] text-text-muted">
                {timeAgo(article.publishedAt)}
              </span>
            </div>
            <h3 className="font-bold text-base text-text-primary leading-snug group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
            {article.description && (
              <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-2">
                {article.description}
              </p>
            )}
          </div>
        )}
      </a>
    );
  }

  // Compact: horizontal layout with left color bar, used in cluster lists
  if (compact) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${cfg.leftBorder} bg-bg-card border border-border hover:shadow-sm hover:border-gray-300 transition-all group`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide truncate">
              {article.source.name}
            </span>
            <span className="text-[10px] text-text-muted ml-auto flex-shrink-0 pl-1">
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </p>
        </div>
        {article.imageUrl && (
          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </div>
        )}
      </a>
    );
  }

  // Default: full card for unclustered section
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group bg-bg-card border border-border border-l-4 ${cfg.leftBorder} rounded-lg p-4 hover:shadow-md transition-all duration-200`}
    >
      {article.imageUrl && (
        <div className="mb-3 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {article.source.name}
        </span>
        <span className="text-[10px] text-text-muted">
          {timeAgo(article.publishedAt)}
        </span>
      </div>
      <h3 className="font-semibold text-text-primary text-sm leading-snug group-hover:text-blue-600 transition-colors">
        {article.title}
      </h3>
      {article.description && (
        <p className="mt-1.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
          {article.description}
        </p>
      )}
    </a>
  );
}
