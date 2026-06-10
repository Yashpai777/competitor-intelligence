'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { getThreatColor, getThreatBg, cn } from '@/lib/utils';
import Link from 'next/link';

export function ThreatRadar({ companies }: { companies: any[] }) {
  const sorted = [...companies].sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <h2 className="text-base font-semibold text-foreground mb-4">Threat Scores</h2>

      <div className="space-y-2">
        {sorted.map((company) => (
          <Link
            key={company.slug}
            href={`/competitors/${company.slug}/overview`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {company.name}
                </span>
                <span
                  className={cn(
                    'text-xs font-bold px-1.5 py-0.5 rounded border',
                    getThreatBg(company.threatScore || 0),
                  )}
                >
                  {company.threatScore || 0}
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    company.threatScore >= 80
                      ? 'bg-red-500'
                      : company.threatScore >= 60
                      ? 'bg-orange-500'
                      : company.threatScore >= 40
                      ? 'bg-yellow-500'
                      : 'bg-green-500',
                  )}
                  style={{ width: `${company.threatScore || 0}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
