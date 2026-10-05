import React from 'react';

interface SkeletonCardProps {
  aspect?: 'portrait' | 'square' | 'landscape';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ aspect = 'portrait' }) => {
  const aspectClass =
    aspect === 'portrait'
      ? 'aspect-[3/4]'
      : aspect === 'landscape'
      ? 'aspect-[4/3]'
      : 'aspect-square';

  return (
    <div className="bg-slate-200 dark:bg-dark-900 border border-slate-200/80 dark:border-dark-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm animate-pulse break-inside-avoid mb-4 sm:mb-6 w-full relative inline-block">
      <div className={`w-full ${aspectClass} bg-slate-200 dark:bg-dark-800`} />
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/80 to-transparent flex items-center justify-between">
        <div className="h-4 bg-white/20 rounded w-16" />
        <div className="flex gap-1.5">
          <div className="w-8 h-8 bg-white/20 rounded-xl" />
          <div className="w-12 h-8 bg-white/30 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
