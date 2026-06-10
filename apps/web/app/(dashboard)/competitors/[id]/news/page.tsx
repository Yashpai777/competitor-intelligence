'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { newsApi } from '@/lib/api';
import { NewsSummaryCard } from '@/components/competitors/news-summary';
import { NewsArticlesList } from '@/components/competitors/news-articles-list';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { value: 'all', label: 'All News' },
  { value: 'funding', label: '💰 Funding' },
  { value: 'partnership', label: '🤝 Partnerships' },
  { value: 'product_launch', label: '🚀 Product' },
  { value: 'customer', label: '🏢 Customers' },
  { value: 'hiring', label: '👥 Hiring' },
  { value: 'acquisition', label: '🔄 Acquisitions' },
  { value: 'award', label: '🏆 Awards' },
];

export default function NewsPage() {
  const { id: slug } = useParams<{ id: string }>();
  const [category, setCategory] = useState('all');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['news-summary', slug],
    queryFn: () => newsApi.getWeeklySummary(slug),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {isLoading ? <Skeleton className="h-28" /> : <NewsSummaryCard summary={summary} />}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <NewsArticlesList
        slug={slug}
        category={category === 'all' ? undefined : category}
      />
    </div>
  );
}
