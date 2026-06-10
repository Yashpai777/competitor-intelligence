'use client';

import { useQuery } from '@tanstack/react-query';
import { linkedinApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryColor, cn } from '@/lib/utils';

export function LinkedInTrendsCard({ slug }: { slug: string }) {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['linkedin-trends', slug],
    queryFn: () => linkedinApi.getTrends(slug),
  });

  if (isLoading) {
    return <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Topic Frequency (30 days)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="topic"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" name="Posts" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Topic Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {trends?.map((t: any) => (
            <div
              key={t.topic}
              className={cn('p-3 rounded-lg border capitalize', getCategoryColor(t.topic))}
            >
              <div className="text-lg font-bold">{t.count}</div>
              <div className="text-xs mt-0.5 opacity-80">{t.topic}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
