'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api';
import { getSeverityColor, formatRelativeDate, getCategoryColor } from '@/lib/utils';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function RecentAlerts() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['alerts-recent'],
    queryFn: () => alertsApi.getAlerts({ limit: 6 }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: alertsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-recent'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-unread'] });
    },
  });

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Recent Alerts</h2>
          {data?.unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
              {data.unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data?.unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <Link href="/alerts" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data?.data?.length > 0 ? (
        <div className="space-y-2">
          {data.data.map((alert: any) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                alert.isRead ? 'bg-secondary/30 border-border' : 'bg-secondary/60 border-primary/20'
              }`}
            >
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-semibold border flex-shrink-0 mt-0.5 ${getSeverityColor(alert.severity)}`}
              >
                {alert.severity.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">{alert.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {alert.company && (
                    <span className="text-xs text-muted-foreground">{alert.company.name}</span>
                  )}
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(alert.createdAt)}
                  </span>
                </div>
              </div>
              {alert.sourceUrl && (
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No alerts yet
        </div>
      )}
    </div>
  );
}
