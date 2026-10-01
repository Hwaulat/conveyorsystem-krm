import TooltipWrapper from '@/components/ui/tooltip-wrapper';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

export type CardVariant = 'stat' | 'stat-side' | 'compact' | 'progress' | 'gradient-border';

export interface StatCardItem {
  variant?: CardVariant;

  icon?: ReactNode;
  iconBg?: string;

  value?: string | number;
  valueColor?: string;

  title: string;
  subtitle?: string;
  subtitleColor?: string;

  // stat variant
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;

  // stat-side variant
  tooltip?: string;

  // progress variant
  progressCurrent?: number;
  progressMax?: number;

  // gradient-border variant
  description?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

interface StatCardGridProps {
  items: StatCardItem[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const colsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export function StatCard(item: StatCardItem) {
  const variant = item.variant ?? 'stat';

  if (variant === 'gradient-border') {
    const from = item.gradientFrom ?? 'rgb(59, 130, 246)';
    const to = item.gradientTo ?? 'rgb(139, 92, 246)';
    return (
      <div
        className="relative p-px rounded-xl overflow-hidden shadow-md border hover:shadow-lg transition-shadow"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <Card className="relative bg-background dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl">{item.title}</CardTitle>
            {item.description && (
              <CardDescription>{item.description}</CardDescription>
            )}
          </CardHeader>
          {item.subtitle && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  if (variant === 'progress') {
    const current = item.progressCurrent ?? 0;
    const max = item.progressMax ?? 100;
    const pct = Math.round((current / max) * 100);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h4 className="text-gray-900 dark:text-white font-semibold mb-2">
          {item.title}
        </h4>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
          <span>
            {current}/{max} {item.subtitle}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1F5AA6] to-[#3B82F6] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        {item.icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg ?? 'bg-gray-100 dark:bg-gray-700'}`}
          >
            {item.icon}
          </div>
        )}
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-xs">{item.title}</p>
          <p className={`font-bold tabular-nums ${item.valueColor ?? 'text-gray-900 dark:text-white'}`}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'stat-side') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
        {item.icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg ?? 'bg-gray-100 dark:bg-gray-700'}`}
          >
            {item.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{item.title}</p>
            {item.tooltip && (
              <TooltipWrapper content={item.tooltip}>
                <button className="text-gray-300 hover:text-gray-500 transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipWrapper>
            )}
          </div>
          <p className={`text-2xl font-bold tabular-nums ${item.valueColor ?? 'text-gray-900 dark:text-white'}`}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </p>
          {item.subtitle && (
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{item.subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-3">
        {item.icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg ?? 'bg-gray-100 dark:bg-gray-700'}`}
          >
            {item.icon}
          </div>
        )}
        {item.badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badgeColor ?? 'text-gray-500'} ${item.badgeBg ?? 'bg-gray-100'}`}>
            {item.badge}
          </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{item.title}</p>
      <p className={`text-2xl font-bold tabular-nums ${item.valueColor ?? 'text-gray-900 dark:text-white'}`}>
        {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
      </p>
      {item.subtitle && (
        <p className={`text-xs mt-1 ${item.subtitleColor ?? 'text-gray-500'}`}>
          {item.subtitle}
        </p>
      )}
    </div>
  );
}

export function StatCardGrid({ items, columns = 4, className = '' }: StatCardGridProps) {
  return (
    <div className={`grid ${colsMap[columns]} gap-4 ${className}`}>
      {items.map((item, i) => (
        <StatCard key={i} {...item} />
      ))}
    </div>
  );
}
