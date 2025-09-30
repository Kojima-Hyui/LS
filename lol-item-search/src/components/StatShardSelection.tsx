'use client';

import { StatShard } from '@/types/rune';
import { cleanLoLText } from '@/lib/textUtils';
import { getStatShardsVersion } from '@/data/statShards';

interface StatShardSelectionProps {
  statShards: StatShard[];
  selectedShards: {
    offense: number;
    flex: number;
    defense: number;
  };
  onSelectShard: (category: 'offense' | 'flex' | 'defense', shardId: number) => void;
}

export default function StatShardSelection({ 
  statShards, 
  selectedShards, 
  onSelectShard 
}: StatShardSelectionProps) {
  const getShardsByCategory = (category: 'offense' | 'flex' | 'defense') => {
    return statShards.filter(shard => shard.category === category);
  };

  const getCategoryTitle = (category: 'offense' | 'flex' | 'defense') => {
    switch (category) {
      case 'offense': return 'Offense';
      case 'flex': return 'Flex';
      case 'defense': return 'Defense';
    }
  };

  const getCategoryColor = (category: 'offense' | 'flex' | 'defense') => {
    switch (category) {
      case 'offense': return 'border-red-500 bg-red-500/10';
      case 'flex': return 'border-yellow-500 bg-yellow-500/10';
      case 'defense': return 'border-blue-500 bg-blue-500/10';
    }
  };

  const categories: Array<'offense' | 'flex' | 'defense'> = ['offense', 'flex', 'defense'];
  const versionInfo = getStatShardsVersion();

  return (
    <div>
      {/* Version Info */}
      <div className="mb-4 text-xs text-gray-400 text-right">
        統計シャード データ v{versionInfo.version} ({versionInfo.lastUpdated})
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category) => {
        const shards = getShardsByCategory(category);
        const selectedShardId = selectedShards[category];

        return (
          <div key={category} className="space-y-3">
            <h4 className="text-lg font-medium text-center">
              {getCategoryTitle(category)}
            </h4>
            <div className="space-y-2">
              {shards.map((shard) => (
                <button
                  key={shard.id}
                  onClick={() => onSelectShard(category, shard.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedShardId === shard.id
                      ? getCategoryColor(category) + ' shadow-lg'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-300">
                        {shard.name.substring(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <h5 className="font-medium text-white text-sm">
                        {shard.name}
                      </h5>
                      <p className="text-xs text-gray-400">
                        {cleanLoLText(shard.value)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}