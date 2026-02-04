# Binance Social Sentiment Monitor

Binance 推特舆情实时监控系统。通过 Grok API 搜索和分析 X/Twitter 上关于 Binance 的推文，重点关注大V (KOL) 发文和行业竞对动态。

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Recharts
- **AI**: Grok API via Vercel AI SDK (`@ai-sdk/xai`)
- **Database**: Supabase (PostgreSQL) / In-memory fallback
- **Deploy**: Vercel + Cron (每 30 分钟)

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in XAI_API_KEY, CRON_SECRET, and optionally Supabase keys
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `XAI_API_KEY` | Yes | Grok API key from xAI |
| `CRON_SECRET` | Yes | Secret for cron job auth |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key |

Without Supabase configured, data is stored in-memory (resets on restart).

---

## Grok SOP (Standard Operating Procedure)

All prompts sent to Grok are **fixed scripts** defined in `src/lib/grok-sop.ts`. Only the date range changes dynamically. All filtering, scoring, and ranking happens system-side after Grok returns raw data.

### Pipeline Overview

```
Step 1: SEARCH (Grok) → Step 2: PARSE (Grok) → Step 3: SCORE & TAG (System + Grok)
```

### Available Models

| Model ID | Name | Usage |
|----------|------|-------|
| `grok-4-1-fast-reasoning` | Grok 4.1 (推理) | Default search model, strongest |
| `grok-4-1-fast-non-reasoning` | Grok 4.1 (快速) | No reasoning chain, faster |
| `grok-3-fast` | Grok 3 Fast | Previous gen search |
| `grok-3-mini` | Grok 3 Mini | Default parse model, cheapest |

### Step 1: SEARCH Script

**Model**: `grok-4-1-fast-reasoning` (configurable)
**Purpose**: Search X/Twitter for ALL REAL posts mentioning Binance

```
You are a social media intelligence analyst. Search X/Twitter for ALL posts mentioning Binance from {fromDate} to {toDate}.

## CRITICAL — REAL TWEETS ONLY
- You MUST only return tweets that ACTUALLY EXIST on X/Twitter.
- Do NOT fabricate, hallucinate, invent, or generate fake tweets.
- Do NOT make up tweet content, authors, URLs, or engagement numbers.
- Every tweet you return must be a real post that you found via search.
- Every URL must be a real, valid tweet URL (https://x.com/[handle]/status/[id]).
- If you cannot verify a tweet is real, do NOT include it.
- If you find zero real tweets, return an empty list. An empty list is better than fake data.
- NEVER invent tweet IDs, follower counts, or impression numbers.

## INSTRUCTIONS
Return EVERY real post you find. Do NOT filter, do NOT summarize, do NOT group.
For each post, provide the EXACT information below. If a field is unknown, write "unknown".

## SEARCH SCOPE
1. Search these keywords: {MONITOR_KEYWORDS}
2. Check these known KOL accounts: {KOL_HANDLES}
3. Check these exchange accounts: {EXCHANGE_LIST}
4. Check official Binance accounts: {OFFICIAL_HANDLES}
5. Find ANY other account with significant engagement posting about Binance

## OUTPUT FORMAT (for EACH post found)
Post #N:
- Author: [display name]
- Handle: @[handle]
- Followers: [number]
- Text: [full tweet text, verbatim, in original language]
- URL: [real tweet URL, e.g. https://x.com/handle/status/123456789]
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
- Return ALL real posts, not just "significant" ones
- Include positive, neutral, AND negative posts
- Include small accounts AND large accounts
- Include replies, quote tweets, and original posts
- Include official Binance responses
- Do NOT summarize or aggregate — list each post individually
- ONLY include tweets you actually found. ZERO fabricated content.
- At the end, state: "Total posts found: [N]"
```

### Step 2: PARSE Script

**Model**: `grok-3-mini` (fixed)
**Purpose**: Structure raw search text into typed JSON + translate to Chinese

```
Parse the following X/Twitter search results into structured JSON data.

## CRITICAL — AUTHENTICITY
- Only parse tweets that appear to be REAL (have valid URLs, real handles, etc.)
- If any tweet looks fabricated or has a suspicious URL format, SKIP IT.
- Do NOT add any tweets that were not in the input.

## CHINESE TRANSLATION — MANDATORY
- For EVERY post, you MUST provide a Chinese translation in the "text_zh" field.
- If the original text is already in Chinese, copy it as-is to "text_zh".
- If the original text is in English or any other language, translate it accurately to Chinese.
- The "text" field keeps the ORIGINAL text verbatim. The "text_zh" field is the Chinese translation.
- Translation must preserve the meaning, tone, and key terms (keep crypto terms like BNB, DeFi, etc. as-is).

## RULES
- Extract EVERY post listed — do not skip any (unless it looks fabricated)
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
{rawSearchResults}
```

**Output Schema (Zod)**:
```typescript
{
  posts: Array<{
    text: string;           // Original text verbatim
    text_zh: string;        // Chinese translation (mandatory)
    author_name: string;
    author_handle: string;
    author_followers: number;
    url: string | null;
    posted_at: string;
    impressions: number;
    likes: number;
    retweets: number;
    quote_tweets: number;
    reply_to: string | null;
    contains_media: boolean;
    language: string;
    country: string | null;
    sentiment: "positive" | "neutral" | "negative";
    sentiment_score: number; // -1 to 1
    is_kol: boolean;
    is_exchange_account: boolean;
    is_official_response: boolean;
  }>;
  total_found: number;
}
```

### Step 3: EVENT TAGGING Script

**Model**: `grok-3-mini` (fixed)
**Purpose**: Group posts into narrative events

```
Analyze these tweets about Binance. Your job is to identify EVENTS (narratives/stories) and tag which posts belong to each event.

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
{existingEventTitles}

## POSTS
{postsSummary}
```

**Output Schema (Zod)**:
```typescript
{
  events: Array<{
    title: string;
    description: string;
    theme: string;
    severity: "critical" | "high" | "medium" | "low";
    is_new_event: boolean;
    post_indices: number[]; // 0-based indices of posts
  }>;
}
```

### System-Side Credibility Scoring

After Grok returns structured posts, the system computes a credibility score:

```
credibility_score =
  min(1, followers / 1,000,000) * 0.3 +
  min(1, impressions / 500,000) * 0.2 +
  min(1, (likes + retweets * 2) / 10,000) * 0.2 +
  (is_kol ? 0.2 : 0) +
  (is_exchange_account ? 0.1 : 0)
```

### Competitor Search Script

**Model**: `grok-4-1-fast-reasoning` (configurable)
**Purpose**: Search ALL major exchange mentions for comparison

```
Search X/Twitter for REAL posts mentioning these cryptocurrency exchanges from {fromDate} to {toDate}: Coinbase, OKX, Bybit, Kraken, Bitget, KuCoin, Gate.io, HTX (Huobi), Crypto.com, Upbit

## CRITICAL — REAL DATA ONLY
- Only report data based on tweets you actually found.
- Do NOT fabricate mention counts or sentiment percentages.
- If you cannot find data for an exchange, report 0 mentions.
- All numbers must reflect real search results.

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

Repeat for each exchange.
```

### Briefing Script

**Model**: `grok-3-mini` (fixed)
**Purpose**: Generate executive briefing in Chinese

```
你是 Binance 高级公关分析师。根据以下推特监控数据生成高管简报。

## 数据摘要
- 总帖子数: {totalPosts}
- 大V帖子数: {kolPosts}
- 负面情绪: {negativePct}%
- 正面情绪: {positivePct}%
- 当前预警级别: {alertLevel}

## 高影响力帖子（按曝光量排序）
{topPosts}

## 活跃事件
{events}

## 输出要求
用中文撰写，包含以下部分：
1. headline: 一句话总结当前舆情态势（提及最关键的大V）
2. what_happened: 发生了什么（2-3句，列出具体大V和他们的发言）
3. why_it_matters: 为什么重要（2-3句，分析影响力和传播趋势）
4. what_to_do: 建议行动（3-5条具体建议，包含针对具体大V的应对策略）
5. alert_level: green/yellow/red
6. key_metrics: total_mentions, negative_pct, top_source
```

---

## Monitored KOLs

| Handle | Name | Followers | Category |
|--------|------|-----------|----------|
| @VitalikButerin | Vitalik Buterin | 5.5M | 行业领袖 |
| @elonmusk | Elon Musk | 200M | 科技大V |
| @caboringz | CZ (赵长鹏) | 9M | Binance |
| @ZachXBT | ZachXBT | 1M | 链上侦探 |
| @lookonchain | Lookonchain | 1.2M | 链上分析 |
| @whale_alert | Whale Alert | 2.5M | 链上分析 |
| @WuBlockchain | 吴说区块链 | 680K | 加密媒体 |
| @coffeebreak_YT | CoffeeZilla | 850K | 调查记者 |
| @CryptoCapo_ | il Capo Of Crypto | 850K | 交易员 |
| @tier10k | Tier10K | 400K | 加密新闻 |
| @EmberCN | 余烬 (Ember) | 350K | 加密KOL |

(Full list in `src/lib/constants.ts`)

## Monitored Exchanges

Coinbase, OKX, Bybit, Kraken, Bitget, KuCoin, Gate.io, HTX (Huobi), Crypto.com, Upbit

Each exchange includes official accounts and key executive accounts. Full list in `src/lib/constants.ts`.

## Alert Levels

| Level | Condition |
|-------|-----------|
| Green | Negative < 25%, no Tier 1 sources |
| Yellow | Negative >= 25% OR Tier 1 source detected |
| Red | Negative >= 40% AND Tier 1 source AND high velocity |

## Pages

- `/` — Dashboard (metrics, sentiment, KOL activity, trend charts)
- `/events` — Events & tweets (individual tweet cards with event tags, custom sorting)
- `/briefing` — AI executive briefing
- `/competitors` — All-exchange comparison (table, bar chart, trend lines)
- `/reports` — Report generation
- `/settings` — Configuration
