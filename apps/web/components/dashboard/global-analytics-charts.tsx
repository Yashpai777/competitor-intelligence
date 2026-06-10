'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { companiesApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export function GlobalAnalyticsCharts({ companies }: { companies: any[] }) {
  const topCompanies = companies.slice(0, 4);

  const queries = topCompanies.map((c) =>
    useQuery({
      queryKey: ['timeline', c.slug],
      queryFn: () => companiesApi.getTimeline(c.slug),
      staleTime: 5 * 60 * 1000,
    })
  );

  const isLoading = queries.some((q) => q.isLoading);

  if (isLoading) {
    return <Skeleton className="h-72" />;
  }

  // Merge weekly data across companies
  const weekMap: Record<string, Record<string, number>> = {};
  queries.forEach((query, idx) => {
    const company = topCompanies[idx];
    if (!query.data) return;
    query.data.forEach((week: any) => {
      if (!weekMap[week.week]) weekMap[week.week] = { week: week.week as any };
      weekMap[week.week][company.name] = week.linkedinEngagement;
    });
  });

  const chartData = Object.values(weekMap).sort((a, b) =>
    (a.week as any) > (b.week as any) ? 1 : -1
  );

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">
        LinkedIn Engagement Comparison
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              {topCompanies.map((c, i) => (
                <linearGradient key={c.slug} id={`grad-${c.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
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
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
            />
            {topCompanies.map((c, i) => (
              <Area
                key={c.slug}
                type="monotone"
                dataKey={c.name}
                stroke={COLORS[i]}
                fill={`url(#grad-${c.slug})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
