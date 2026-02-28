import type { NewsArticle, TopicCluster } from "@/types";

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "has", "have", "had", "will", "would", "could", "should", "may", "might",
  "do", "did", "does", "not", "no", "as", "it", "its", "this", "that",
  "he", "she", "they", "we", "you", "who", "what", "which", "how", "when",
  "where", "why", "after", "before", "about", "over", "under", "into",
  "more", "than", "up", "out", "says", "said", "new", "year", "two",
  "report", "reports", "via", "amid", "against", "us", "i", "his", "her",
  "their", "our", "some", "all", "just", "also", "now", "can", "than",
  "between", "through", "first", "last", "one", "time", "back", "see",
  "get", "make", "take", "know", "day", "week", "month",
]);

const NOISE_PHRASES = new Set([
  "breaking", "exclusive", "watch", "opinion", "editorial", "analysis",
  "column", "latest", "live", "update", "updates", "recap",
]);

export function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/["""''.,!?;:()\[\]{}']/g, " ")
    .split(/\s+/)
    .filter((word) => {
      if (word.length < 3) return false;
      if (STOPWORDS.has(word)) return false;
      if (NOISE_PHRASES.has(word)) return false;
      if (/^\d+$/.test(word)) return false;
      return true;
    });
}

function normalize(word: string): string {
  // Basic stemming: strip trailing 's', 'ed', 'ing'
  return word
    .toLowerCase()
    .replace(/ing$/, "")
    .replace(/ed$/, "")
    .replace(/s$/, "");
}

function normalizedOverlap(kw1: string[], kw2: string[]): number {
  const set1 = new Set(kw1.map(normalize));
  let overlap = 0;
  for (const k of kw2) {
    if (set1.has(normalize(k))) overlap++;
  }
  return overlap;
}

export function computeBalanceScore(articles: NewsArticle[]): number {
  if (articles.length === 0) return 0;

  const scores = articles.map((a) => a.source.biasScore);
  const hasLeft = scores.some((s) => s < 0);
  const hasRight = scores.some((s) => s > 0);
  const hasCenter = scores.some((s) => s === 0);

  let score = 0;
  if (hasLeft && hasRight) score += 60;
  else if (hasLeft || hasRight) score += 20;
  if (hasCenter) score += 20;
  const uniqueSources = new Set(articles.map((a) => a.source.id)).size;
  score += Math.min(uniqueSources * 4, 20);

  return Math.min(score, 100);
}

export function clusterArticles(articles: NewsArticle[]): {
  clusters: TopicCluster[];
  unclustered: NewsArticle[];
} {
  // Sort newest-first so newest articles anchor clusters
  const sorted = [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const keywordsMap = new Map<string, string[]>();
  for (const article of sorted) {
    keywordsMap.set(article.id, extractKeywords(article.title));
  }

  const clusterAssignments = new Map<string, number>();
  const clusterKeywords: Map<number, Set<string>> = new Map();
  let nextClusterId = 0;

  for (const article of sorted) {
    const kw = keywordsMap.get(article.id) ?? [];
    let bestCluster = -1;
    let bestOverlap = 0;

    for (const [clusterId, clusterKws] of clusterKeywords.entries()) {
      const overlap = normalizedOverlap(kw, Array.from(clusterKws));
      if (overlap >= 2 && overlap > bestOverlap) {
        bestOverlap = overlap;
        bestCluster = clusterId;
      }
    }

    if (bestCluster >= 0) {
      clusterAssignments.set(article.id, bestCluster);
      const existing = clusterKeywords.get(bestCluster)!;
      for (const k of kw) existing.add(normalize(k));
    } else {
      const id = nextClusterId++;
      clusterAssignments.set(article.id, id);
      clusterKeywords.set(id, new Set(kw.map(normalize)));
    }
  }

  // Group articles by cluster ID
  const clusterGroups = new Map<number, NewsArticle[]>();
  for (const article of sorted) {
    const cid = clusterAssignments.get(article.id) ?? -1;
    if (!clusterGroups.has(cid)) clusterGroups.set(cid, []);
    clusterGroups.get(cid)!.push(article);
  }

  const clusters: TopicCluster[] = [];
  const unclustered: NewsArticle[] = [];

  for (const [cid, clusterArticles] of clusterGroups.entries()) {
    if (clusterArticles.length < 2) {
      unclustered.push(...clusterArticles);
      continue;
    }

    // Use the most-center article's title as the cluster headline
    const headlineArticle = [...clusterArticles].sort(
      (a, b) =>
        Math.abs(a.source.biasScore) - Math.abs(b.source.biasScore)
    )[0];

    const keywords = Array.from(clusterKeywords.get(cid) ?? []).slice(0, 8);
    const mostRecentAt = clusterArticles[0].publishedAt; // sorted newest-first

    clusters.push({
      id: `cluster-${cid}`,
      headline: headlineArticle.title,
      articles: clusterArticles,
      keywords,
      balanceScore: computeBalanceScore(clusterArticles),
      mostRecentAt,
    });
  }

  return { clusters, unclustered };
}
