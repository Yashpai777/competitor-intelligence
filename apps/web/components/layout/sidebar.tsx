'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import { cn, getCompanyInitials, getCompanyLogoUrl, getThreatColor } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Bell,
  FileText,
  Settings,
  Zap,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  const isCompetitorActive = (slug: string) => pathname.includes(`/competitors/${slug}`);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/alerts', icon: Bell, label: 'Alerts' },
    { href: '/reports', icon: FileText, label: 'Reports' },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">CompeteIQ</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">AI Voice Intelligence</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-3 py-3 space-y-1 border-b border-border">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Competitors list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Competitors ({companies?.length || 0})
        </p>
        <nav className="space-y-0.5">
          {companies?.map((company: any) => {
            const isActive = isCompetitorActive(company.slug);
            const logoUrl = getCompanyLogoUrl(company.name, company.website);

            return (
              <Link
                key={company.slug}
                href={`/competitors/${company.slug}/overview`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all group',
                  isActive
                    ? 'bg-primary/10 text-foreground border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                {/* Logo */}
                <div className="w-6 h-6 rounded-md bg-secondary border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={logoUrl}
                    alt={company.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden text-[9px] font-bold text-muted-foreground">
                    {getCompanyInitials(company.name)}
                  </span>
                </div>

                {/* Name */}
                <span className="flex-1 truncate font-medium">{company.name}</span>

                {/* Threat score dot */}
                {company.threatScore !== undefined && (
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      company.threatScore >= 80
                        ? 'bg-red-400'
                        : company.threatScore >= 60
                        ? 'bg-orange-400'
                        : company.threatScore >= 40
                        ? 'bg-yellow-400'
                        : 'bg-green-400',
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
