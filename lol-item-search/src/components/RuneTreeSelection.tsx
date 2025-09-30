'use client';

import { RuneTreeApiData } from '@/lib/runeApi';

interface RuneTreeSelectionProps {
  trees: RuneTreeApiData[];
  selectedTreeId: number;
  onSelectTree: (treeId: number) => void;
  isPrimary: boolean;
}

export default function RuneTreeSelection({ 
  trees, 
  selectedTreeId, 
  onSelectTree, 
  isPrimary 
}: RuneTreeSelectionProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">
        {isPrimary ? 'Select Primary Tree' : 'Select Secondary Tree'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {trees.map((tree) => (
          <button
            key={tree.id}
            onClick={() => onSelectTree(tree.id)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedTreeId === tree.id
                ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20'
                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`}
                  alt={tree.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-2xl font-bold text-gray-300 hidden">
                  {tree.name.substring(0, 1)}
                </span>
              </div>
              <span className="text-sm font-medium text-center">
                {tree.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}