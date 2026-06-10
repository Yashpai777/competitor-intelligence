'use client';

import { useQuery } from '@tanstack/react-query';
import { linkedinApi } from '@/lib/api';
import { formatDate, formatNumber, getCategoryColor, cn } from '@/lib/utils';
import { Heart, MessageCircle, Share2, Flame, Trophy } from 'lucide-react';

export function LinkedInTopPosts({ slug }: { slug: string }) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['linkedin-top-posts', slug],
    queryFn: () => linkedinApi.getTopPosts(slug, 5),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-36 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-foreground">Top Performing Posts</h3>
      </div>

      {posts?.map((post: any, i: number) => (
        <div
          key={post.id}
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Rank */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
              i === 0 ? 'bg-yellow-400/20 text-yellow-400' :
              i === 1 ? 'bg-gray-400/20 text-gray-400' :
              i === 2 ? 'bg-orange-600/20 text-orange-600' :
              'bg-secondary text-muted-foreground'
            )}>
              #{i + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {post.isViral && (
                  <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">
                    <Flame className="w-3 h-3" />
                    Viral
                  </span>
                )}
                {post.topicCategory && (
                  <span className={cn('text-xs px-2 py-0.5 rounded border capitalize', getCategoryColor(post.topicCategory))}>
                    {post.topicCategory}
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>

              {/* Metrics */}
              <div className="flex items-center gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-sm">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-medium text-foreground">{formatNumber(post.likes)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium text-foreground">{formatNumber(post.comments)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <Share2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="font-medium text-foreground">{formatNumber(post.shares)}</span>
                </span>
                <span className="ml-auto text-xs font-bold text-primary">
                  Score: {Math.round(post.engagementScore)}
                </span>
              </div>

              {/* AI analysis */}
              {post.aiPerformanceReason && (
                <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-primary font-medium">Why it performed well: </span>
                    {post.aiPerformanceReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
