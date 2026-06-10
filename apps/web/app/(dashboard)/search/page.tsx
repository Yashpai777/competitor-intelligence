'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchApi, companiesApi } from '@/lib/api';
import { formatRelativeDate, getCategoryColor, cn } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

const TYPE_ICONS: Record<string, string> = {
  linkedin_post: '💼',
  news: '📰',
  customer: '🏢',
  partnership: '🤝',
  website_change: '🌐',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [companyFilter, setCompanyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['search-page', query, companyFilter, typeFilter],
    queryFn: () => searchApi.search(query, { company: companyFilter || undefined, limit: 50 }),
    enabled: query.length > 2,
  });

  const filteredResults = results?.results?.filter((r: any) =>
    typeFilter ? r.type === typeFilter : true,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Global Search</h1>
        <p className="text-muted-foreground mt-1">Search across all competitors, posts, news, and changes</p>
      </div>

      {/* Search bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filters */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Companies</option>
            {companies?.map((c: any) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Types</option>
            <option value="linkedin_post">LinkedIn Posts</option>
            <option value="news">News</option>
            <option value="customer">Customers</option>
            <option value="partnership">Partnerships</option>
            <option value="website_change">Website Changes</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {query.length > 2 ? (
        isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              {filteredResults?.length || 0} results for "{query}"
            </p>
            <div className="space-y-3">
              {filteredResults?.map((result: any) => (
                <Link
                  key={result.id}
                  href={`/competitors/${result.company.slug}/${
                    result.type === 'linkedin_post' ? 'linkedin' :
                    result.type === 'news' ? 'news' :
                    result.type === 'website_change' ? 'website' : 'customers'
                  }`}
                  className="block bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[result.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                          {result.company.name}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {result.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatRelativeDate(result.date)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-foreground mb-1">{result.title}</h3>
                      {result.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{result.excerpt}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {(!filteredResults || filteredResults.length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Type at least 3 characters to search
        </div>
      )}
    </div>
  );
}
