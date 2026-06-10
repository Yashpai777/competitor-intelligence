'use client';

import { Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function ExecutiveSummaryCard({ report }: { report: any }) {
  if (!report) {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Weekly Executive Summary</span>
        </div>
        <p className="text-sm text-muted-foreground">
          No report available yet. Generate one from the Reports page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border border-primary/20 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">Weekly Executive Summary</span>
              <span className="text-xs text-muted-foreground">
                Week of {formatDate(report.weekStart, 'MMM d')} –{' '}
                {formatDate(report.weekEnd, 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {report.executiveSummary || 'Generating summary...'}
            </p>
          </div>
        </div>
      </div>

      {report.strategicInsights && (
        <div className="mt-4 pt-4 border-t border-primary/10">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Strategic Insights
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.strategicInsights}
          </p>
        </div>
      )}
    </div>
  );
}
