'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, companiesApi } from '@/lib/api';
import { getSeverityColor, formatRelativeDate, getCategoryColor, cn } from '@/lib/utils';
import { Bell, CheckCheck, ExternalLink, Filter } from 'lucide-react';

export default function AlertsPage() {
  const qc = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: companiesApi.getAll });

  const { data, isLoading } = useQuery({
    queryKey: ['alerts-page', severityFilter, companyFilter, readFilter],
    queryFn: () => alertsApi.getAlerts({
      severity: severityFilter || undefined,
      company: companyFilter || undefined,
      isRead: readFilter === '' ? undefined : readFilter === 'true',
      limit: 50,
    }),
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => alertsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts-page'] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: alertsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts-page'] });
      qc.invalidateQueries({ queryKey: ['alerts-unread'] });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            {data?.unreadCount > 0 && (
              <span className="text-primary font-medium">{data.unreadCount} unread · </span>
            )}
            Real-time notifications about competitor activity
          </p>
        </div>
        {data?.unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm hover:bg-secondary/80 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card border border-border rounded-xl p-4">
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none"
        >
          <option value="">All Companies</option>
          {companies?.map((c: any) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none"
        >
          <option value="">All Alerts</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.data?.map((alert: any) => (
            <div
              key={alert.id}
              className={cn(
                'bg-card border rounded-xl p-4 transition-all',
                alert.isRead ? 'border-border' : 'border-primary/20 bg-primary/3',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded border font-semibold flex-shrink-0 mt-0.5',
                    getSeverityColor(alert.severity),
                  )}
                >
                  {alert.severity.toUpperCase()}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                    {!alert.isRead && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  {alert.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {alert.company && (
                      <span className="text-xs text-muted-foreground">{alert.company.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground capitalize">
                      {alert.type?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(alert.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {alert.sourceUrl && (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  )}
                  {!alert.isRead && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {data?.data?.length === 0 && (
            <div className="text-center py-20">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No alerts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
