import type { NewsArticle, TopicCluster } from "@/types";

/**
 * Sort clusters: most politically balanced first, then by recency.
 */
export function sortClusters(clusters: TopicCluster[]): TopicCluster[] {
  return [...clusters].sort((a, b) => {
    if (b.balanceScore !== a.balanceScore) {
      return b.balanceScore - a.balanceScore;
    }
    return (
      new Date(b.mostRecentAt).getTime() - new Date(a.mostRecentAt).getTime()
    );
  });
}

/**
 * Sort unclustered articles: center sources first, then by recency.
 */
export function sortUnclustered(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const biasA = Math.abs(a.source.biasScore);
    const biasB = Math.abs(b.source.biasScore);
    if (biasA !== biasB) return biasA - biasB;
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });
}
