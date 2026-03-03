export type BiasLabel =
  | "Far Left"
  | "Lean Left"
  | "Center"
  | "Lean Right"
  | "Far Right";

// biasScore: -2 (Far Left) to +2 (Far Right), 0 = Center
export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  biasScore: -2 | -1 | 0 | 1 | 2;
  biasLabel: BiasLabel;
  isPaid: boolean; // true = paywalled, false = free to read
}

export interface NewsArticle {
  id: string; // deterministic hash: `${source.id}-${hash}`
  title: string;
  url: string;
  description: string;
  publishedAt: string; // ISO 8601
  source: NewsSource;
  imageUrl?: string;
}

export interface TopicCluster {
  id: string;
  headline: string; // title from the most-center article
  articles: NewsArticle[];
  keywords: string[];
  balanceScore: number; // 0–100, higher = more politically balanced
  mostRecentAt: string; // ISO 8601 of newest article in cluster
}

export interface FeedResponse {
  clusters: TopicCluster[];
  unclustered: NewsArticle[];
  fetchedAt: string;
  sourceCount: number;
  articleCount: number;
}
