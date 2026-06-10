'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { WebsiteSummaryCard } from '@/components/competitors/website-summary';
import { WebsiteChangesTable } from '@/components/competitors/website-changes-table';
import { WebsiteChangeVolumeChart } from '@/components/charts/website-change-chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function WebsitePage() {
  const { id: slug } = useParams<{ id: string }>();
  const [pageFilter, setPageFilter] = useState<string>('all');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['website-summary', slug],
    queryFn: () => websiteApi.getWeeklySummary(slug),
  });

  const pageTypes = ['all', 'homepage', 'pricing', 'product', 'integrations', 'blog', 'docs'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Summary */}
      {summaryLoading ? (
        <Skeleton className="h-28" />
      ) : (
        <WebsiteSummaryCard summary={summary} />
      )}

      {/* Change Volume Chart */}
      <WebsiteChangeVolumeChart slug={slug} />

      {/* Page filter */}
      <div className="flex flex-wrap gap-2">
        {pageTypes.map((pt) => (
          <button
            key={pt}
            onClick={() => setPageFilter(pt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              pageFilter === pt
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {pt}
          </button>
        ))}
      </div>

      {/* Changes Table */}
      <WebsiteChangesTable slug={slug} pageFilter={pageFilter === 'all' ? undefined : pageFilter} />
    </div>
  );
}
