import { NextResponse } from "next/server";
import { fetchAllArticles } from "@/lib/rss";
import { clusterArticles } from "@/lib/cluster";
import { sortClusters, sortUnclustered } from "@/lib/score";
import type { FeedResponse } from "@/types";

// ISR: revalidate every 15 minutes
export const revalidate = 900;
export const dynamic = "force-static";

export async function GET(): Promise<NextResponse<FeedResponse>> {
  try {
    const articles = await fetchAllArticles();
    const { clusters, unclustered } = clusterArticles(articles);

    return NextResponse.json({
      clusters: sortClusters(clusters),
      unclustered: sortUnclustered(unclustered),
      fetchedAt: new Date().toISOString(),
      sourceCount: new Set(articles.map((a) => a.source.id)).size,
      articleCount: articles.length,
    });
  } catch (error) {
    console.error("[/api/feed] Error:", error);
    return NextResponse.json(
      {
        clusters: [],
        unclustered: [],
        fetchedAt: new Date().toISOString(),
        sourceCount: 0,
        articleCount: 0,
      },
      { status: 500 }
    );
  }
}
