'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Settings } from 'lucide-react';

export default function SettingsPage() {
  const qc = useQueryClient();
  const [newCompany, setNewCompany] = useState({
    name: '',
    slug: '',
    website: '',
    linkedinUrl: '',
    description: '',
  });

  const { mutate: addCompany, isPending } = useMutation({
    mutationFn: companiesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      setNewCompany({ name: '', slug: '', website: '', linkedinUrl: '', description: '' });
      toast.success('Competitor added successfully!');
    },
    onError: () => toast.error('Failed to add competitor'),
  });

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage competitors and system configuration</p>
      </div>

      {/* Add competitor */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Add New Competitor</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Company Name *</label>
            <input
              type="text"
              value={newCompany.name}
              onChange={(e) => setNewCompany(prev => ({
                ...prev,
                name: e.target.value,
                slug: autoSlug(e.target.value),
              }))}
              placeholder="e.g. Nuance Communications"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Slug *</label>
            <input
              type="text"
              value={newCompany.slug}
              onChange={(e) => setNewCompany(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g. nuance"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Website *</label>
            <input
              type="url"
              value={newCompany.website}
              onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://nuance.com"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={newCompany.linkedinUrl}
              onChange={(e) => setNewCompany(prev => ({ ...prev, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/company/nuance"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Description</label>
            <textarea
              value={newCompany.description}
              onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="Brief description of the competitor..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <button
            onClick={() => addCompany(newCompany)}
            disabled={isPending || !newCompany.name || !newCompany.slug || !newCompany.website}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Adding...' : 'Add Competitor'}
          </button>
        </div>
      </div>

      {/* System info */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">System Information</h2>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { key: 'Data Collection', value: 'Daily (website & news), Weekly (reports)' },
            { key: 'AI Provider', value: process.env.NEXT_PUBLIC_AI_PROVIDER || 'Anthropic Claude' },
            { key: 'Database', value: 'PostgreSQL' },
            { key: 'Queue', value: 'BullMQ + Redis' },
            { key: 'API Docs', value: '/api/docs' },
          ].map(({ key, value }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
