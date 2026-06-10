'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { battlecardApi, companiesApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeDate } from '@/lib/utils';
import { RefreshCw, Shield, Target, Zap, TrendingUp, MessageSquare, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function BattlecardPage() {
  const { id: slug } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => companiesApi.getOne(slug),
  });

  const { data: battlecard, isLoading } = useQuery({
    queryKey: ['battlecard', slug],
    queryFn: () => battlecardApi.get(slug),
  });

  const { mutate: regenerate, isPending } = useMutation({
    mutationFn: () => battlecardApi.regenerate(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battlecard', slug] });
      toast.success('Battlecard regenerated with latest AI analysis');
    },
    onError: () => toast.error('Failed to regenerate battlecard'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
      </div>
    );
  }

  if (!battlecard) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No battlecard data available
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            ⚔️ Battlecard: {company?.name}
          </h2>
          {battlecard.generatedAt && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Last updated {formatRelativeDate(battlecard.generatedAt)} · AI-generated analysis
            </p>
          )}
        </div>
        <button
          onClick={() => regenerate()}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {/* AI Summary */}
      {battlecard.aiSummary && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">AI Competitive Summary</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{battlecard.aiSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <BattlecardSection
          icon={<Shield className="w-4 h-4 text-green-400" />}
          title="Strengths"
          color="green"
          items={battlecard.strengths}
        />

        {/* Weaknesses */}
        <BattlecardSection
          icon={<Target className="w-4 h-4 text-red-400" />}
          title="Weaknesses / Attack Points"
          color="red"
          items={battlecard.weaknesses}
        />

        {/* How We Compare */}
        <BattlecardSection
          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
          title="How We Compare (Our Advantages)"
          color="blue"
          items={battlecard.howWeCompare}
        />

        {/* Recent Updates */}
        <BattlecardSection
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
          title="Recent Updates to Watch"
          color="yellow"
          items={battlecard.recentUpdates}
        />
      </div>

      {/* Key Talking Points */}
      {battlecard.talkingPoints?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Sales Talking Points</h3>
          </div>
          <div className="space-y-2">
            {battlecard.talkingPoints.map((point: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <div className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objection Handling */}
      {battlecard.objectionHandling?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">🛡️ Objection Handling</h3>
          <div className="space-y-4">
            {battlecard.objectionHandling.map((item: any, i: number) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border">
                <div className="bg-red-500/10 px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-red-400">
                    💬 Objection: "{item.objection}"
                  </p>
                </div>
                <div className="bg-green-500/10 px-4 py-3">
                  <p className="text-sm text-green-300">
                    ✅ Response: {item.response}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positioning Recommendations */}
      {battlecard.positioningRecs?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">
            🎯 Positioning Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {battlecard.positioningRecs.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <span className="text-purple-400 font-bold text-sm flex-shrink-0">→</span>
                <p className="text-sm text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Market */}
      {(battlecard.targetIndustries?.length > 0 || battlecard.pricingModel) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {battlecard.targetIndustries?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">🏭 Target Industries</h3>
              <div className="flex flex-wrap gap-2">
                {battlecard.targetIndustries.map((ind: string) => (
                  <span
                    key={ind}
                    className="px-2.5 py-1 text-xs bg-secondary text-muted-foreground rounded-full border border-border"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {battlecard.pricingModel && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">💰 Pricing Intelligence</h3>
              <p className="text-sm font-medium text-foreground">{battlecard.pricingModel}</p>
              {battlecard.pricingNotes && (
                <p className="text-xs text-muted-foreground mt-1">{battlecard.pricingNotes}</p>
              )}
              {battlecard.targetCompanySize && (
                <p className="text-xs text-muted-foreground mt-2">
                  Target size: {battlecard.targetCompanySize}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BattlecardSection({
  icon,
  title,
  color,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  color: 'green' | 'red' | 'blue' | 'yellow';
  items: string[];
}) {
  const colorMap = {
    green: 'border-green-500/20 bg-green-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
  };

  const dotColorMap = {
    green: 'bg-green-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    yellow: 'bg-yellow-400',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items?.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColorMap[color]}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
