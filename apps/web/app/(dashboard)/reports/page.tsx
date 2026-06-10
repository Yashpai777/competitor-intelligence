'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Sparkles, RefreshCw, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const qc = useQueryClient();

  const { data: latestReport, isLoading } = useQuery({
    queryKey: ['weekly-report'],
    queryFn: reportsApi.getLatestGlobal,
  });

  const { data: history } = useQuery({
    queryKey: ['report-history'],
    queryFn: () => reportsApi.getHistory(8),
  });

  const { mutate: generate, isPending } = useMutation({
    mutationFn: reportsApi.generateReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weekly-report'] });
      qc.invalidateQueries({ queryKey: ['report-history'] });
      toast.success('Report generated successfully!');
    },
    onError: () => toast.error('Failed to generate report'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Reports</h1>
          <p className="text-muted-foreground mt-1">
            AI-generated executive summaries and competitive intelligence
          </p>
        </div>
        <button
          onClick={() => generate()}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Generating...' : 'Generate Now'}
        </button>
      </div>

      {/* Latest report */}
      {isLoading ? (
        <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />
      ) : latestReport ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Latest Report</h2>
              <span className="text-sm text-muted-foreground">
                {formatDate(latestReport.weekStart, 'MMM d')} –{' '}
                {formatDate(latestReport.weekEnd, 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'LinkedIn Posts', value: latestReport.linkedinPostCount, icon: '💼' },
                { label: 'Website Changes', value: latestReport.websiteChanges, icon: '🌐' },
                { label: 'News Articles', value: latestReport.newsArticles, icon: '📰' },
                { label: 'New Customers', value: latestReport.newCustomers, icon: '🏢' },
                { label: 'New Partnerships', value: latestReport.newPartnerships, icon: '🤝' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xl font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {/* Executive Summary */}
            {latestReport.executiveSummary && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Executive Summary
                </h3>
                <div className="bg-secondary/30 rounded-xl p-4">
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {latestReport.executiveSummary}
                  </p>
                </div>
              </div>
            )}

            {/* Strategic Insights */}
            {latestReport.strategicInsights && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Strategic Insights
                </h3>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {latestReport.strategicInsights}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No reports generated yet</p>
          <button
            onClick={() => generate()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
          >
            Generate First Report
          </button>
        </div>
      )}

      {/* Report history */}
      {history && history.length > 1 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Report History</h2>
          <div className="space-y-2">
            {history.slice(1).map((report: any) => (
              <div
                key={report.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(report.weekStart, 'MMM d')} – {formatDate(report.weekEnd, 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{report.linkedinPostCount} posts</span>
                    <span>{report.websiteChanges} changes</span>
                    <span>{report.newsArticles} news</span>
                  </div>
                </div>
                {report.executiveSummary && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {report.executiveSummary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
