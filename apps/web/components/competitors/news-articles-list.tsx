'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '@/lib/api';
import { formatDate, getCategoryColor, getImportanceColor, cn } from '@/lib/utils';
import { ExternalLink, TrendingUp } from 'lucide-react';

export function NewsArticlesList({ slug, category }: { slug: string; category?: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['news-articles', slug, page, category],
    queryFn: () => newsApi.getArticles(slug, { page, limit: 15, category }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
        No news articles found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.data.map((article: any) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              {/* Source icon */}
              <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground overflow-hidden">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt="" className="w-10 h-10 object-cover" />
                ) : (
                  article.source.substring(0, 2).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded border font-medium capitalize',
                        getCategoryColor(article.category),
                      )}
                    >
                      {article.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">{article.source}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('text-xs font-medium', getImportanceColor(article.importance))}>
                      {article.importance >= 80 ? '🔥' : article.importance >= 60 ? '⚡' : ''} {article.importance}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-1.5">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(article.publishedAt)}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {data.meta.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">{data.meta.total} articles</span>
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
