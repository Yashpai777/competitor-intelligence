'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api';
import { formatRelativeDate, cn } from '@/lib/utils';
import { ExternalLink, Building2 } from 'lucide-react';

export function CustomersList({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', slug, page],
    queryFn: () => customersApi.getCustomers(slug, { page, limit: 15 }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">No customers detected yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Customers are detected from website logos, case studies, and social mentions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.data.map((customer: any) => (
          <div
            key={customer.id}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              {customer.logoUrl ? (
                <img
                  src={customer.logoUrl}
                  alt={customer.customerName}
                  className="w-10 h-10 rounded-lg object-contain bg-white p-1 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {customer.customerName.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {customer.customerName}
                  </h4>
                  {customer.sourceUrl && (
                    <a href={customer.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary flex-shrink-0" />
                    </a>
                  )}
                </div>
                {customer.industry && (
                  <p className="text-xs text-muted-foreground">{customer.industry}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground capitalize">
                    {customer.source}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeDate(customer.detectedAt)}
                  </span>
                </div>
              </div>
            </div>

            {customer.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {customer.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {data.meta.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">{data.meta.total} customers</span>
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
