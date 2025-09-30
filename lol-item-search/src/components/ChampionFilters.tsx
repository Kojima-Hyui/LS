'use client';

import { ChampionFilters, LANES, LANE_NAMES, ROLE_NAMES } from '@/types/champion';

interface ChampionFiltersProps {
  filters: ChampionFilters;
  onFiltersChange: (filters: ChampionFilters) => void;
  availableRoles: string[];
}

export default function ChampionFiltersComponent({ 
  filters, 
  onFiltersChange, 
  availableRoles 
}: ChampionFiltersProps) {
  const updateFilter = <K extends keyof ChampionFilters>(key: K, value: ChampionFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleRole = (role: string) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    updateFilter('roles', newRoles);
  };

  const toggleLane = (lane: string) => {
    const newLanes = filters.lanes.includes(lane)
      ? filters.lanes.filter(l => l !== lane)
      : [...filters.lanes, lane];
    updateFilter('lanes', newLanes);
  };

  const toggleDifficulty = (difficulty: number) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];
    updateFilter('difficulty', newDifficulties);
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

  const clearAllFilters = () => {
    onFiltersChange({
      name: '',
      roles: [],
      lanes: [],
      difficulty: [],
      tags: [],
      sortBy: 'name-asc'
    });
  };

  const hasActiveFilters = filters.name || 
    filters.roles.length > 0 || 
    filters.lanes.length > 0 || 
    filters.difficulty.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">チャンピオン検索・フィルター</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            すべてクリア
          </button>
        )}
      </div>
      
      {/* Search Input */}
      <div className="mb-6">
        <label htmlFor="championName" className="block text-sm font-medium text-gray-700 mb-2">
          チャンピオン名
        </label>
        <input
          id="championName"
          type="text"
          value={filters.name}
          onChange={(e) => updateFilter('name', e.target.value)}
          placeholder="チャンピオン名、タイトル、説明で検索"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ロール
          </label>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map(role => (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  filters.roles.includes(role)
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role}
              </button>
            ))}
          </div>
        </div>

        {/* Lanes Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            レーン
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(LANE_NAMES).map(([laneKey, laneName]) => (
              <button
                key={laneKey}
                onClick={() => toggleLane(laneKey)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  filters.lanes.includes(laneKey)
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {laneName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Difficulty and Sort */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            難易度
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(difficulty => (
              <button
                key={difficulty}
                onClick={() => toggleDifficulty(difficulty)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  filters.difficulty.includes(difficulty)
                    ? 'bg-purple-100 border-purple-500 text-purple-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getDifficultyLabel(difficulty)}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
            並び順
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as ChampionFilters['sortBy'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name-asc">名前 (昇順)</option>
            <option value="name-desc">名前 (降順)</option>
            <option value="difficulty-asc">難易度 (易→難)</option>
            <option value="difficulty-desc">難易度 (難→易)</option>
            <option value="attack-desc">攻撃力 (高→低)</option>
            <option value="defense-desc">防御力 (高→低)</option>
            <option value="magic-desc">魔法力 (高→低)</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">
            <span className="font-medium">適用中のフィルター:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {filters.name && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  名前: "{filters.name}"
                </span>
              )}
              {filters.roles.map(role => (
                <span key={role} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role}
                </span>
              ))}
              {filters.lanes.map(lane => (
                <span key={lane} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {LANE_NAMES[lane as keyof typeof LANE_NAMES] || lane}
                </span>
              ))}
              {filters.difficulty.map(diff => (
                <span key={diff} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  {getDifficultyLabel(diff)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}