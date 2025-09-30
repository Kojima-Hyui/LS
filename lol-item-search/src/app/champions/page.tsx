'use client';

import { useState, useEffect } from 'react';
import { Champion, ChampionFilters, LANES, LANE_NAMES, ROLE_NAMES } from '@/types/champion';
import { ChampionAPI } from '@/lib/championApi';
import ChampionCard from '@/components/ChampionCard';
import ChampionFiltersComponent from '@/components/ChampionFilters';
import Link from 'next/link';

export default function ChampionsPage() {
  const [champions, setChampions] = useState<Record<string, Champion>>({});
  const [filteredChampions, setFilteredChampions] = useState<Array<{ id: string; champion: Champion }>>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ChampionFilters>({
    name: '',
    roles: [],
    lanes: [],
    difficulty: [],
    tags: [],
    sortBy: 'name-asc'
  });

  useEffect(() => {
    const loadChampions = async () => {
      try {
        const championApi = ChampionAPI.getInstance();
        const championData = await championApi.getChampionList('ja_JP');
        const roles = championApi.getAllRoles(championData.data);
        
        setChampions(championData.data);
        setAvailableRoles(roles);
        setLoading(false);
      } catch (err) {
        console.error('Error loading champions:', err);
        setError('チャンピオンデータの読み込みに失敗しました');
        setLoading(false);
      }
    };

    loadChampions();
  }, []);

  useEffect(() => {
    const championApi = ChampionAPI.getInstance();
    const filtered = championApi.filterChampions(champions, filters);
    setFilteredChampions(filtered);
  }, [champions, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">チャンピオンデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">エラー: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">LoL Champions</h1>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Item Search
              </Link>
              <Link href="/builder" className="text-gray-600 hover:text-gray-900">
                Item Builder
              </Link>
              <Link href="/runes" className="text-gray-600 hover:text-gray-900">
                Runes
              </Link>
              <Link href="/champions" className="text-blue-600 font-medium">
                Champions
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChampionFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          availableRoles={availableRoles}
        />
        
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredChampions.length}体のチャンピオンが見つかりました
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {filteredChampions.map(({ id, champion }) => (
            <ChampionCard
              key={id}
              id={id}
              champion={champion}
            />
          ))}
        </div>
        
        {filteredChampions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">条件に一致するチャンピオンが見つかりませんでした。</p>
            <p className="text-gray-400 text-sm mt-2">フィルターを調整してみてください。</p>
          </div>
        )}
      </main>
    </div>
  );
}