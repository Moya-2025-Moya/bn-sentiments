import type { SentimentSnapshot, SentimentEvent, CompetitorSnapshot, KOLActivity, EventTweet } from "./types";

// Real timestamps based on current time
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

// Demo KOL activities — 大V动态
export const DEMO_KOL_ACTIVITIES: KOLActivity[] = [
  {
    handle: "ZachXBT",
    name: "ZachXBT",
    followers: 1_000_000,
    category: "链上侦探",
    tweet_text:
      "Binance 仍有多个高风险账户在活跃交易中。我追踪到至少 3 个与制裁实体关联的钱包在过去 72 小时内通过 BN 转移了超过 $45M。和解协议后的合规措施到底执行了多少？🧵",
    sentiment: "negative",
    impressions: 2_800_000,
    posted_at: hoursAgo(3),
    url: "https://x.com/ZachXBT/status/example1",
  },
  {
    handle: "lookonchain",
    name: "Lookonchain",
    followers: 1_200_000,
    category: "链上分析",
    tweet_text:
      "🚨 链上异动：一个与 Binance 关联的巨鲸地址在过去 1 小时内转出 15,000 BNB ($10.5M)。这是本周第三次大额转出。",
    sentiment: "negative",
    impressions: 1_500_000,
    posted_at: hoursAgo(5),
    url: "https://x.com/lookonchain/status/example2",
  },
  {
    handle: "WuBlockchain",
    name: "吴说区块链",
    followers: 680_000,
    category: "加密媒体",
    tweet_text:
      "据悉，FT 报道发布后多家监管机构已启动对 Binance 合规措施的新一轮审查。知情人士透露，问题集中在 KYC 流程和可疑交易监控系统。",
    sentiment: "negative",
    impressions: 890_000,
    posted_at: hoursAgo(8),
    url: "https://x.com/WuBlockchain/status/example3",
  },
  {
    handle: "VitalikButerin",
    name: "Vitalik Buterin",
    followers: 5_500_000,
    category: "行业领袖",
    tweet_text:
      "CEX 合规性是整个行业面临的系统性挑战。单独针对某一家交易所并不能解决根本问题，我们需要更好的链上透明工具。",
    sentiment: "neutral",
    impressions: 4_200_000,
    posted_at: hoursAgo(12),
    url: "https://x.com/VitalikButerin/status/example4",
  },
  {
    handle: "caboringz",
    name: "CZ (赵长鹏)",
    followers: 9_000_000,
    category: "Binance",
    tweet_text:
      "关于近期报道的回应：Binance 在过去 18 个月投入了超过 $500M 用于合规基础设施升级。我们已关闭数千个可疑账户，处理速度比行业平均快 3 倍。事实胜于雄辩。",
    sentiment: "positive",
    impressions: 6_500_000,
    posted_at: hoursAgo(6),
    url: "https://x.com/cz_binance/status/example5",
  },
  {
    handle: "CryptoCapo_",
    name: "il Capo Of Crypto",
    followers: 850_000,
    category: "交易员",
    tweet_text:
      "BNB 技术面来看，$680 支撑位很关键。如果 FUD 持续但价格守住这个位置，反而是一个不错的入场机会。短期看空，中期看多。",
    sentiment: "neutral",
    impressions: 720_000,
    posted_at: hoursAgo(10),
    url: "https://x.com/CryptoCapo_/status/example6",
  },
  {
    handle: "EmberCN",
    name: "余烬 (Ember)",
    followers: 350_000,
    category: "加密KOL",
    tweet_text:
      "Binance 的 BNB 销毁机制其实在持续推进，最新一次销毁了约 $750M 等值的 BNB。基本面没有变化，FUD 是短期的。",
    sentiment: "positive",
    impressions: 280_000,
    posted_at: hoursAgo(14),
    url: "https://x.com/EmberCN/status/example7",
  },
  {
    handle: "coffeebreak_YT",
    name: "CoffeeZilla",
    followers: 850_000,
    category: "调查记者",
    tweet_text:
      "New video coming: I've been looking into the FT Binance story. There's more to this than the headlines suggest. Binance's compliance record post-settlement is... complicated.",
    sentiment: "negative",
    impressions: 1_100_000,
    posted_at: hoursAgo(2),
    url: "https://x.com/coffeebreak_YT/status/example8",
  },
];

export const DEMO_SNAPSHOT: SentimentSnapshot = {
  id: "demo-1",
  timestamp: new Date().toISOString(),
  total_mentions: 40000,
  total_impressions: 7100000,
  total_reach: 74000000,
  unique_authors: 21000,
  positive_pct: 9,
  neutral_pct: 51,
  negative_pct: 40,
  alert_level: "yellow",
  bnb_price: 698.5,
  kol_mention_count: 23,
  top_countries: {
    "美国": 143,
    "瑞士": 109,
    "英国": 24,
    "加拿大": 14,
    "中国": 13,
    "希腊": 11,
    "土耳其": 11,
    "印度": 10,
    "意大利": 10,
    "俄罗斯": 10,
  },
  top_urls: [
    { url: "https://x.com/ZachXBT/status/example1", count: 3200 },
    { url: "https://x.com/lookonchain/status/example2", count: 1800 },
    { url: "https://www.ft.com/content/5d8af345-d593-47b1-85ae-758ee60e9a89", count: 1245 },
    { url: "https://x.com/cz_binance/status/example5", count: 980 },
    { url: "https://x.com/WuBlockchain/status/example3", count: 670 },
    { url: "https://www.coindesk.com/policy/binance-compliance", count: 389 },
  ],
  top_kols: DEMO_KOL_ACTIVITIES,
};

export const DEMO_PREVIOUS_SNAPSHOT: SentimentSnapshot = {
  id: "demo-0",
  timestamp: hoursAgo(24),
  total_mentions: 40800,
  total_impressions: 13000000,
  total_reach: 78000000,
  unique_authors: 20800,
  positive_pct: 15,
  neutral_pct: 60,
  negative_pct: 25,
  alert_level: "green",
  bnb_price: 712.3,
  kol_mention_count: 8,
  top_countries: {},
  top_urls: [],
  top_kols: [],
};

export const DEMO_SNAPSHOTS_24H: SentimentSnapshot[] = Array.from(
  { length: 48 },
  (_, i) => {
    const h = 24 - i * 0.5;
    const negBase = 25 + Math.sin(i * 0.3) * 15 + (Math.sin(i * 0.7) * 3);
    const posBase = 10 + Math.sin(i * 0.5) * 3;
    return {
      id: `demo-snap-${i}`,
      timestamp: hoursAgo(h),
      total_mentions: Math.floor(800 + Math.sin(i * 0.4) * 200 + (i > 30 ? 300 : 0)),
      total_impressions: Math.floor(100000 + Math.sin(i * 0.3) * 30000),
      total_reach: Math.floor(1500000 + Math.sin(i * 0.3) * 300000),
      unique_authors: Math.floor(400 + Math.sin(i * 0.4) * 100),
      positive_pct: Math.round(Math.max(2, posBase)),
      neutral_pct: Math.round(100 - Math.max(10, negBase) - Math.max(2, posBase)),
      negative_pct: Math.round(Math.max(10, negBase)),
      alert_level: negBase > 35 ? "yellow" : "green",
      bnb_price: 710 - i * 0.5 + Math.sin(i * 0.2) * 8 - (i > 30 ? 15 : 0),
      kol_mention_count: Math.floor(Math.random() * 5) + (i > 30 ? 4 : 0),
      top_countries: {},
      top_urls: [],
      top_kols: [],
    } as SentimentSnapshot;
  }
);

export const DEMO_EVENTS: SentimentEvent[] = [
  {
    id: "evt-1",
    title: "ZachXBT 发布 Binance 可疑交易追踪线程",
    description:
      "链上侦探 @ZachXBT（100万粉丝）发布深度调查线程，追踪到至少 3 个与制裁实体关联的钱包在 BN 转移超过 $45M。推文获得 280 万曝光，被多个大V转发，引发社区对 Binance 合规性的广泛讨论。",
    severity: "critical",
    is_new_event: true,
    official_response: false,
    source_tier: 1,
    theme: "合规",
    first_detected_at: hoursAgo(3),
    mention_count: 1200,
    impression_estimate: 4_500_000,
    positive_pct: 3,
    neutral_pct: 35,
    negative_pct: 62,
    status: "active",
    key_kols: ["ZachXBT"],
    related_tweets: [
      {
        author_handle: "ZachXBT",
        author_name: "ZachXBT",
        author_followers: 1_000_000,
        text: "Binance 仍有多个高风险账户在活跃交易中。我追踪到至少 3 个与制裁实体关联的钱包在过去 72 小时内通过 BN 转移了超过 $45M。和解协议后的合规措施到底执行了多少？🧵",
        url: "https://x.com/ZachXBT/status/1234567890",
        sentiment: "negative",
        impressions: 2_800_000,
        posted_at: hoursAgo(3),
        is_kol: true,
      },
      {
        author_handle: "tier10k",
        author_name: "Tier10K",
        author_followers: 400_000,
        text: "RT @ZachXBT: Binance 仍有多个高风险账户在活跃交易中...\n\n这个调查力度很猛，ZachXBT 追踪到的细节远超 FT 的报道。",
        url: "https://x.com/tier10k/status/1234567891",
        sentiment: "negative",
        impressions: 320_000,
        posted_at: hoursAgo(2.5),
        is_kol: true,
      },
    ],
    created_at: hoursAgo(3),
    updated_at: hoursAgo(0.5),
  },
  {
    id: "evt-2",
    title: "CoffeeZilla 预告 Binance 调查视频",
    description:
      "YouTube 调查记者 @coffeebreak_YT（85万粉丝）在 X 上发文预告即将发布的 Binance 调查视频，暗示 FT 报道背后有更多细节。推文引发大量关注和讨论。",
    severity: "high",
    is_new_event: true,
    official_response: false,
    source_tier: 1,
    theme: "媒体",
    first_detected_at: hoursAgo(2),
    mention_count: 680,
    impression_estimate: 1_800_000,
    positive_pct: 2,
    neutral_pct: 45,
    negative_pct: 53,
    status: "active",
    key_kols: ["coffeebreak_YT"],
    related_tweets: [
      {
        author_handle: "coffeebreak_YT",
        author_name: "CoffeeZilla",
        author_followers: 850_000,
        text: "New video coming: I've been looking into the FT Binance story. There's more to this than the headlines suggest. Binance's compliance record post-settlement is... complicated.",
        url: "https://x.com/coffeebreak_YT/status/1234567892",
        sentiment: "negative",
        impressions: 1_100_000,
        posted_at: hoursAgo(2),
        is_kol: true,
      },
    ],
    created_at: hoursAgo(2),
    updated_at: hoursAgo(0.3),
  },
  {
    id: "evt-3",
    title: "CZ 官方回应 FT 报道 获大量转发",
    description:
      "Binance 创始人 @cz_binance（900万粉丝）发布正式回应，强调过去 18 个月投入 $500M 合规升级。推文获得 650 万曝光，一定程度上缓解了市场恐慌。",
    severity: "medium",
    is_new_event: false,
    official_response: true,
    source_tier: 1,
    theme: "官方回应",
    first_detected_at: hoursAgo(6),
    mention_count: 890,
    impression_estimate: 6_500_000,
    positive_pct: 35,
    neutral_pct: 48,
    negative_pct: 17,
    status: "active",
    key_kols: ["cz_binance"],
    related_tweets: [
      {
        author_handle: "cz_binance",
        author_name: "CZ (赵长鹏)",
        author_followers: 9_000_000,
        text: "关于近期报道的回应：Binance 在过去 18 个月投入了超过 $500M 用于合规基础设施升级。我们已关闭数千个可疑账户，处理速度比行业平均快 3 倍。事实胜于雄辩。",
        url: "https://x.com/cz_binance/status/1234567893",
        sentiment: "positive",
        impressions: 6_500_000,
        posted_at: hoursAgo(6),
        is_kol: true,
      },
    ],
    created_at: hoursAgo(6),
    updated_at: hoursAgo(1),
  },
  {
    id: "evt-4",
    title: "Lookonchain 监测到 BNB 巨鲸异常转出",
    description:
      "链上分析账号 @lookonchain（120万粉丝）连续追踪到 Binance 关联巨鲸地址大额转出 BNB，本周第三次。总计 15,000 BNB（约 $10.5M），引发市场抛售恐慌。",
    severity: "high",
    is_new_event: true,
    official_response: false,
    source_tier: 1,
    theme: "链上异动",
    first_detected_at: hoursAgo(5),
    mention_count: 560,
    impression_estimate: 2_300_000,
    positive_pct: 5,
    neutral_pct: 40,
    negative_pct: 55,
    status: "active",
    key_kols: ["lookonchain"],
    related_tweets: [
      {
        author_handle: "lookonchain",
        author_name: "Lookonchain",
        author_followers: 1_200_000,
        text: "🚨 链上异动：一个与 Binance 关联的巨鲸地址在过去 1 小时内转出 15,000 BNB ($10.5M)。这是本周第三次大额转出。",
        url: "https://x.com/lookonchain/status/1234567894",
        sentiment: "negative",
        impressions: 1_500_000,
        posted_at: hoursAgo(5),
        is_kol: true,
      },
    ],
    created_at: hoursAgo(5),
    updated_at: hoursAgo(1.5),
  },
  {
    id: "evt-5",
    title: "FT 调查报道被加密圈广泛传播",
    description:
      "英国《金融时报》调查报告被 @WuBlockchain、@tier10k 等多个加密大V转发，在推特上形成二次传播效应。报道揭露认罪协议后仍有 $144M 可疑交易。",
    severity: "high",
    is_new_event: false,
    official_response: true,
    source_tier: 1,
    theme: "合规",
    first_detected_at: hoursAgo(72),
    mention_count: 787,
    impression_estimate: 8_600_000,
    positive_pct: 2,
    neutral_pct: 76,
    negative_pct: 22,
    status: "monitoring",
    key_kols: ["WuBlockchain", "tier10k"],
    related_tweets: [
      {
        author_handle: "WuBlockchain",
        author_name: "吴说区块链",
        author_followers: 680_000,
        text: "据悉，FT 报道发布后多家监管机构已启动对 Binance 合规措施的新一轮审查。知情人士透露，问题集中在 KYC 流程和可疑交易监控系统。",
        url: "https://x.com/WuBlockchain/status/1234567895",
        sentiment: "negative",
        impressions: 890_000,
        posted_at: hoursAgo(8),
        is_kol: true,
      },
      {
        author_handle: "tier10k",
        author_name: "Tier10K",
        author_followers: 400_000,
        text: "BREAKING: FT reports $144M in suspicious transactions through Binance after plea deal. 13 flagged accounts continued to trade freely.",
        url: "https://x.com/tier10k/status/1234567896",
        sentiment: "negative",
        impressions: 520_000,
        posted_at: hoursAgo(70),
        is_kol: true,
      },
    ],
    created_at: hoursAgo(72),
    updated_at: hoursAgo(1),
  },
];

export const DEMO_COMPETITOR_SNAPSHOTS: CompetitorSnapshot[] = Array.from(
  { length: 48 },
  (_, i) => ({
    id: `comp-${i}`,
    timestamp: hoursAgo(24 - i * 0.5),
    exchange_name: "coinbase",
    total_mentions: Math.floor(300 + Math.sin(i * 0.3) * 80),
    negative_pct: Math.round(15 + Math.sin(i * 0.4) * 5),
    positive_pct: Math.round(20 + Math.sin(i * 0.3) * 5),
    neutral_pct: Math.round(60 + Math.sin(i * 0.2) * 5),
    alert_level: "green",
  })
);

export const DEMO_BRIEFING = {
  alert_level: "yellow" as const,
  headline:
    "多名大V发布 Binance 负面调查内容 — CZ 已回应但舆论仍在发酵",
  what_happened:
    "过去 24 小时内，@ZachXBT 发布 Binance 可疑交易追踪线程（280万曝光），@CoffeeZilla 预告 Binance 调查视频（110万曝光），@lookonchain 追踪到 BNB 巨鲸异常转出（150万曝光）。23 名大V（50K+粉丝）发文讨论 Binance，其中 65% 为负面情绪。FT 原始报道仍在通过 @WuBlockchain 等媒体类大V进行二次传播。",
  why_it_matters:
    "本轮舆情由推特大V驱动而非散户，具有更强的传播力和影响力。@ZachXBT 的链上追踪具有高度可信性，社区信任度极高。@CoffeeZilla 的调查视频一旦发布将面向其 380 万 YouTube 订阅者，可能引发新一轮舆论高峰。虽然 CZ 的回应获得了 650 万曝光，但负面大V的声量仍在增长。BNB 价格已从 $712 跌至 $698，与大V发文时间点高度相关。",
  what_to_do:
    "1. 重点监控 @CoffeeZilla 的 YouTube 视频发布时间，准备针对性回应素材\n2. 通过 @binance 官方账号主动与 @ZachXBT 的具体指控进行事实澄清\n3. 安排合规团队负责人接受友好媒体采访，展示具体合规改进数据\n4. 在大V活跃时段（UTC 14:00-20:00）加密发布正面信息，稀释负面声量\n5. 追踪 @lookonchain 报告的巨鲸地址，如非异常需及时澄清",
  key_metrics: {
    total_mentions: 40000,
    negative_pct: 40,
    top_source: "@ZachXBT (链上侦探, 100万粉丝)",
  },
};
