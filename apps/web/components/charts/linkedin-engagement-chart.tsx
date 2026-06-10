'use client';

import { useQuery } from '@tanstack/react-query';
import { linkedinApi } from '@/lib/api';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function LinkedInEngagementChart({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['linkedin-engagement-chart', slug],
    queryFn: () => linkedinApi.getEngagementChart(slug),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  const chartData = data?.map((d: any) => ({
    ...d,
    week: new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Engagement Over Time (8 weeks)</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
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
            <Bar yAxisId="left" dataKey="posts" fill="#3b82f6" name="Posts" radius={[3,3,0,0]} />
            <Bar yAxisId="left" dataKey="likes" fill="#8b5cf6" name="Likes" radius={[3,3,0,0]} />
            <Bar yAxisId="left" dataKey="comments" fill="#10b981" name="Comments" radius={[3,3,0,0]} />
            <Line yAxisId="right" type="monotone" dataKey="totalEngagement" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Total Engagement" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
