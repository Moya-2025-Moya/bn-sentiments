"use client";

import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/shared/Card";
import { SentimentDonut } from "@/components/dashboard/SentimentDonut";
import { GeoBreakdown } from "@/components/dashboard/GeoBreakdown";
import { DEMO_SNAPSHOT } from "@/lib/demo-data";
import { formatNumber } from "@/lib/utils";
import { FileText, Calendar, Download } from "lucide-react";

const DEMO_REPORT = {
  title: "舆情监控报告 - FT 回应 (12月25日)",
  poc: "Max M",
  timeRange: "12月21日 - 12月25日 UTC",
  keywords: "binance AND FT",
  totalMentions: 787,
  totalImpressions: 86000,
  uniqueAuthors: 548,
  sentiment: { positive: 2, neutral: 76, negative: 22 },
  themes: [
    {
      title: "可疑交易持续存在",
      description:
        "英国《金融时报》调查发现，尽管Binance承诺在2023年认罪协议后加强合规，但多个被标记为可疑活动的账户仍在处理大额交易。其中一个委内瑞拉账户据报转移了9300万美元，资金被追踪至被指控资助恐怖主义的网络。",
    },
    {
      title: "监管审查加剧",
      description:
        "Binance的持续合规问题在FT报道后受到审查。调查揭示，即使在与美国当局达成里程碑式和解后，该交易所仍允许高风险账户自由运作。13个账户处理了大量加密货币交易。",
    },
    {
      title: "要求问责",
      description:
        "FT报告了令人震惊的发现：Binance在认罪协议后对可疑账户的处理方式表明，该交易所未能有效遏制非法金融活动。与恐怖主义和其他非法活动相关的账户继续处理交易。",
    },
    {
      title: "合规措施争论",
      description:
        "尽管与美国当局达成了43亿美元的和解协议，该交易所仍允许被标记为可疑活动的账户继续运作，引发了对Binance合规措施充分性以及对加密货币市场影响的讨论。",
    },
  ],
  countries: DEMO_SNAPSHOT.top_countries,
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(0);

  return (
    <>
      <Header
        title="报告"
        subtitle="历史舆情报告与分析"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Report List */}
        <div className="lg:col-span-1 space-y-2">
          <Card className="!p-3">
            <button
              onClick={() => setSelectedReport(0)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                selectedReport === 0
                  ? "bg-gold/10 border border-gold/30"
                  : "hover:bg-bg-card-hover border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} className="text-gold" />
                <span className="text-xs text-text-primary font-medium">
                  FT 回应 - 12月25日
                </span>
              </div>
              <div className="flex items-center gap-1 text-text-tertiary">
                <Calendar size={10} />
                <span className="text-[10px]">12月21日 - 12月25日</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedReport(1)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                selectedReport === 1
                  ? "bg-gold/10 border border-gold/30"
                  : "hover:bg-bg-card-hover border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} className="text-text-tertiary" />
                <span className="text-xs text-text-primary font-medium">
                  FT 回应 - 12月23日
                </span>
              </div>
              <div className="flex items-center gap-1 text-text-tertiary">
                <Calendar size={10} />
                <span className="text-[10px]">12月21日 - 12月23日</span>
              </div>
            </button>
          </Card>
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-display font-bold text-text-primary">
                  {DEMO_REPORT.title}
                </h2>
                <p className="text-xs text-text-tertiary mt-1">
                  负责人：{DEMO_REPORT.poc} | 时间范围：{DEMO_REPORT.timeRange}{" "}
                  | 关键词：{DEMO_REPORT.keywords}
                </p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-base text-text-secondary text-xs hover:bg-bg-card-hover transition-all">
                <Download size={12} />
                导出
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-text-tertiary">总提及量</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatNumber(DEMO_REPORT.totalMentions)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">总曝光量</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatNumber(DEMO_REPORT.totalImpressions)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">独立作者</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatNumber(DEMO_REPORT.uniqueAuthors)}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SentimentDonut
              positive={DEMO_REPORT.sentiment.positive}
              neutral={DEMO_REPORT.sentiment.neutral}
              negative={DEMO_REPORT.sentiment.negative}
            />
            <GeoBreakdown data={DEMO_REPORT.countries} />
          </div>

          <Card title="核心主题">
            <div className="space-y-4">
              {DEMO_REPORT.themes.map((theme, i) => (
                <div
                  key={i}
                  className="border-b border-border-subtle last:border-0 pb-4 last:pb-0"
                >
                  <h4 className="text-sm font-semibold text-text-primary mb-1.5">
                    {theme.title}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
