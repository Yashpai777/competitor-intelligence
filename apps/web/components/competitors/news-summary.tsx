'use client';

import { Sparkles } from 'lucide-react';
import { getCategoryColor, cn } from '@/lib/utils';

export function NewsSummaryCard({ summary }: { summary: any }) {
  if (!summary) return null;

  const categories = Object.entries(summary.categoryBreakdown || {})
    .sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-1">Weekly News Summary</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.aiSummary}
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-500/10 flex flex-wrap gap-2">
          {categories.map(([cat, count]) => (
            <span
              key={cat}
              className={cn(
                'text-xs px-2.5 py-1 rounded border font-medium capitalize',
                getCategoryColor(cat),
              )}
            >
              {cat.replace('_', ' ')} ({count as number})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
