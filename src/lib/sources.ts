import type { NewsSource } from "@/types";

// Bias scale: -2 = Far Left, -1 = Lean Left, 0 = Center, +1 = Lean Right, +2 = Far Right
// Based on AllSides Media Bias Ratings + Ad Fontes Media Chart (2026)
export const SOURCES: NewsSource[] = [
  {
    id: "ap",
    name: "AP News",
    rssUrl: "https://news.google.com/rss/search?q=when:12h+allinurl:apnews.com&ceid=US:en&hl=en-US&gl=US",
    biasScore: 0,
    biasLabel: "Center",
  },
  {
    id: "reuters",
    name: "Reuters",
    // Native RSS deprecated; Google News proxy is reliable
    rssUrl:
      "https://news.google.com/rss/search?q=when:12h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US",
    biasScore: 0,
    biasLabel: "Center",
  },
  {
    id: "bbc",
    name: "BBC News",
    rssUrl: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
    biasScore: 0,
    biasLabel: "Center",
  },
  {
    id: "pbs",
    name: "PBS NewsHour",
    rssUrl: "https://www.pbs.org/newshour/feeds/rss/headlines",
    biasScore: 0,
    biasLabel: "Center",
  },
  {
    id: "thehill",
    name: "The Hill",
    rssUrl: "https://thehill.com/homenews/feed/",
    biasScore: 0,
    biasLabel: "Center",
  },
  {
    id: "axios",
    name: "Axios",
    rssUrl: "https://api.axios.com/feed/",
    biasScore: 0,
    biasLabel: "Center",
  },
  {
    id: "usatoday",
    name: "USA Today",
    rssUrl: "https://news.google.com/rss/search?q=when:12h+allinurl:usatoday.com&ceid=US:en&hl=en-US&gl=US",
    biasScore: 0,
    biasLabel: "Center",
  },
  {
    id: "npr",
    name: "NPR",
    rssUrl: "https://feeds.npr.org/1001/rss.xml",
    biasScore: -1,
    biasLabel: "Lean Left",
  },
  {
    id: "cnn",
    name: "CNN",
    rssUrl: "http://rss.cnn.com/rss/cnn_topstories.rss",
    biasScore: -1,
    biasLabel: "Lean Left",
  },
  {
    id: "washpost",
    name: "Washington Post",
    rssUrl: "https://news.google.com/rss/search?q=when:12h+allinurl:washingtonpost.com&ceid=US:en&hl=en-US&gl=US",
    biasScore: -1,
    biasLabel: "Lean Left",
  },
  {
    id: "guardian",
    name: "The Guardian",
    rssUrl: "https://www.theguardian.com/us-news/rss",
    biasScore: -1,
    biasLabel: "Lean Left",
  },
  {
    id: "nbcnews",
    name: "NBC News",
    rssUrl: "https://feeds.nbcnews.com/nbcnews/public/news",
    biasScore: 1,
    biasLabel: "Lean Right",
  },
  {
    id: "wsj",
    name: "Wall Street Journal",
    rssUrl: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    biasScore: 1,
    biasLabel: "Lean Right",
  },
  {
    id: "foxnews",
    name: "Fox News",
    rssUrl: "https://moxie.foxnews.com/google-publisher/latest.xml",
    biasScore: 2,
    biasLabel: "Far Right",
  },
  {
    id: "nypost",
    name: "New York Post",
    rssUrl: "https://nypost.com/feed/",
    biasScore: 2,
    biasLabel: "Far Right",
  },
];

export const SOURCE_MAP = new Map<string, NewsSource>(
  SOURCES.map((s) => [s.id, s])
);
