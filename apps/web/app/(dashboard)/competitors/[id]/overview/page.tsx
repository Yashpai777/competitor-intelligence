'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { companiesApi } from '@/lib/api';
import { KpiCards } from '@/components/competitors/kpi-cards';
import { CompanyTimeline } from '@/components/competitors/company-timeline';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRelativeDate, getThreatColor, getThreatLabel } from '@/lib/utils';

export default function OverviewPage() {
  const { id: slug } = useParams<{ id: string }>();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => companiesApi.getOne(slug),
  });

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['company-kpis', slug],
    queryFn: () => companiesApi.getKpis(slug),
  });

  if (companyLoading || kpisLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <KpiCards kpis={kpis} companyName={company?.name} />

      {/* Company details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Company Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Website', value: company?.website, isLink: true },
              { label: 'Industry', value: company?.industry },
              { label: 'Founded', value: company?.foundedYear?.toString() },
              { label: 'Headquarters', value: company?.headquarters },
              { label: 'Team Size', value: company?.employeeCount },
              { label: 'Last Updated', value: company ? formatRelativeDate(company.updatedAt) : '' },
            ].map(({ label, value, isLink }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
                {isLink && value ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-sm text-foreground">{value || '—'}</span>
                )}
              </div>
            ))}
          </div>

          {company?.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </span>
              <p className="text-sm text-foreground mt-1 leading-relaxed">
                {company.description}
              </p>
            </div>
          )}
        </div>

        {/* Threat Score */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Competitive Threat Score
          </h2>
          <div className="flex flex-col items-center justify-center h-32">
            <div className={`text-6xl font-black ${getThreatColor(kpis?.threatScore || 0)}`}>
              {kpis?.threatScore || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">out of 100</div>
            <div
              className={`mt-3 text-sm font-medium px-3 py-1 rounded-full ${
                kpis?.threatScore >= 80
                  ? 'bg-red-500/10 text-red-400'
                  : kpis?.threatScore >= 60
                  ? 'bg-orange-500/10 text-orange-400'
                  : kpis?.threatScore >= 40
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-green-500/10 text-green-400'
              }`}
            >
              {getThreatLabel(kpis?.threatScore || 0)} Threat
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  kpis?.threatScore >= 80
                    ? 'bg-red-500'
                    : kpis?.threatScore >= 60
                    ? 'bg-orange-500'
                    : kpis?.threatScore >= 40
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${kpis?.threatScore || 0}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Based on growth, engagement, product velocity &amp; partnerships
          </p>
        </div>
      </div>

      {/* Timeline chart */}
      <CompanyTimeline slug={slug} />

      {/* Activity counts */}
      {company?._count && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            All-time Activity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'LinkedIn Posts', value: company._count.linkedinPosts, icon: '💼' },
              { label: 'News Articles', value: company._count.newsArticles, icon: '📰' },
              { label: 'Customers', value: company._count.customers, icon: '🏢' },
              { label: 'Partnerships', value: company._count.partnerships, icon: '🤝' },
              { label: 'Website Changes', value: company._count.websiteChanges, icon: '🌐' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
