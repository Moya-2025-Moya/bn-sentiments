"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/shared/Card";
import { Save, Plus, X, Info } from "lucide-react";

interface Settings {
  keywords: string[];
  competitorKeywords: string[];
  alertThresholds: {
    greenMax: number;
    yellowMax: number;
    tier1Followers: number;
  };
  competitor: string;
}

const DEFAULT_SETTINGS: Settings = {
  keywords: ["binance", "BNB", "@binance", "#binance"],
  competitorKeywords: ["coinbase", "@coinbase"],
  alertThresholds: {
    greenMax: 25,
    yellowMax: 40,
    tier1Followers: 100000,
  },
  competitor: "Coinbase",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("bn-sentiment-settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  function save() {
    localStorage.setItem("bn-sentiment-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addKeyword() {
    if (newKeyword.trim() && !settings.keywords.includes(newKeyword.trim())) {
      setSettings({
        ...settings,
        keywords: [...settings.keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  }

  function removeKeyword(kw: string) {
    setSettings({
      ...settings,
      keywords: settings.keywords.filter((k) => k !== kw),
    });
  }

  return (
    <>
      <Header title="设置" subtitle="配置监控参数" />

      <div className="max-w-2xl space-y-5">
        {/* Keywords */}
        <Card title="监控关键词">
          <div className="flex flex-wrap gap-2 mb-3">
            {settings.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg-base text-sm text-text-primary border border-border-default"
              >
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="text-text-tertiary hover:text-negative transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="添加关键词..."
              className="flex-1 px-3 py-2 rounded-lg bg-bg-base border border-border-default text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50"
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm hover:bg-gold/20 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        </Card>

        {/* Alert Thresholds */}
        <Card title="预警阈值">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-positive" />
                安全 → 关注 阈值（负面 %）
              </label>
              <input
                type="range"
                min={10}
                max={50}
                value={settings.alertThresholds.greenMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    alertThresholds: {
                      ...settings.alertThresholds,
                      greenMax: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-gold"
              />
              <span className="text-xs text-text-tertiary">
                {settings.alertThresholds.greenMax}%
              </span>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold" />
                关注 → 高危 阈值（负面 %）
              </label>
              <input
                type="range"
                min={20}
                max={70}
                value={settings.alertThresholds.yellowMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    alertThresholds: {
                      ...settings.alertThresholds,
                      yellowMax: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-gold"
              />
              <span className="text-xs text-text-tertiary">
                {settings.alertThresholds.yellowMax}%
              </span>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <Info size={12} />
                一级信源粉丝门槛
              </label>
              <input
                type="number"
                value={settings.alertThresholds.tier1Followers}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    alertThresholds: {
                      ...settings.alertThresholds,
                      tier1Followers: parseInt(e.target.value) || 100000,
                    },
                  })
                }
                className="px-3 py-2 rounded-lg bg-bg-base border border-border-default text-sm text-text-primary focus:outline-none focus:border-gold/50 w-40"
              />
            </div>
          </div>
        </Card>

        {/* Competitor */}
        <Card title="竞对追踪">
          <label className="text-sm text-text-secondary mb-2 block">
            主要对比竞对
          </label>
          <input
            type="text"
            value={settings.competitor}
            onChange={(e) =>
              setSettings({ ...settings, competitor: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-bg-base border border-border-default text-sm text-text-primary focus:outline-none focus:border-gold/50 w-60"
          />
        </Card>

        {/* Deployment Info */}
        <Card title="部署信息">
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              <span className="text-text-tertiary">定时任务：</span>每 30 分钟
            </p>
            <p>
              <span className="text-text-tertiary">AI 引擎：</span>Grok (xAI)
            </p>
            <p>
              <span className="text-text-tertiary">数据库：</span>Supabase
            </p>
            <p>
              <span className="text-text-tertiary">托管平台：</span>Vercel
            </p>
          </div>
        </Card>

        {/* Save */}
        <button
          onClick={save}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold text-bg-darkest font-medium text-sm hover:bg-gold-hover transition-all"
        >
          <Save size={14} />
          {saved ? "已保存！" : "保存设置"}
        </button>
      </div>
    </>
  );
}
