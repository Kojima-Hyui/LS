'use client';

import { useState, useEffect, useRef } from 'react';
import { Item, SearchFilters, BuildItem, GroupConstraint } from '@/types/item';
import { DDragonAPI } from '@/lib/ddragon';
import { deduplicateItems, searchAndFilterItems, getMaxItemPrice, getAllItemTags, MAPS } from '@/lib/itemUtils';
import { detectItemGroups, checkGroupConflicts, getGroupName } from '@/lib/groupConstraints';
import ItemCard from '@/components/ItemCard';
import SearchFiltersComponent from '@/components/SearchFilters';
import BuildPanel from '@/components/BuildPanel';
import ItemTreeModal from '@/components/ItemTreeModal';
import Link from 'next/link';

export default function Home() {
  const [items, setItems] = useState<Record<string, Item>>({});
  const [filteredItems, setFilteredItems] = useState<Array<{ id: string; item: Item }>>([]);
  const [buildItems, setBuildItems] = useState<BuildItem[]>([]);
  const [constraints, setConstraints] = useState<GroupConstraint[]>([]);
  const [buildPanelOpen, setBuildPanelOpen] = useState(false);
  const [treeModalOpen, setTreeModalOpen] = useState(false);
  const [selectedTreeItem, setSelectedTreeItem] = useState<{ id: string; item: Item } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    map: MAPS.SR,
    priceMin: 0,
    priceMax: 10000,
    purchasableOnly: true,
    sortBy: 'name-asc',
    tags: []
  });

  useEffect(() => {
    const loadItems = async () => {
      try {
        const ddragon = DDragonAPI.getInstance();
        const itemData = await ddragon.getItemData('ja_JP');
        const deduplicated = deduplicateItems(itemData.data);
        const detectedConstraints = detectItemGroups(deduplicated);
        const maxItemPrice = getMaxItemPrice(deduplicated);
        const itemTags = getAllItemTags(deduplicated);
        
        setItems(deduplicated);
        setConstraints(detectedConstraints);
        setMaxPrice(maxItemPrice);
        setAvailableTags(itemTags);
        setFilters(prev => ({ ...prev, priceMax: maxItemPrice }));
        
        const savedItems = JSON.parse(localStorage.getItem('buildItems') || '[]');
        setBuildItems(savedItems);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load items');
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    const filtered = searchAndFilterItems(items, filters);
    setFilteredItems(filtered);
  }, [items, filters]);

  const addItemToBuild = (itemId: string, item: Item, blockType: string = 'Core') => {
    const existsIndex = buildItems.findIndex(i => i.id === itemId);
    if (existsIndex !== -1) {
      alert('Item already in build!');
      return;
    }

    // Check Core Items limit
    if (blockType === 'Core') {
      const coreItemsCount = buildItems.filter(b => b.blockType === 'Core').length;
      if (coreItemsCount >= 6) {
        alert('Core Items are limited to 6 items maximum!');
        return;
      }
    }

    const currentBuildData = buildItems.map(b => ({ id: b.id, item: b.item }));
    const conflicts = checkGroupConflicts(currentBuildData, itemId, item, constraints);
    
    if (conflicts.hasConflict) {
      const conflictMessage = conflicts.conflictingGroups
        .map(group => getGroupName(group))
        .join(', ');
      
      const shouldReplace = confirm(
        `Adding this item conflicts with existing items in groups: ${conflictMessage}.\n\nReplace existing items?`
      );
      
      if (shouldReplace) {
        const newBuildItems = buildItems.filter(b => !conflicts.conflictingItems.includes(b.id));
        newBuildItems.push({ id: itemId, item, blockType });
        setBuildItems(newBuildItems);
        localStorage.setItem('buildItems', JSON.stringify(newBuildItems));
      }
    } else {
      const newBuildItems = [...buildItems, { id: itemId, item, blockType }];
      setBuildItems(newBuildItems);
      localStorage.setItem('buildItems', JSON.stringify(newBuildItems));
    }
  };

  const handleIconClick = (itemId: string, item: Item) => {
    // Check if we should show tree modal or scroll to item
    if (item.from && item.from.length > 0) {
      // Has recipe - show tree modal
      setSelectedTreeItem({ id: itemId, item });
      setTreeModalOpen(true);
    } else {
      // No recipe - just scroll to the item
      handleTreeItemClick(itemId);
    }
  };

  const handleTreeItemClick = (itemId: string) => {
    // Close modal first
    setTreeModalOpen(false);
    
    // Small delay to ensure modal is closed before scrolling
    setTimeout(() => {
      // Update filters to clear any search that might hide the item
      setFilters(prev => ({ ...prev, keyword: '' }));
      
      // Scroll to item after a short delay to ensure DOM is updated
      setTimeout(() => {
        const itemElement = itemRefs.current[itemId];
        if (itemElement) {
          itemElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
          // Add a highlight effect
          itemElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
          setTimeout(() => {
            itemElement.style.boxShadow = '';
          }, 2000);
        }
      }, 100);
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading LoL items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
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
            <h1 className="text-xl font-bold text-gray-900">LoL Item Search</h1>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 font-medium">
                Search
              </Link>
              <Link href="/builder" className="text-gray-600 hover:text-gray-900">
                Saved Builds
              </Link>
              <Link href="/runes" className="text-gray-600 hover:text-gray-900">
                Runes
              </Link>
              <Link href="/champions" className="text-gray-600 hover:text-gray-900">
                Champions
              </Link>
              <button
                onClick={() => setBuildPanelOpen(true)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors relative"
              >
                Build ({buildItems.length})
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFiltersComponent 
          filters={filters}
          onFiltersChange={setFilters}
          maxPrice={maxPrice}
          availableTags={availableTags}
        />
        
        <div className="mb-4">
          <p className="text-gray-600">
            Found {filteredItems.length} items
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredItems.map(({ id, item }) => (
            <div
              key={id}
              ref={(el) => { itemRefs.current[id] = el; }}
              className="transition-all duration-300"
            >
              <ItemCard
                id={id}
                item={item}
                showAddButton={true}
                onAddToBuild={(itemId, item) => addItemToBuild(itemId, item)}
                onIconClick={handleIconClick}
                items={items}
              />
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
          </div>
        )}
      </main>

      <BuildPanel
        isOpen={buildPanelOpen}
        onClose={() => setBuildPanelOpen(false)}
        buildItems={buildItems}
        setBuildItems={setBuildItems}
        constraints={constraints}
        items={items}
      />

      {selectedTreeItem && (
        <ItemTreeModal
          isOpen={treeModalOpen}
          onClose={() => setTreeModalOpen(false)}
          rootItem={selectedTreeItem}
          items={items}
          onItemClick={handleTreeItemClick}
        />
      )}
    </div>
  );
}
