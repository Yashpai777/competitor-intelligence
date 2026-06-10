'use client';

import { Globe, Sparkles } from 'lucide-react';

export function WebsiteSummaryCard({ summary }: { summary: any }) {
  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-1">Website Changes Summary</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.aiSummary}
          </p>
        </div>
      </div>

      {summary.changeCount > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-500/10 flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Changes</p>
            <p className="text-base font-bold text-foreground">{summary.changeCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">High Importance</p>
            <p className="text-base font-bold text-orange-400">{summary.highImportanceCount}</p>
          </div>
          {Object.entries(summary.changesByPage || {}).map(([page, count]) => (
            <div key={page}>
              <p className="text-xs text-muted-foreground capitalize">{page}</p>
              <p className="text-base font-bold text-foreground">{count as number}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
