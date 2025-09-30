'use client';

import { useState, useEffect } from 'react';
import { Item, ItemSet } from '@/types/item';
import { DDragonAPI } from '@/lib/ddragon';
import { deduplicateItems } from '@/lib/itemUtils';
import ItemCard from '@/components/ItemCard';
import Link from 'next/link';

interface SavedBuild {
  id: string;
  name: string;
  map: string;
  mode: string;
  items: Array<{ id: string; item: Item; blockType: string }>;
  createdAt: string;
}

export default function Builder() {
  const [items, setItems] = useState<Record<string, Item>>({});
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<SavedBuild | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ddragon = DDragonAPI.getInstance();
        const itemData = await ddragon.getItemData('ja_JP');
        const deduplicated = deduplicateItems(itemData.data);
        
        setItems(deduplicated);
        
        const builds = JSON.parse(localStorage.getItem('savedBuilds') || '[]');
        setSavedBuilds(builds);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateItemSet = (build: SavedBuild): ItemSet => {
    const blockTypes = ['Start', 'Core', 'Situational'];
    const blocks = blockTypes.map(blockType => ({
      type: blockType,
      recMath: false,
      items: build.items
        .filter(item => item.blockType === blockType)
        .map(item => ({ id: item.id, count: 1 }))
    })).filter(block => block.items.length > 0);

    return {
      title: build.name,
      type: 'custom',
      map: build.map,
      mode: build.mode,
      priority: false,
      sortrank: 0,
      blocks
    };
  };

  const downloadItemSet = (build: SavedBuild) => {
    const itemSet = generateItemSet(build);
    const json = JSON.stringify(itemSet, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${build.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (build: SavedBuild) => {
    const itemSet = generateItemSet(build);
    const json = JSON.stringify(itemSet, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      alert('Item set copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const deleteBuild = (buildId: string) => {
    if (confirm('Are you sure you want to delete this build?')) {
      const updatedBuilds = savedBuilds.filter(b => b.id !== buildId);
      setSavedBuilds(updatedBuilds);
      localStorage.setItem('savedBuilds', JSON.stringify(updatedBuilds));
      if (selectedBuild?.id === buildId) {
        setSelectedBuild(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading saved builds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Saved Builds</h1>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Search
              </Link>
              <Link href="/builder" className="text-blue-600 font-medium">
                Saved Builds
              </Link>
              <Link href="/runes" className="text-gray-600 hover:text-gray-900">
                Runes
              </Link>
              <Link href="/champions" className="text-gray-600 hover:text-gray-900">
                Champions
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Builds</h2>
              
              {savedBuilds.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No saved builds yet. Create a build on the search page!
                </p>
              ) : (
                <div className="space-y-3">
                  {savedBuilds.map((build) => (
                    <div
                      key={build.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBuild?.id === build.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBuild(build)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{build.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBuild(build.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Map: {build.map} | Mode: {build.mode}</p>
                        <p>Items: {build.items.length}</p>
                        <p>Created: {new Date(build.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedBuild ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedBuild.name}</h2>
                      <p className="text-sm text-gray-600">
                        {selectedBuild.map} - {selectedBuild.mode} | {selectedBuild.items.length} items
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadItemSet(selectedBuild)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Download JSON
                      </button>
                      <button
                        onClick={() => copyToClipboard(selectedBuild)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Copy JSON
                      </button>
                    </div>
                  </div>
                </div>

                {['Start', 'Core', 'Situational'].map((blockType) => (
                  <div key={blockType} className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{blockType} Items</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {selectedBuild.items
                        .filter(item => item.blockType === blockType)
                        .map((buildItem) => (
                          <ItemCard
                            key={buildItem.id}
                            id={buildItem.id}
                            item={buildItem.item}
                            showAddButton={false}
                          />
                        ))}
                    </div>
                    
                    {selectedBuild.items.filter(item => item.blockType === blockType).length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No {blockType.toLowerCase()} items in this build.
                      </p>
                    )}
                  </div>
                ))}

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">JSON Preview</h3>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(generateItemSet(selectedBuild), null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">Select a build to view details</p>
                  <Link
                    href="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-block"
                  >
                    Create New Build
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}