'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { websiteApi } from '@/lib/api';
import { formatRelativeDate, getImportanceColor, cn } from '@/lib/utils';
import { ExternalLink, ChevronDown } from 'lucide-react';

export function WebsiteChangesTable({ slug, pageFilter }: { slug: string; pageFilter?: string }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['website-changes', slug, page, pageFilter],
    queryFn: () => websiteApi.getChanges(slug, { page, limit: 15, pageType: pageFilter }),
  });

  const getChangeTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      addition: 'bg-green-500/10 text-green-400 border-green-500/20',
      removal: 'bg-red-500/10 text-red-400 border-red-500/20',
      modification: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      new_page: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      price_change: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return styles[type] || 'bg-secondary text-muted-foreground border-border';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">No website changes detected yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {data.data.map((change: any) => (
          <div key={change.id} className="border-b border-border last:border-0">
            <div
              className="flex items-start gap-4 px-4 py-4 hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => setExpanded(expanded === change.id ? null : change.id)}
            >
              {/* Importance score */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <span className={cn('text-sm font-bold', getImportanceColor(change.importance))}>
                  {change.importance}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded border font-medium capitalize',
                      getChangeTypeBadge(change.changeType),
                    )}
                  >
                    {change.changeType.replace('_', ' ')}
                  </span>
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded capitalize">
                    {change.pageType}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatRelativeDate(change.detectedAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  {change.diffSummary || change.aiSummary || 'Content changed'}
                </p>
              </div>

              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform',
                  expanded === change.id ? 'rotate-180' : '',
                )}
              />
            </div>

            {/* Expanded diff */}
            {expanded === change.id && (
              <div className="px-4 pb-4 bg-secondary/20 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {change.beforeContent && (
                    <div>
                      <p className="text-xs font-medium text-red-400 mb-2">Removed</p>
                      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 text-xs text-foreground font-mono whitespace-pre-wrap">
                        {change.beforeContent}
                      </div>
                    </div>
                  )}
                  {change.afterContent && (
                    <div>
                      <p className="text-xs font-medium text-green-400 mb-2">Added</p>
                      <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3 text-xs text-foreground font-mono whitespace-pre-wrap">
                        {change.afterContent}
                      </div>
                    </div>
                  )}
                </div>
                {change.aiSummary && (
                  <div className="mt-3 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-medium">AI Analysis: </span>
                      {change.aiSummary}
                    </p>
                  </div>
                )}
                {change.url && (
                  <a
                    href={change.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View page
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.meta.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">{data.meta.total} changes total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-secondary text-sm rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-muted-foreground">
              {page} / {data.meta.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.meta.pages, p + 1))}
              disabled={page === data.meta.pages}
              className="px-3 py-1.5 bg-secondary text-sm rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
    </svg>
  );
}
