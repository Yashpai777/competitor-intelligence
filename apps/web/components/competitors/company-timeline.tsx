'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { companiesApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export function CompanyTimeline({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['timeline', slug],
    queryFn: () => companiesApi.getTimeline(slug),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  const chartData = data?.map((d: any) => ({
    ...d,
    week: new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Activity Timeline (4 weeks)</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }} />
            <Bar yAxisId="left" dataKey="linkedinPosts" fill="#3b82f6" name="LinkedIn Posts" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="left" dataKey="newsArticles" fill="#8b5cf6" name="News Articles" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="left" dataKey="websiteChanges" fill="#10b981" name="Website Changes" radius={[3, 3, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="linkedinEngagement"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
              name="Engagement"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
