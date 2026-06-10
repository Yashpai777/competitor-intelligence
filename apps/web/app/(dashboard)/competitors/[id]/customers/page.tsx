'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { customersApi } from '@/lib/api';
import { CustomersList } from '@/components/competitors/customers-list';
import { PartnershipsList } from '@/components/competitors/partnerships-list';
import { CustomerGrowthChart } from '@/components/charts/customer-growth-chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomersPage() {
  const { id: slug } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'customers' | 'partnerships'>('customers');

  const { data: customersData, isLoading: custLoading } = useQuery({
    queryKey: ['customers', slug],
    queryFn: () => customersApi.getCustomers(slug),
  });

  const { data: partnershipsData, isLoading: partLoading } = useQuery({
    queryKey: ['partnerships', slug],
    queryFn: () => customersApi.getPartnerships(slug),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-foreground">
            {custLoading ? '...' : customersData?.meta?.total || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Total Customers Detected</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-foreground">
            {partLoading ? '...' : partnershipsData?.meta?.total || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Total Partnerships</div>
        </div>
      </div>

      {/* Growth Chart */}
      <CustomerGrowthChart slug={slug} />

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'customers'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          🏢 Customers ({customersData?.meta?.total || 0})
        </button>
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'partnerships'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          🤝 Partnerships ({partnershipsData?.meta?.total || 0})
        </button>
      </div>

      {activeTab === 'customers' ? (
        <CustomersList slug={slug} />
      ) : (
        <PartnershipsList slug={slug} />
      )}
    </div>
  );
}
