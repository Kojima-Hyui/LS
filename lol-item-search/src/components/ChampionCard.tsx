'use client';

import { Champion, ROLE_NAMES } from '@/types/champion';
import { ChampionAPI } from '@/lib/championApi';
import { cleanLoLText } from '@/lib/textUtils';
import Link from 'next/link';
import Image from 'next/image';

interface ChampionCardProps {
  id: string;
  champion: Champion;
}

export default function ChampionCard({ id, champion }: ChampionCardProps) {
  const championApi = ChampionAPI.getInstance();
  const estimatedLanes = championApi.estimateLanes(champion);
  
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-orange-600 bg-orange-100';
      case 5: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '初心者';
      case 2: return '初級';
      case 3: return '中級';
      case 4: return '上級';
      case 5: return '専門';
      default: return `難易度 ${difficulty}`;
    }
  };

  const getLaneIcon = (lane: string) => {
    const icons = {
      'top': '🛡️',
      'jungle': '🌲',
      'middle': '⚡',
      'bottom': '🏹',
      'utility': '💎'
    };
    return icons[lane as keyof typeof icons] || '❓';
  };

  const getStatBar = (value: number, max: number = 10) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <Link href={`/champions/${id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
        {/* Champion Image */}
        <div className="relative h-40 lg:h-44 xl:h-40 2xl:h-36 bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
          <Image
            src={championApi.getChampionImageUrl(champion.image.full)}
            alt={champion.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Difficulty Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(champion.info.difficulty)}`}>
              {getDifficultyLabel(champion.info.difficulty)}
            </span>
          </div>

          {/* Estimated Lanes */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {estimatedLanes.slice(0, 3).map((lane, index) => (
              <span
                key={lane}
                className="w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-xs"
                title={lane}
              >
                {getLaneIcon(lane)}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 xl:p-4">
          {/* Champion Name and Title */}
          <div className="mb-2 xl:mb-3">
            <h3 className="font-bold text-base xl:text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {champion.name}
            </h3>
            <p className="text-xs xl:text-sm text-gray-600">
              {champion.title}
            </p>
          </div>

          {/* Champion Tags */}
          <div className="flex flex-wrap gap-1 mb-2 xl:mb-3">
            {champion.tags.slice(0, 2).map((tag, index) => (
              <span
                key={tag}
                className="px-1.5 xl:px-2 py-0.5 xl:py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {ROLE_NAMES[tag as keyof typeof ROLE_NAMES] || tag}
              </span>
            ))}
            {champion.tags.length > 2 && (
              <span className="px-1.5 xl:px-2 py-0.5 xl:py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{champion.tags.length - 2}
              </span>
            )}
          </div>

          {/* Champion Description */}
          <p className="text-xs xl:text-sm text-gray-600 mb-2 xl:mb-3 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {cleanLoLText(champion.blurb)}
          </p>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">攻撃</span>
              <div className="flex-1 mx-2">
                {getStatBar(champion.info.attack)}
              </div>
              <span className="text-gray-800 font-medium">{champion.info.attack}/10</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">防御</span>
              <div className="flex-1 mx-2">
                {getStatBar(champion.info.defense)}
              </div>
              <span className="text-gray-800 font-medium">{champion.info.defense}/10</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">魔法</span>
              <div className="flex-1 mx-2">
                {getStatBar(champion.info.magic)}
              </div>
              <span className="text-gray-800 font-medium">{champion.info.magic}/10</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}