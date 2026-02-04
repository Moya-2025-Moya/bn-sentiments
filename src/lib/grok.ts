import { generateText, generateObject } from "ai";
import { createXai } from "@ai-sdk/xai";
import { z } from "zod";
import { EXCHANGE_ACCOUNTS } from "./constants";
import { searchLogStore } from "./search-log";
import {
  buildSearchPrompt,
  buildParsePrompt,
  buildEventTaggingPrompt,
  buildCompetitorSearchPrompt,
  buildBriefingPrompt,
} from "./grok-sop";

const xai = createXai({ apiKey: process.env.XAI_API_KEY });

export const DEFAULT_SEARCH_MODEL = "grok-4-1-fast-reasoning";
export const DEFAULT_PARSE_MODEL = "grok-3-mini";

export const AVAILABLE_MODELS = [
  { id: "grok-4-1-fast-reasoning", name: "Grok 4.1 (推理)", description: "最强模型，带推理链，推荐" },
  { id: "grok-4-1-fast-non-reasoning", name: "Grok 4.1 (快速)", description: "无推理，响应更快" },
  { id: "grok-3-fast", name: "Grok 3 Fast", description: "上一代快速搜索" },
  { id: "grok-3-mini", name: "Grok 3 Mini", description: "轻量解析，最省钱" },
];

// ─── Zod Schemas ───────────────────────────────

const RawPostSchema = z.object({
  posts: z.array(
    z.object({
      text: z.string().describe("Original tweet text verbatim"),
      text_zh: z.string().describe("Chinese translation of the tweet (copy as-is if already Chinese)"),
      author_name: z.string(),
      author_handle: z.string(),
      author_followers: z.number(),
      url: z.string().nullable(),
      posted_at: z.string(),
      impressions: z.number(),
      likes: z.number(),
      retweets: z.number(),
      quote_tweets: z.number(),
      reply_to: z.string().nullable(),
      contains_media: z.boolean(),
      language: z.string(),
      country: z.string().nullable(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      sentiment_score: z.number().min(-1).max(1),
      is_kol: z.boolean(),
      is_exchange_account: z.boolean(),
      is_official_response: z.boolean(),
    })
  ),
  total_found: z.number(),
});

const EventTagSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      theme: z.string(),
      severity: z.enum(["critical", "high", "medium", "low"]),
      is_new_event: z.boolean(),
      post_indices: z.array(z.number()).describe("0-based indices of posts belonging to this event"),
    })
  ),
});

const CompetitorSchema = z.object({
  exchanges: z.array(
    z.object({
      name: z.string(),
      total_mentions: z.number(),
      positive_pct: z.number(),
      neutral_pct: z.number(),
      negative_pct: z.number(),
      kol_post_count: z.number(),
      top_themes: z.array(z.string()),
      top_kol_post: z.string().nullable().describe("Most impactful KOL post text, or null"),
    })
  ),
});

const BriefingSchema = z.object({
  alert_level: z.enum(["green", "yellow", "red"]),
  headline: z.string(),
  what_happened: z.string(),
  why_it_matters: z.string(),
  what_to_do: z.string(),
  key_metrics: z.object({
    total_mentions: z.number(),
    negative_pct: z.number(),
    top_source: z.string(),
  }),
});

// ─── Step 1+2: Search & Parse ALL posts ───────

export async function searchBinanceMentions(
  fromDate: string,
  toDate: string,
  model: string = DEFAULT_SEARCH_MODEL
) {
  const parseModel = DEFAULT_PARSE_MODEL;

  // Step 1: Search — get ALL raw posts
  const searchStart = Date.now();
  let rawText: string;
  const searchPrompt = buildSearchPrompt(fromDate, toDate);

  try {
    const { text } = await generateText({
      model: xai(model),
      prompt: searchPrompt,
    });
    rawText = text;

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "search",
      model,
      prompt_summary: `[SOP Step 1] 搜索全部 Binance 推文 (${fromDate} ~ ${toDate})`,
      status: "success",
      duration_ms: Date.now() - searchStart,
      result_summary: text.slice(0, 500) + "...",
    });
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "search",
      model,
      prompt_summary: `[SOP Step 1] 搜索全部 Binance 推文 (${fromDate} ~ ${toDate})`,
      status: "error",
      duration_ms: Date.now() - searchStart,
      error: String(error),
    });
    throw error;
  }

  // Step 2: Parse — structure ALL posts
  const parseStart = Date.now();
  const parsePrompt = buildParsePrompt(rawText);

  try {
    const { object: structured } = await generateObject({
      model: xai(parseModel),
      schema: RawPostSchema,
      prompt: parsePrompt,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "parse",
      model: parseModel,
      prompt_summary: `[SOP Step 2] 解析为结构化数据`,
      status: "success",
      duration_ms: Date.now() - parseStart,
      mentions_found: structured.posts.length,
      kol_count: structured.posts.filter((p) => p.is_kol).length,
      result_summary: `${structured.posts.length} 条帖子 (${structured.posts.filter((p) => p.is_kol).length} 大V, ${structured.posts.filter((p) => p.sentiment === "negative").length} 负面)`,
    });

    return {
      posts: structured.posts,
      totalFound: structured.total_found,
      rawSummary: rawText,
      models: { search: model, parse: parseModel },
    };
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "parse",
      model: parseModel,
      prompt_summary: `[SOP Step 2] 解析为结构化数据`,
      status: "error",
      duration_ms: Date.now() - parseStart,
      error: String(error),
    });
    throw error;
  }
}

// ─── Step 3: Tag events ───────────────────────

export async function tagEvents(
  posts: Array<{
    text: string;
    author_handle: string;
    author_followers: number;
    sentiment: string;
    impressions: number;
    is_kol: boolean;
  }>,
  existingEventTitles: string[],
  model: string = DEFAULT_PARSE_MODEL
) {
  if (posts.length === 0) return { events: [] };

  const postsSummary = posts
    .map(
      (p, i) =>
        `[${i}] @${p.author_handle} (${p.author_followers} followers, ${p.impressions} imp, ${p.sentiment}${p.is_kol ? ", 大V" : ""}): ${p.text.slice(0, 250)}`
    )
    .join("\n");

  const prompt = buildEventTaggingPrompt(postsSummary, existingEventTitles);
  const start = Date.now();

  try {
    const { object } = await generateObject({
      model: xai(model),
      schema: EventTagSchema,
      prompt,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "events",
      model,
      prompt_summary: `[SOP Step 3] 事件标签 (${posts.length} 条帖子)`,
      status: "success",
      duration_ms: Date.now() - start,
      result_summary: `${object.events.length} 个事件`,
    });

    return object;
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "events",
      model,
      prompt_summary: `[SOP Step 3] 事件标签 (${posts.length} 条帖子)`,
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error),
    });
    throw error;
  }
}

// ─── Competitor comparison (all exchanges) ────

export async function searchAllCompetitors(
  fromDate: string,
  toDate: string,
  model: string = DEFAULT_SEARCH_MODEL
) {
  const exchangeNames = EXCHANGE_ACCOUNTS.map((e) => e.exchange);
  const prompt = buildCompetitorSearchPrompt(exchangeNames, fromDate, toDate);
  const start = Date.now();

  try {
    const { text } = await generateText({
      model: xai(model),
      prompt,
    });

    const { object } = await generateObject({
      model: xai(DEFAULT_PARSE_MODEL),
      schema: CompetitorSchema,
      prompt: `Parse these competitor exchange sentiment results into structured JSON:\n\n${text}`,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "competitor",
      model,
      prompt_summary: `[SOP] 搜索 ${exchangeNames.length} 家竞对交易所`,
      status: "success",
      duration_ms: Date.now() - start,
      result_summary: object.exchanges.map((e) => `${e.name}: ${e.total_mentions}提及`).join(", "),
    });

    return object.exchanges;
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "competitor",
      model,
      prompt_summary: `[SOP] 搜索竞对交易所`,
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error),
    });
    throw error;
  }
}

// ─── Briefing generation ──────────────────────

export async function generateBriefing(
  context: {
    totalPosts: number;
    kolPosts: number;
    negativePct: number;
    positivePct: number;
    alertLevel: string;
    topPosts: string;
    events: string;
  },
  model: string = DEFAULT_PARSE_MODEL
) {
  const prompt = buildBriefingPrompt(context);
  const start = Date.now();

  try {
    const { object } = await generateObject({
      model: xai(model),
      schema: BriefingSchema,
      prompt,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "briefing",
      model,
      prompt_summary: "[SOP] 生成高管简报",
      status: "success",
      duration_ms: Date.now() - start,
      result_summary: object.headline,
    });

    return object;
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "briefing",
      model,
      prompt_summary: "[SOP] 生成高管简报",
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error),
    });
    throw error;
  }
}
