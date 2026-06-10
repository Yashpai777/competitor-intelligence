'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { linkedinApi } from '@/lib/api';
import { LinkedInSummaryCard } from '@/components/competitors/linkedin-summary';
import { LinkedInPostsTable } from '@/components/competitors/linkedin-posts-table';
import { LinkedInTopPosts } from '@/components/competitors/linkedin-top-posts';
import { LinkedInTrendsCard } from '@/components/competitors/linkedin-trends';
import { LinkedInEngagementChart } from '@/components/charts/linkedin-engagement-chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function LinkedInPage() {
  const { id: slug } = useParams<{ id: string }>();
  const [activeView, setActiveView] = useState<'all' | 'top' | 'trends'>('all');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['linkedin-summary', slug],
    queryFn: () => linkedinApi.getWeeklySummary(slug),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Weekly Summary */}
      {summaryLoading ? (
        <Skeleton className="h-32" />
      ) : (
        <LinkedInSummaryCard summary={summary} />
      )}

      {/* Engagement Chart */}
      <LinkedInEngagementChart slug={slug} />

      {/* View toggle */}
      <div className="flex gap-2">
        {(['all', 'top', 'trends'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeView === view
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {view === 'all' ? 'All Posts' : view === 'top' ? 'Top Posts' : 'Trends'}
          </button>
        ))}
      </div>

      {/* Content based on view */}
      {activeView === 'all' && <LinkedInPostsTable slug={slug} />}
      {activeView === 'top' && <LinkedInTopPosts slug={slug} />}
      {activeView === 'trends' && <LinkedInTrendsCard slug={slug} />}
    </div>
  );
}
