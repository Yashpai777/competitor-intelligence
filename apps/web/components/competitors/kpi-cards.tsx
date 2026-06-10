'use client';

interface KpiCardsProps {
  kpis: any;
  companyName?: string;
}

export function KpiCards({ kpis, companyName }: KpiCardsProps) {
  if (!kpis) return null;

  const cards = [
    { label: 'Weekly Mentions', value: kpis.weeklyMentions, icon: '📰', color: 'blue' },
    { label: 'Website Changes', value: kpis.websiteChanges, icon: '🌐', color: 'purple' },
    { label: 'LinkedIn Posts', value: kpis.linkedinPosts, icon: '💼', color: 'cyan' },
    { label: 'New Partnerships', value: kpis.partnerships, icon: '🤝', color: 'green' },
    { label: 'New Customers', value: kpis.newCustomers, icon: '🏢', color: 'yellow' },
    { label: 'Product Launches', value: kpis.productLaunches, icon: '🚀', color: 'orange' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
        This Week's KPIs
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className={`rounded-xl border p-4 text-center ${colorMap[color]}`}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-1 leading-tight">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
