'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { companiesApi, scrapingApi } from '@/lib/api';
import { cn, getThreatBg, getCompanyInitials, getCompanyLogoUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Globe, Linkedin, Twitter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'website', label: 'Website', icon: '🌐' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'customers', label: 'Customers', icon: '🤝' },
  { id: 'battlecard', label: 'Battlecard', icon: '⚔️' },
];

export default function CompetitorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.id as string;

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => companiesApi.getOne(slug),
  });

  const activeTab = TABS.find((t) => pathname.includes(t.id))?.id || 'overview';
  const qc = useQueryClient();

  const { mutate: scrapeAll, isPending: scraping } = useMutation({
    mutationFn: () => scrapingApi.triggerAll(slug),
    onSuccess: (data) => {
      toast.success(`Scrape queued for ${data.company} — LinkedIn, website & news jobs started`);
    },
    onError: () => toast.error('Failed to queue scrape jobs'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!company) return <div>Competitor not found</div>;

  const logoUrl = getCompanyLogoUrl(company.name, company.website);

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Company header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-2">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center border border-border overflow-hidden flex-shrink-0">
            <img
              src={logoUrl}
              alt={company.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-lg font-bold text-foreground hidden">
              {getCompanyInitials(company.name)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{company.name}</h1>
              {company.threatScore !== undefined && (
                <span
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full border',
                    getThreatBg(company.threatScore),
                  )}
                >
                  {company.threatScore}/100 Threat
                </span>
              )}
              {company.headquarters && (
                <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  📍 {company.headquarters}
                </span>
              )}
              {company.employeeCount && (
                <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  👥 {company.employeeCount}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {company.description}
            </p>
          </div>

          {/* Links + Scrape button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => scrapeAll()}
              disabled={scraping}
              title="Trigger fresh scrape (LinkedIn via Apify, website, news)"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scraping ? 'animate-spin' : ''}`} />
              {scraping ? 'Queuing...' : 'Scrape Now'}
            </button>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {company.linkedinUrl && (
              <a
                href={company.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {company.twitterHandle && (
              <a
                href={`https://twitter.com/${company.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 mb-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/competitors/${slug}/${tab.id}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
