import { generateText, generateObject } from "ai";
import { createXai } from "@ai-sdk/xai";
import { z } from "zod";
import {
  MONITOR_KEYWORDS,
  COMPETITOR_KEYWORDS,
  OFFICIAL_HANDLES,
  CRYPTO_KOLS,
  KOL_FOLLOWER_THRESHOLD,
  EXCHANGE_ACCOUNTS,
} from "./constants";
import { searchLogStore } from "./search-log";

const xai = createXai({ apiKey: process.env.XAI_API_KEY });

export const DEFAULT_SEARCH_MODEL = "grok-4-1-fast-reasoning";
export const DEFAULT_PARSE_MODEL = "grok-3-mini";

export const AVAILABLE_MODELS = [
  { id: "grok-4-1-fast-reasoning", name: "Grok 4.1 (推理)", description: "最强模型，带推理链，推荐" },
  { id: "grok-4-1-fast-non-reasoning", name: "Grok 4.1 (快速)", description: "无推理，响应更快" },
  { id: "grok-3-fast", name: "Grok 3 Fast", description: "上一代快速搜索" },
  { id: "grok-3-mini", name: "Grok 3 Mini", description: "轻量解析，最省钱" },
];

const kolHandleList = CRYPTO_KOLS.map((k) => `@${k.handle}`).join(", ");
const exchangeAccountList = EXCHANGE_ACCOUNTS.map(
  (e) =>
    `${e.exchange}: ${e.accounts.map((a) => `@${a.handle}(${a.role})`).join(", ")}`
).join("\n");

const MentionSchema = z.object({
  mentions: z.array(
    z.object({
      text: z.string().describe("The tweet text content"),
      author: z.string().describe("Author display name"),
      author_handle: z.string().describe("Author @ handle"),
      author_followers: z.number().describe("Approximate follower count"),
      is_kol: z
        .boolean()
        .describe(
          "Whether this author is a KOL/大V with 50K+ followers or significant crypto influence"
        ),
      is_exchange_account: z
        .boolean()
        .describe(
          "Whether this is from a competitor exchange official or executive account"
        ),
      is_discovered: z
        .boolean()
        .describe(
          "True if this account is NOT in the known watchlist but was newly discovered posting about Binance with significant reach (10K+ followers)"
        ),
      url: z.string().optional().describe("Tweet URL if available"),
      country: z.string().nullable().describe("Author country if detectable"),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      sentiment_score: z
        .number()
        .min(-1)
        .max(1)
        .describe(
          "Sentiment score from -1 (very negative) to 1 (very positive)"
        ),
      impressions: z.number().describe("Estimated impressions"),
      is_official_response: z
        .boolean()
        .describe("Whether this is from an official Binance account"),
      posted_at: z.string().describe("Approximate posting time ISO string"),
    })
  ),
  discovered_accounts: z
    .array(
      z.object({
        handle: z.string(),
        name: z.string(),
        followers: z.number(),
        bio_summary: z
          .string()
          .describe("Short description of who this account is"),
        tweet_about_bn: z
          .string()
          .describe("What they said about Binance"),
        sentiment: z.enum(["positive", "neutral", "negative"]),
      })
    )
    .describe(
      "NEW accounts not in the known watchlist that were discovered posting about Binance — only include if they have 10K+ followers or their tweet is getting significant engagement"
    ),
  kol_summary: z
    .string()
    .describe(
      "Summary of KOL/大V activity — who posted, what they said, their influence level"
    ),
  summary: z
    .string()
    .describe("Overall summary of sentiment landscape"),
  dominant_sentiment: z.enum(["positive", "neutral", "negative"]),
  key_themes: z
    .array(z.string())
    .describe("Key topics/themes detected"),
  notable_accounts: z
    .array(z.string())
    .describe("Notable KOL accounts that posted about Binance"),
  total_estimated_mentions: z
    .number()
    .describe("Estimated total mentions in this period"),
  kol_count: z
    .number()
    .describe("Number of KOLs (50K+ followers) that posted about Binance"),
});

const EventSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      description: z
        .string()
        .describe(
          "Description should mention which KOL/大V accounts are driving this narrative"
        ),
      severity: z.enum(["critical", "high", "medium", "low"]),
      theme: z.string(),
      is_new_event: z
        .boolean()
        .describe("True if this is breaking news, false if recycled/ongoing"),
      key_kols: z
        .array(z.string())
        .describe("KOL handles driving this event"),
      mention_count: z.number(),
      impression_estimate: z.number(),
      positive_pct: z.number(),
      neutral_pct: z.number(),
      negative_pct: z.number(),
    })
  ),
});

const BriefingSchema = z.object({
  alert_level: z.enum(["green", "yellow", "red"]),
  headline: z
    .string()
    .describe(
      "One line headline — mention the most impactful KOL if relevant"
    ),
  what_happened: z
    .string()
    .describe(
      "What happened section — focus on which 大V/KOLs posted, what they said, and their reach"
    ),
  why_it_matters: z
    .string()
    .describe(
      "Why it matters — explain the KOL's influence, credibility, and potential amplification effect"
    ),
  what_to_do: z
    .string()
    .describe(
      "Recommended actions — include specific KOL engagement strategies"
    ),
  key_metrics: z.object({
    total_mentions: z.number(),
    negative_pct: z.number(),
    top_source: z
      .string()
      .describe("Most impactful KOL handle with follower count"),
  }),
});

export async function searchBinanceMentions(
  fromDate: string,
  toDate: string,
  model: string = DEFAULT_SEARCH_MODEL
) {
  const searchModel = model;
  const parseModel = DEFAULT_PARSE_MODEL;

  // Step 1: Search via Grok x_search
  const searchStart = Date.now();
  let searchText: string;
  try {
    const { text } = await generateText({
      model: xai(searchModel),
      prompt: `Search X/Twitter for recent posts about Binance from ${fromDate} to ${toDate}.

## PRIORITY 1: Twitter 大V / KOL tweets
Your #1 priority is to find tweets from influential accounts (大V, KOLs, crypto influencers) with 50K+ followers discussing Binance:
- Known crypto KOLs to watch: ${kolHandleList}
- Any account with ${KOL_FOLLOWER_THRESHOLD}+ followers posting about Binance
- Crypto analysts, on-chain investigators, trading influencers
- Journalists and media personalities covering crypto

## PRIORITY 2: Competitor exchange accounts
Check if any competitor exchange official/executive accounts are posting about or referencing Binance:
${exchangeAccountList}

## PRIORITY 3: Discover NEW accounts
Find accounts NOT in the above lists that are posting about Binance and getting significant engagement (10K+ likes/retweets or from accounts with 10K+ followers). These are newly emerging voices we haven't been tracking.

## PRIORITY 4: Mainstream media shared on Twitter
Check if major news articles (FT, Bloomberg, Reuters, WSJ, CoinDesk, The Block) are being shared on Twitter.

For EACH significant post found:
- Exact tweet text, author handle, approximate follower count
- Sentiment and tone (attacking, neutral analysis, defending, etc.)
- Estimated impressions/reach
- Whether this account is from the known watchlist or newly discovered

## Search keywords: ${MONITOR_KEYWORDS.join(", ")}
## Official BN accounts: ${OFFICIAL_HANDLES.join(", ")}

Focus on: regulatory issues, FUD, security concerns, compliance, legal matters, competitor shade-throwing, on-chain investigations.
Exclude: pure price speculation from small accounts, bot spam.

Provide:
1. KOL tweets (sorted by influence)
2. Any competitor exchange account activity regarding Binance
3. Newly discovered accounts posting about BN
4. Overall KOL sentiment summary
5. Key themes and official BN responses
6. Total estimated mentions and KOL count`,
    });
    searchText = text;

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "search",
      model: searchModel,
      prompt_summary: `搜索推特 Binance 大V舆情 (${fromDate} ~ ${toDate})`,
      status: "success",
      duration_ms: Date.now() - searchStart,
      result_summary: text.slice(0, 300) + "...",
    });
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "search",
      model: searchModel,
      prompt_summary: `搜索推特 Binance 大V舆情 (${fromDate} ~ ${toDate})`,
      status: "error",
      duration_ms: Date.now() - searchStart,
      error: String(error),
    });
    throw error;
  }

  // Step 2: Parse into structured data
  const parseStart = Date.now();
  try {
    const { object: structured } = await generateObject({
      model: xai(parseModel),
      schema: MentionSchema,
      prompt: `Parse the following X/Twitter search results into structured data.

IMPORTANT:
- Mark any author with 50K+ followers as is_kol=true
- Mark competitor exchange accounts as is_exchange_account=true
- Mark accounts NOT in the known watchlist as is_discovered=true (only if 10K+ followers or high engagement)
- Fill the discovered_accounts array with new accounts found
- Sort mentions with KOL posts first (highest followers first)
- Provide a kol_summary focusing on influential accounts
- Count total KOLs that posted

Results:\n\n${searchText}`,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "parse",
      model: parseModel,
      prompt_summary: "解析搜索结果为结构化数据",
      status: "success",
      duration_ms: Date.now() - parseStart,
      mentions_found: structured.mentions.length,
      kol_count: structured.kol_count,
      result_summary: `${structured.mentions.length} 条提及, ${structured.kol_count} 个大V, ${structured.discovered_accounts.length} 个新发现账号`,
    });

    return {
      structured,
      rawSummary: searchText,
      models: { search: searchModel, parse: parseModel },
    };
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "parse",
      model: parseModel,
      prompt_summary: "解析搜索结果为结构化数据",
      status: "error",
      duration_ms: Date.now() - parseStart,
      error: String(error),
    });
    throw error;
  }
}

export async function searchCompetitorMentions(
  competitor: string,
  fromDate: string,
  toDate: string,
  model: string = DEFAULT_SEARCH_MODEL
) {
  const keywords =
    competitor.toLowerCase() === "coinbase"
      ? COMPETITOR_KEYWORDS
      : [competitor.toLowerCase()];

  const start = Date.now();
  try {
    const { text } = await generateText({
      model: xai(model),
      prompt: `Search X/Twitter for recent posts about ${competitor} (keywords: ${keywords.join(", ")}) from ${fromDate} to ${toDate}.

Focus on tweets from KOLs (50K+ followers) and mainstream media coverage. Analyze the overall sentiment, paying special attention to negative/FUD posts from influential accounts.

Provide: total estimated mentions, KOL mention count, percentage positive/neutral/negative sentiment, and key themes.`,
    });

    const { object } = await generateObject({
      model: xai(DEFAULT_PARSE_MODEL),
      schema: z.object({
        total_mentions: z.number(),
        positive_pct: z.number(),
        neutral_pct: z.number(),
        negative_pct: z.number(),
        key_themes: z.array(z.string()),
        summary: z.string(),
      }),
      prompt: `Parse these competitor sentiment results into structured data:\n\n${text}`,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "competitor",
      model,
      prompt_summary: `搜索竞对 ${competitor} 推特舆情`,
      status: "success",
      duration_ms: Date.now() - start,
      result_summary: `${competitor}: ${object.total_mentions} 提及, ${object.negative_pct}% 负面`,
    });

    return object;
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "competitor",
      model,
      prompt_summary: `搜索竞对 ${competitor} 推特舆情`,
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error),
    });
    throw error;
  }
}

export async function detectEvents(
  mentions: Array<{
    text: string;
    author: string;
    author_handle?: string;
    sentiment: string;
    impressions: number;
    is_kol?: boolean;
    author_followers?: number;
  }>,
  existingEventTitles: string[],
  model: string = DEFAULT_PARSE_MODEL
) {
  if (mentions.length === 0) return { events: [] };

  const kolMentions = mentions.filter((m) => m.is_kol);
  const otherMentions = mentions.filter((m) => !m.is_kol);

  const mentionSummary = [...kolMentions, ...otherMentions]
    .slice(0, 50)
    .map(
      (m) =>
        `[${m.sentiment}]${m.is_kol ? " [大V]" : ""} @${m.author_handle || m.author} (${m.author_followers || m.impressions} followers, ${m.impressions} impressions): ${m.text.slice(0, 200)}`
    )
    .join("\n");

  const start = Date.now();
  try {
    const { object } = await generateObject({
      model: xai(model),
      schema: EventSchema,
      prompt: `Analyze these Twitter mentions about Binance and identify distinct events or narratives driven by KOLs/大V that warrant attention. Group related mentions into events.

KEY PRINCIPLE: Events should be primarily identified by which KOL/大V is driving the narrative, not just by topic. A single tweet from a 1M+ follower account is more significant than 100 tweets from small accounts.

For each event, determine:
- A clear title mentioning the key KOL driving it (e.g., "ZachXBT 发布可疑交易追踪")
- Description explaining the KOL's claim and their influence/credibility
- Severity: critical (major KOL with 1M+ followers making serious claims), high (notable KOL with 100K-1M followers), medium (smaller KOL or media coverage), low (general sentiment without KOL driver)
- key_kols: List of KOL handles involved in this event
- Theme category
- Whether it's genuinely new or recycling old news
- Estimated mention count and impressions

Existing known events (mark as NOT new if similar): ${existingEventTitles.join(", ") || "none"}

Recent mentions (KOL mentions listed first):
${mentionSummary}`,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "events",
      model,
      prompt_summary: `检测 FUD 事件 (${mentions.length} 条提及)`,
      status: "success",
      duration_ms: Date.now() - start,
      result_summary: `检测到 ${object.events.length} 个事件`,
    });

    return object;
  } catch (error) {
    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "events",
      model,
      prompt_summary: `检测 FUD 事件 (${mentions.length} 条提及)`,
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error),
    });
    throw error;
  }
}

export async function generateBriefing(
  context: {
    snapshot: {
      total_mentions: number;
      negative_pct: number;
      positive_pct: number;
      alert_level: string;
      kol_mention_count?: number;
    };
    events: Array<{ title: string; severity: string; description: string }>;
    rawSummary: string;
  },
  model: string = DEFAULT_PARSE_MODEL
) {
  const start = Date.now();
  try {
    const { object } = await generateObject({
      model: xai(model),
      schema: BriefingSchema,
      prompt: `你是 Binance 的高级公关分析师。根据最新推特舆情数据为高管团队生成简报。

重点关注推特大V/KOL动态。高管最需要知道的是：哪些有影响力的人在说什么，以及这对公司声誉意味着什么。

当前状态：
- 预警级别：${context.snapshot.alert_level}
- 总提及量：${context.snapshot.total_mentions}
- 大V发文数：${context.snapshot.kol_mention_count || "未知"}
- 负面情绪占比：${context.snapshot.negative_pct}%
- 正面情绪占比：${context.snapshot.positive_pct}%

活跃事件：
${context.events.map((e) => `[${e.severity.toUpperCase()}] ${e.title}: ${e.description}`).join("\n")}

原始推特舆情摘要：
${context.rawSummary}

要求：
1. 用中文撰写简报
2. 重点列出发文的大V、他们的影响力、以及对Binance的潜在影响
3. 建议包含针对具体大V的应对策略
4. 使用交通灯系统：green（安全）、yellow（需密切关注）、red（需立即行动）`,
    });

    searchLogStore.add({
      timestamp: new Date().toISOString(),
      type: "briefing",
      model,
      prompt_summary: "生成高管简报",
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
      prompt_summary: "生成高管简报",
      status: "error",
      duration_ms: Date.now() - start,
      error: String(error),
    });
    throw error;
  }
}
