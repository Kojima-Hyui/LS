'use client';

import { SearchFilters } from '@/types/item';
import { MAPS, MAP_NAMES } from '@/lib/itemUtils';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  maxPrice: number;
  availableTags: string[];
}

export default function SearchFiltersComponent({ filters, onFiltersChange, maxPrice, availableTags }: SearchFiltersProps) {
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            id="keyword"
            type="text"
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            placeholder="Item name, description, or ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="map" className="block text-sm font-medium text-gray-700 mb-2">
            Map
          </label>
          <select
            id="map"
            value={filters.map}
            onChange={(e) => updateFilter('map', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(MAP_NAMES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as SearchFilters['sortBy'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700 mb-2">
            Min Price
          </label>
          <input
            id="priceMin"
            type="number"
            min="0"
            max={maxPrice}
            value={filters.priceMin}
            onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700 mb-2">
            Max Price
          </label>
          <input
            id="priceMax"
            type="number"
            min="0"
            max={maxPrice}
            value={filters.priceMax}
            onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || maxPrice)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="purchasableOnly"
            type="checkbox"
            checked={filters.purchasableOnly}
            onChange={(e) => updateFilter('purchasableOnly', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="purchasableOnly" className="ml-2 block text-sm text-gray-700">
            Purchasable only
          </label>
        </div>
      </div>
      
      {/* Tag Filters */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item Tags
        </label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                const newTags = filters.tags.includes(tag)
                  ? filters.tags.filter(t => t !== tag)
                  : [...filters.tags, tag];
                updateFilter('tags', newTags);
              }}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {filters.tags.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => updateFilter('tags', [])}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear all tags ({filters.tags.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}