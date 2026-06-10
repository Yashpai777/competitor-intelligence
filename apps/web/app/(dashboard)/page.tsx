'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, companiesApi } from '@/lib/api';
import { ExecutiveSummaryCard } from '@/components/dashboard/executive-summary';
import { CompetitorGrid } from '@/components/dashboard/competitor-grid';
import { GlobalAnalyticsCharts } from '@/components/dashboard/global-analytics-charts';
import { RecentAlerts } from '@/components/dashboard/recent-alerts';
import { ThreatRadar } from '@/components/dashboard/threat-radar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['weekly-report'],
    queryFn: reportsApi.getLatestGlobal,
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Intelligence Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitoring {companies?.length || 9} AI Voice Agent competitors across LinkedIn, web, news &amp; social.
        </p>
      </div>

      {/* Executive Summary */}
      {reportLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <ExecutiveSummaryCard report={report} />
      )}

      {/* Global metrics grid */}
      {reportLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <GlobalMetricsRow report={report} />
      )}

      {/* Two column: Charts + Threat Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <GlobalAnalyticsCharts companies={companies || []} />
        </div>
        <div>
          <ThreatRadar companies={companies || []} />
        </div>
      </div>

      {/* Competitor Cards Grid */}
      {companiesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : (
        <CompetitorGrid companies={companies || []} />
      )}

      {/* Recent Alerts */}
      <RecentAlerts />
    </div>
  );
}

function GlobalMetricsRow({ report }: { report: any }) {
  if (!report) return null;

  const metrics = [
    {
      label: 'LinkedIn Posts',
      value: report.linkedinPostCount,
      icon: '📊',
      change: '+12%',
      up: true,
    },
    {
      label: 'Website Changes',
      value: report.websiteChanges,
      icon: '🌐',
      change: '+5%',
      up: true,
    },
    {
      label: 'News Articles',
      value: report.newsArticles,
      icon: '📰',
      change: '-3%',
      up: false,
    },
    {
      label: 'New Customers',
      value: report.newCustomers,
      icon: '🤝',
      change: '+28%',
      up: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl">{m.icon}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                m.up
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {m.change} this week
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">{m.value}</div>
          <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
