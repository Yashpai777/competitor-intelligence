import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  return format(new Date(date), fmt);
}

export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function getThreatColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
}

export function getThreatLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function getThreatBg(score: number): string {
  if (score >= 80) return 'bg-red-400/10 border-red-400/20 text-red-400';
  if (score >= 60) return 'bg-orange-400/10 border-orange-400/20 text-orange-400';
  if (score >= 40) return 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400';
  return 'bg-green-400/10 border-green-400/20 text-green-400';
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  }
}

export function getImportanceColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-muted-foreground';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    funding: 'bg-green-500/10 text-green-400 border-green-500/20',
    partnership: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    product: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    product_launch: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    customer: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    hiring: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    acquisition: 'bg-red-500/10 text-red-400 border-red-500/20',
    award: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    thought_leadership: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    milestone: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    mention: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return colors[category] || colors.general;
}

export function getCompanyInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getCompanyLogoUrl(name: string, website: string): string {
  const domain = website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return `https://logo.clearbit.com/${domain}`;
}
