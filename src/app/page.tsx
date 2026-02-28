import NewsFeed from "@/components/NewsFeed";
import type { FeedResponse } from "@/types";
import { fetchAllArticles } from "@/lib/rss";
import { clusterArticles } from "@/lib/cluster";
import { sortClusters, sortUnclustered } from "@/lib/score";

// ISR: rebuild this page every 15 minutes
export const revalidate = 900;

async function getFeedData(): Promise<FeedResponse> {
  try {
    const articles = await fetchAllArticles();
    const { clusters, unclustered } = clusterArticles(articles);

    return {
      clusters: sortClusters(clusters),
      unclustered: sortUnclustered(unclustered),
      fetchedAt: new Date().toISOString(),
      sourceCount: new Set(articles.map((a) => a.source.id)).size,
      articleCount: articles.length,
    };
  } catch (err) {
    console.error("[page] getFeedData error:", err);
    return {
      clusters: [],
      unclustered: [],
      fetchedAt: new Date().toISOString(),
      sourceCount: 0,
      articleCount: 0,
    };
  }
}

export default async function Home() {
  const feedData = await getFeedData();
  return <NewsFeed initialData={feedData} />;
}
