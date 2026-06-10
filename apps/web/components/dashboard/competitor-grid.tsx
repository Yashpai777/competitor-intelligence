'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import { getThreatBg, getCompanyLogoUrl, getCompanyInitials, cn } from '@/lib/utils';
import { TrendingUp, Globe, Linkedin, FileText, Users } from 'lucide-react';

export function CompetitorGrid({ companies }: { companies: any[] }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-4">
        All Competitors
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <CompetitorCard key={company.slug} company={company} />
        ))}
      </div>
    </div>
  );
}

function CompetitorCard({ company }: { company: any }) {
  const { data: kpis } = useQuery({
    queryKey: ['company-kpis', company.slug],
    queryFn: () => companiesApi.getKpis(company.slug),
    staleTime: 5 * 60 * 1000,
  });

  const logoUrl = getCompanyLogoUrl(company.name, company.website);

  return (
    <Link href={`/competitors/${company.slug}/overview`}>
      <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              src={logoUrl}
              alt={company.name}
              className="w-9 h-9 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {company.name}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {company.headquarters || company.industry}
            </p>
          </div>
          {company.threatScore !== undefined && (
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0',
                getThreatBg(company.threatScore),
              )}
            >
              {company.threatScore}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
          {company.description}
        </p>

        {/* Weekly stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat
            icon={<Linkedin className="w-3 h-3" />}
            value={kpis?.linkedinPosts ?? '...'}
            label="Posts"
          />
          <Stat
            icon={<Globe className="w-3 h-3" />}
            value={kpis?.websiteChanges ?? '...'}
            label="Changes"
          />
          <Stat
            icon={<FileText className="w-3 h-3" />}
            value={kpis?.weeklyMentions ?? '...'}
            label="News"
          />
        </div>
      </div>
    </Link>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: any; label: string }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
