/**
 * Grok SOP (Standard Operating Procedure) — Fixed prompt scripts
 *
 * These are the EXACT prompts sent to Grok. They do NOT change dynamically
 * (except for date range). All filtering/scoring happens system-side after
 * Grok returns raw data.
 *
 * Flow:
 *   Step 1: SEARCH — Grok searches X/Twitter, returns ALL posts found
 *   Step 2: PARSE  — Grok structures raw text into typed objects
 *   Step 3: SCORE  — Our code scores credibility, tags events, ranks
 */

import { MONITOR_KEYWORDS, OFFICIAL_HANDLES, CRYPTO_KOLS, EXCHANGE_ACCOUNTS } from "./constants";

const KOL_HANDLES = CRYPTO_KOLS.map((k) => `@${k.handle}`).join(", ");
const EXCHANGE_LIST = EXCHANGE_ACCOUNTS.map(
  (e) => `${e.exchange}: ${e.accounts.map((a) => `@${a.handle}`).join(", ")}`
).join("\n");

// ─────────────────────────────────────────────
// STEP 1: SEARCH SCRIPT
// ─────────────────────────────────────────────

export function buildSearchPrompt(fromDate: string, toDate: string): string {
  return `You are a social media intelligence analyst. Search X/Twitter for ALL posts mentioning Binance from ${fromDate} to ${toDate}.

## INSTRUCTIONS
Return EVERY post you find. Do NOT filter, do NOT summarize, do NOT group.
For each post, provide the EXACT information below. If a field is unknown, write "unknown".

## SEARCH SCOPE
1. Search these keywords: ${MONITOR_KEYWORDS.join(", ")}
2. Check these known KOL accounts: ${KOL_HANDLES}
3. Check these exchange accounts:
${EXCHANGE_LIST}
4. Check official Binance accounts: ${OFFICIAL_HANDLES.join(", ")}
5. Find ANY other account with significant engagement posting about Binance

## OUTPUT FORMAT (for EACH post found)
Post #N:
- Author: [display name]
- Handle: @[handle]
- Followers: [number]
- Text: [full tweet text, verbatim]
- URL: [tweet URL if available, otherwise "unknown"]
- Posted at: [ISO timestamp or approximate time]
- Impressions: [estimated number]
- Likes: [number if visible]
- Retweets: [number if visible]
- Quote tweets: [number if visible]
- Reply to: [parent tweet handle if this is a reply, otherwise "none"]
- Contains media: [yes/no]
- Language: [detected language code]
- Country: [author country if detectable, otherwise "unknown"]

## IMPORTANT
- Return ALL posts, not just "significant" ones
- Include positive, neutral, AND negative posts
- Include small accounts AND large accounts
- Include replies, quote tweets, and original posts
- Include official Binance responses
- Do NOT summarize or aggregate — list each post individually
- At the end, state: "Total posts found: [N]"`;
}

// ─────────────────────────────────────────────
// STEP 2: PARSE SCRIPT
// ─────────────────────────────────────────────

export function buildParsePrompt(rawSearchResults: string): string {
  return `Parse the following X/Twitter search results into structured JSON data.

## RULES
- Extract EVERY post listed — do not skip any
- For each post, fill ALL fields. Use best estimates if exact numbers aren't available.
- Sentiment scoring rules:
  - positive: defending Binance, sharing good news, bullish on BNB
  - negative: attacking Binance, FUD, regulatory concerns, security issues
  - neutral: factual reporting, price discussion without opinion, general mention
- sentiment_score: -1.0 (extremely negative) to +1.0 (extremely positive), 0 = neutral
- is_kol: true if author has 50K+ followers OR is a known crypto personality
- is_exchange_account: true if author is an official exchange account or executive
- is_official_response: true if from @binance, @cz_binance, @BinanceUS, or other official BN accounts

## INPUT
${rawSearchResults}`;
}

// ─────────────────────────────────────────────
// STEP 3: EVENT TAGGING SCRIPT
// ─────────────────────────────────────────────

export function buildEventTaggingPrompt(
  posts: string,
  existingEventTitles: string[]
): string {
  return `Analyze these tweets about Binance. Your job is to identify EVENTS (narratives/stories) and tag which posts belong to each event.

## RULES
- An "event" is a distinct narrative, story, or topic being discussed
- One post can belong to multiple events
- Every post MUST be tagged with at least one event
- If a post doesn't fit any narrative, tag it as "一般讨论"
- For each event, provide:
  - title: short descriptive title in Chinese (mention key KOL if one is driving it)
  - description: 1-2 sentence summary
  - theme: one of [合规, 安全, 监管, 法律, 市场, 链上异动, 媒体, 官方回应, 产品, 一般讨论]
  - severity: critical/high/medium/low based on: KOL follower count, impression count, sentiment negativity
  - is_new_event: true if not in existing events list below
- Return the mapping: which post IDs belong to which events

## EXISTING EVENTS (mark as NOT new if similar)
${existingEventTitles.length > 0 ? existingEventTitles.join("\n") : "(none)"}

## POSTS
${posts}`;
}

// ─────────────────────────────────────────────
// COMPETITOR SEARCH SCRIPT
// ─────────────────────────────────────────────

export function buildCompetitorSearchPrompt(
  exchanges: string[],
  fromDate: string,
  toDate: string
): string {
  return `Search X/Twitter for posts mentioning these cryptocurrency exchanges from ${fromDate} to ${toDate}: ${exchanges.join(", ")}

## INSTRUCTIONS
For EACH exchange, provide:
1. Total estimated mention count
2. Sentiment breakdown (positive %, neutral %, negative %)
3. Top 3 most-discussed topics/themes
4. Number of KOL posts (accounts with 50K+ followers)
5. Most impactful KOL post (if any)

## OUTPUT FORMAT
Exchange: [name]
- Mentions: [number]
- Positive: [%] / Neutral: [%] / Negative: [%]
- KOL posts: [number]
- Top themes: [theme1], [theme2], [theme3]
- Top KOL post: @[handle] ([followers]): "[text snippet]"

Repeat for each exchange.`;
}

// ─────────────────────────────────────────────
// BRIEFING SCRIPT
// ─────────────────────────────────────────────

export function buildBriefingPrompt(context: {
  totalPosts: number;
  kolPosts: number;
  negativePct: number;
  positivePct: number;
  alertLevel: string;
  topPosts: string;
  events: string;
}): string {
  return `你是 Binance 高级公关分析师。根据以下推特监控数据生成高管简报。

## 数据摘要
- 总帖子数: ${context.totalPosts}
- 大V帖子数: ${context.kolPosts}
- 负面情绪: ${context.negativePct}%
- 正面情绪: ${context.positivePct}%
- 当前预警级别: ${context.alertLevel}

## 高影响力帖子（按曝光量排序）
${context.topPosts}

## 活跃事件
${context.events}

## 输出要求
用中文撰写，包含以下部分：
1. headline: 一句话总结当前舆情态势（提及最关键的大V）
2. what_happened: 发生了什么（2-3句，列出具体大V和他们的发言）
3. why_it_matters: 为什么重要（2-3句，分析影响力和传播趋势）
4. what_to_do: 建议行动（3-5条具体建议，包含针对具体大V的应对策略）
5. alert_level: green/yellow/red
6. key_metrics: total_mentions, negative_pct, top_source`;
}
