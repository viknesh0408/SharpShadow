import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark animate-pulse flex flex-col h-full">
      <div className="aspect-[4/3] bg-dark-800 w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="h-3 bg-dark-750 rounded w-1/3 mb-2" />
          <div className="h-4 bg-dark-750 rounded w-full mb-1" />
          <div className="h-4 bg-dark-750 rounded w-4/5" />
        </div>
        <div className="pt-3 border-t border-dark-800/80 flex items-center justify-between">
          <div className="h-5 bg-dark-750 rounded w-16" />
          <div className="flex gap-1.5">
            <div className="w-8 h-8 bg-dark-750 rounded-xl" />
            <div className="w-8 h-8 bg-dark-750 rounded-xl" />
            <div className="w-12 h-8 bg-dark-750 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
