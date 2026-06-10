'use client';

import { Sparkles, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export function LinkedInSummaryCard({ summary }: { summary: any }) {
  if (!summary) return null;

  const topics = Object.entries(summary.topicBreakdown || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-1">Weekly LinkedIn Summary</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.aiSummary || 'No activity this week.'}
          </p>
        </div>
      </div>

      {summary.postCount > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-500/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Posts" value={summary.postCount} />
          <Metric label="Total Engagement" value={formatNumber(summary.totalEngagement)} />
          <Metric label="Avg Engagement" value={formatNumber(summary.avgEngagement)} />
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Top Topics</p>
            <div className="flex flex-wrap gap-1">
              {topics.slice(0, 3).map(([topic]) => (
                <span
                  key={topic}
                  className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded capitalize"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  );
}
