export const MONITOR_KEYWORDS = [
  "binance", "BNB", "@binance", "#binance",
  "币安", "赵长鹏", "币安交易所",
  "#币安", "Binance FUD", "Binance scam",
  "Binance hack", "Binance 监管",
];
export const COMPETITOR_KEYWORDS = ["coinbase", "@coinbase", "#coinbase"];
export const OFFICIAL_HANDLES = ["binance", "cz_binance", "haboringz", "BinanceUS"];

// Known crypto KOLs / 大V to monitor — tweets from these accounts are high priority
export const CRYPTO_KOLS: { handle: string; name: string; followers: number; category: string }[] = [
  { handle: "VitalikButerin", name: "Vitalik Buterin", followers: 5_500_000, category: "行业领袖" },
  { handle: "elonmusk", name: "Elon Musk", followers: 200_000_000, category: "科技大V" },
  { handle: "caboringz", name: "CZ (赵长鹏)", followers: 9_000_000, category: "Binance" },
  { handle: "SBF_FTX", name: "SBF", followers: 1_100_000, category: "行业人物" },
  { handle: "inversebrah", name: "inversebrah", followers: 750_000, category: "加密KOL" },
  { handle: "CryptoCapo_", name: "il Capo Of Crypto", followers: 850_000, category: "交易员" },
  { handle: "lookonchain", name: "Lookonchain", followers: 1_200_000, category: "链上分析" },
  { handle: "whale_alert", name: "Whale Alert", followers: 2_500_000, category: "链上分析" },
  { handle: "WuBlockchain", name: "吴说区块链", followers: 680_000, category: "加密媒体" },
  { handle: "coaboringze", name: "Cobie", followers: 740_000, category: "加密KOL" },
  { handle: "ZachXBT", name: "ZachXBT", followers: 1_000_000, category: "链上侦探" },
  { handle: "coffeebreak_YT", name: "CoffeeZilla", followers: 850_000, category: "调查记者" },
  { handle: "AltcoinGordon", name: "Altcoin Gordon", followers: 600_000, category: "加密KOL" },
  { handle: "CryptoGodJohn", name: "Crypto God John", followers: 500_000, category: "加密KOL" },
  { handle: "tier10k", name: "Tier10K", followers: 400_000, category: "加密新闻" },
  { handle: "EmberCN", name: "余烬 (Ember)", followers: 350_000, category: "加密KOL" },
  { handle: "Miao_Crypto", name: "喵姐", followers: 280_000, category: "加密KOL" },
];

export const KOL_FOLLOWER_THRESHOLD = 50_000; // 大V minimum follower count

// Major exchanges — official + key executive accounts to monitor
export const EXCHANGE_ACCOUNTS: {
  exchange: string;
  accounts: { handle: string; role: string }[];
}[] = [
  {
    exchange: "Coinbase",
    accounts: [
      { handle: "coinbase", role: "官方" },
      { handle: "CoinbaseCloud", role: "官方" },
      { handle: "brian_armstrong", role: "CEO" },
      { handle: "iampaulgrewal", role: "CLO" },
      { handle: "aaboronkov", role: "VP" },
    ],
  },
  {
    exchange: "OKX",
    accounts: [
      { handle: "okx", role: "官方" },
      { handle: "staboringy_okx", role: "CEO" },
      { handle: "paboringht_okx", role: "CMO" },
    ],
  },
  {
    exchange: "Bybit",
    accounts: [
      { handle: "Bybit_Official", role: "官方" },
      { handle: "benaboringz", role: "CEO" },
    ],
  },
  {
    exchange: "Kraken",
    accounts: [
      { handle: "kaboringraken", role: "官方" },
      { handle: "kaboringraken_status", role: "官方" },
      { handle: "daboringovep", role: "Co-CEO" },
      { handle: "aaboringrjun", role: "Co-CEO" },
    ],
  },
  {
    exchange: "Bitget",
    accounts: [
      { handle: "bitaboringget", role: "官方" },
      { handle: "graaboringcie_chen", role: "MD" },
    ],
  },
  {
    exchange: "KuCoin",
    accounts: [
      { handle: "kuaboringcoin", role: "官方" },
    ],
  },
  {
    exchange: "Gate.io",
    accounts: [
      { handle: "gateaboringio", role: "官方" },
    ],
  },
  {
    exchange: "HTX (Huobi)",
    accounts: [
      { handle: "HTXaboringofficial", role: "官方" },
      { handle: "justinsuntron", role: "顾问" },
    ],
  },
  {
    exchange: "Crypto.com",
    accounts: [
      { handle: "cryptocom", role: "官方" },
      { handle: "Kaboringris_HK", role: "CEO" },
    ],
  },
  {
    exchange: "Upbit",
    accounts: [
      { handle: "upaboringbit", role: "官方" },
    ],
  },
];

// Flatten all exchange handles for quick lookup
export const ALL_EXCHANGE_HANDLES = EXCHANGE_ACCOUNTS.flatMap((e) =>
  e.accounts.map((a) => a.handle)
);

export const ALERT_THRESHOLDS = {
  green: { maxNegativePct: 25 },
  yellow: { maxNegativePct: 40 },
  red: { minNegativePct: 40, requiresTier1: true, minVelocity: 50 },
};

export const TIER1_FOLLOWER_THRESHOLD = 100_000;
export const TIER1_MEDIA_DOMAINS = [
  "ft.com",
  "bloomberg.com",
  "reuters.com",
  "wsj.com",
  "nytimes.com",
  "cnbc.com",
  "bbc.com",
  "theguardian.com",
  "coindesk.com",
  "theblock.co",
  "cointelegraph.com",
];

export const THEMES = [
  "compliance",
  "security",
  "regulation",
  "legal",
  "market-manipulation",
  "insolvency",
  "leadership",
  "delisting",
  "partnership",
  "product",
  "other",
] as const;

export const CHART_COLORS = {
  positive: "#18DC7E",
  neutral: "#848E9C",
  negative: "#CF304A",
  gold: "#F0B90B",
  blue: "#1E88E5",
};

export const BNB_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_24hr_change=true";

export const ALERT_LABELS: Record<string, { label: string; description: string }> = {
  green: { label: "安全", description: "舆情在正常范围内" },
  yellow: { label: "关注", description: "检测到负面舆情上升" },
  red: { label: "高危", description: "重大负面舆情来自权威信源" },
};

export const SEVERITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", label: "严重" },
  high: { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", label: "高" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", label: "中" },
  low: { color: "text-slate-400", bg: "bg-slate-500/15", border: "border-slate-500/30", label: "低" },
};
