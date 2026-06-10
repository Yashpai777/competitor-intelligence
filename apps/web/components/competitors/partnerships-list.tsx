'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api';
import { formatRelativeDate } from '@/lib/utils';
import { ExternalLink, Handshake } from 'lucide-react';

export function PartnershipsList({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['partnerships', slug, page],
    queryFn: () => customersApi.getPartnerships(slug, { page, limit: 15 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
        <p>No partnerships detected yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.data.map((p: any) => (
          <div
            key={p.id}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                {p.partnerName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground">{p.partnerName}</h4>
                  {p.type && (
                    <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded capitalize">
                      {p.type}
                    </span>
                  )}
                  {p.sourceUrl && (
                    <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                    </a>
                  )}
                </div>
                {p.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground capitalize">
                    via {p.source}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(p.detectedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.meta.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">{data.meta.total} partnerships</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-secondary text-sm rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
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
