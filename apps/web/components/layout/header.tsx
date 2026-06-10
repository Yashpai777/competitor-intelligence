'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { alertsApi, searchApi } from '@/lib/api';
import { Bell, Search, X, RefreshCw } from 'lucide-react';
import { formatRelativeDate, getSeverityColor } from '@/lib/utils';
import Link from 'next/link';

export function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);

  const { data: alertsData } = useQuery({
    queryKey: ['alerts-unread'],
    queryFn: () => alertsApi.getAlerts({ isRead: false, limit: 5 }),
    refetchInterval: 60000,
  });

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchApi.search(searchQuery, { limit: 8 }),
    enabled: searchQuery.length > 2,
    staleTime: 30000,
  });

  const unreadCount = alertsData?.unreadCount || 0;

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-lg relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search competitors, news, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {searchOpen && searchQuery.length > 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
            {searching ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
            ) : searchResults?.results?.length > 0 ? (
              <div>
                {searchResults.results.map((result: any) => (
                  <Link
                    key={result.id}
                    href={`/competitors/${result.company.slug}/${result.type === 'linkedin_post' ? 'linkedin' : result.type === 'news' ? 'news' : result.type === 'website_change' ? 'website' : 'customers'}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-0"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.excerpt}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                        {result.company.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {result.type.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
                <div className="px-4 py-2 bg-secondary/50">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="text-xs text-primary hover:underline"
                    onClick={() => setSearchOpen(false)}
                  >
                    View all results for "{searchQuery}" →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No results for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {searchOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Alerts bell */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {alertsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAlertsOpen(false)} />
              <div className="absolute top-full right-0 mt-1 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Recent Alerts</span>
                  <Link href="/alerts" className="text-xs text-primary hover:underline" onClick={() => setAlertsOpen(false)}>
                    View all
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alertsData?.data?.length > 0 ? (
                    alertsData.data.map((alert: any) => (
                      <div
                        key={alert.id}
                        className="px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium border flex-shrink-0 mt-0.5 ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-foreground">{alert.title}</p>
                            {alert.company && (
                              <p className="text-[10px] text-muted-foreground">{alert.company.name}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatRelativeDate(alert.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">No unread alerts</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Last updated */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          Live
        </div>
      </div>
    </header>
  );
}
