'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { linkedinApi } from '@/lib/api';
import { formatDate, formatNumber, getCategoryColor, cn } from '@/lib/utils';
import { ExternalLink, Heart, MessageCircle, Share2, Flame, ChevronDown, ChevronUp } from 'lucide-react';

export function LinkedInPostsTable({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['linkedin-posts', slug, page],
    queryFn: () => linkedinApi.getPosts(slug, { page, limit: 10 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
        No LinkedIn posts found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-border bg-secondary/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Post</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Likes</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Comments</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shares</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score</span>
        </div>

        {data.data.map((post: any) => (
          <div key={post.id} className="border-b border-border last:border-0">
            <div
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer items-start"
              onClick={() => setExpanded(expanded === post.id ? null : post.id)}
            >
              {/* Post preview */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.isViral && (
                    <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20">
                      <Flame className="w-2.5 h-2.5" />
                      Viral
                    </span>
                  )}
                  {post.topicCategory && (
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded border capitalize', getCategoryColor(post.topicCategory))}>
                      {post.topicCategory}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Date */}
              <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                {formatDate(post.publishedAt, 'MMM d')}
              </span>

              {/* Likes */}
              <div className="flex items-center gap-1 text-sm pt-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span className="text-foreground font-medium">{formatNumber(post.likes)}</span>
              </div>

              {/* Comments */}
              <div className="flex items-center gap-1 text-sm pt-1">
                <MessageCircle className="w-3 h-3 text-blue-400" />
                <span className="text-foreground font-medium">{formatNumber(post.comments)}</span>
              </div>

              {/* Shares */}
              <div className="flex items-center gap-1 text-sm pt-1">
                <Share2 className="w-3 h-3 text-green-400" />
                <span className="text-foreground font-medium">{formatNumber(post.shares)}</span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1 pt-1">
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  post.engagementScore >= 500
                    ? 'bg-green-500/10 text-green-400'
                    : post.engagementScore >= 200
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-secondary text-muted-foreground'
                )}>
                  {Math.round(post.engagementScore)}
                </span>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === post.id && (
              <div className="px-4 pb-4 bg-secondary/20 border-t border-border">
                <div className="pt-3 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">{post.content}</p>

                  {post.aiPerformanceReason && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs font-medium text-primary mb-1">Why it performed well</p>
                      <p className="text-xs text-muted-foreground">{post.aiPerformanceReason}</p>
                    </div>
                  )}

                  {post.postUrl && (
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.meta.pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">
            {data.meta.total} posts total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-secondary text-sm rounded-lg disabled:opacity-50 hover:bg-secondary/80 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-muted-foreground">
              {page} / {data.meta.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))}
              disabled={page === data.meta.pages}
              className="px-3 py-1.5 bg-secondary text-sm rounded-lg disabled:opacity-50 hover:bg-secondary/80 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
