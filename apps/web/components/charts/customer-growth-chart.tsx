'use client';

import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function CustomerGrowthChart({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-growth', slug],
    queryFn: () => customersApi.getGrowthChart(slug),
  });

  if (isLoading) return <Skeleton className="h-56" />;

  const chartData = data?.map((d: any) => ({
    ...d,
    week: new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Customer &amp; Partnership Growth (12 weeks)
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="gradCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPartnerships" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
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
            <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }} />
            <Area type="monotone" dataKey="newCustomers" stroke="#10b981" fill="url(#gradCustomers)" strokeWidth={2} name="New Customers" />
            <Area type="monotone" dataKey="newPartnerships" stroke="#3b82f6" fill="url(#gradPartnerships)" strokeWidth={2} name="New Partnerships" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
