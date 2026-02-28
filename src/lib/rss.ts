import Parser from "rss-parser";
import type { NewsArticle, NewsSource } from "@/types";
import { SOURCES } from "./sources";

type RssItem = Parser.Item & Record<string, unknown>;

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent":
      "UnbiasedNews/1.0 (+https://unbiased-news.vercel.app; RSS aggregator)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
      ["enclosure", "enclosure"],
    ],
  },
});

function extractImageUrl(item: RssItem): string | undefined {
  const thumb = item.mediaThumbnail as { $?: { url?: string } } | undefined;
  if (thumb?.$?.url) return thumb.$.url;

  const content = item.mediaContent as
    | { $?: { url?: string; medium?: string } }
    | undefined;
  if (content?.$?.url && content.$?.medium === "image") return content.$.url;

  const enc = item.enclosure as { url?: string; type?: string } | undefined;
  if (enc?.url && enc?.type?.startsWith("image/")) return enc.url;

  if (typeof item.content === "string") {
    const match = item.content.match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
  }

  return undefined;
}

function generateArticleId(sourceId: string, url: string): string {
  let hash = 0;
  const str = sourceId + url;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${sourceId}-${Math.abs(hash).toString(36)}`;
}

const MAX_ARTICLE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchSourceArticles(source: NewsSource): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl);
    const articles: NewsArticle[] = [];

    for (const item of feed.items.slice(0, 20)) {
      if (!item.title || !item.link) continue;

      const publishedAt = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : (item.isoDate ?? new Date().toISOString());

      if (Date.now() - new Date(publishedAt).getTime() > MAX_ARTICLE_AGE_MS) {
        continue;
      }

      articles.push({
        id: generateArticleId(source.id, item.link),
        title: item.title.trim(),
        url: item.link,
        description:
          item.contentSnippet?.slice(0, 300) ??
          (typeof item.summary === "string"
            ? item.summary.slice(0, 300)
            : "") ??
          "",
        publishedAt,
        source,
        imageUrl: extractImageUrl(item as unknown as RssItem),
      });
    }

    return articles;
  } catch (err) {
    console.warn(
      `[rss] Failed to fetch ${source.id} (${source.rssUrl}):`,
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

export async function fetchAllArticles(): Promise<NewsArticle[]> {
  const results = await Promise.all(SOURCES.map(fetchSourceArticles));
  return results.flat();
}
