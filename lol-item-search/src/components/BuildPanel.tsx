'use client';

import { useState } from 'react';
import { Item, ItemSet, BuildItem, GroupConstraint } from '@/types/item';
import { checkGroupConflicts, getGroupName } from '@/lib/groupConstraints';
import ItemCard from './ItemCard';

interface BuildPanelProps {
  isOpen: boolean;
  onClose: () => void;
  buildItems: BuildItem[];
  setBuildItems: (items: BuildItem[]) => void;
  constraints: GroupConstraint[];
  items: Record<string, Item>;
}

export default function BuildPanel({ 
  isOpen, 
  onClose, 
  buildItems, 
  setBuildItems, 
  constraints,
  items
}: BuildPanelProps) {
  const [buildName, setBuildName] = useState('My Custom Build');
  const [buildMap, setBuildMap] = useState<'SR' | 'HA' | 'any'>('SR');
  const [buildMode, setBuildMode] = useState<'CLASSIC' | 'ARAM' | 'any'>('CLASSIC');
  const [showImportGuide, setShowImportGuide] = useState(false);

  const removeItemFromBuild = (itemId: string) => {
    const newBuildItems = buildItems.filter(i => i.id !== itemId);
    setBuildItems(newBuildItems);
    localStorage.setItem('buildItems', JSON.stringify(newBuildItems));
  };

  const moveItemToBlock = (itemId: string, newBlockType: string) => {
    // Check Core Items limit when moving to Core
    if (newBlockType === 'Core') {
      const coreItemsCount = buildItems.filter(b => b.blockType === 'Core' && b.id !== itemId).length;
      if (coreItemsCount >= 6) {
        alert('Core Items are limited to 6 items maximum!');
        return;
      }
    }

    const newBuildItems = buildItems.map(item => 
      item.id === itemId ? { ...item, blockType: newBlockType } : item
    );
    setBuildItems(newBuildItems);
    localStorage.setItem('buildItems', JSON.stringify(newBuildItems));
  };

  const generateItemSet = (): ItemSet => {
    const blockTypes = ['Start', 'Core', 'Situational'];
    const blocks = blockTypes.map(blockType => ({
      type: blockType,
      recMath: false,
      items: buildItems
        .filter(item => item.blockType === blockType)
        .map(item => ({ id: item.id, count: 1 }))
    })).filter(block => block.items.length > 0);

    return {
      title: buildName,
      type: 'custom',
      map: buildMap,
      mode: buildMode,
      priority: false,
      sortrank: 0,
      blocks
    };
  };

  const downloadItemSet = () => {
    const itemSet = generateItemSet();
    const json = JSON.stringify(itemSet, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')}_itemset.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const itemSet = generateItemSet();
    const json = JSON.stringify(itemSet, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      alert('Item set copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const saveBuild = () => {
    const builds = JSON.parse(localStorage.getItem('savedBuilds') || '[]');
    const newBuild = {
      id: Date.now().toString(),
      name: buildName,
      map: buildMap,
      mode: buildMode,
      items: buildItems,
      createdAt: new Date().toISOString()
    };
    builds.push(newBuild);
    localStorage.setItem('savedBuilds', JSON.stringify(builds));
    alert('Build saved successfully!');
  };

  const clearBuild = () => {
    if (confirm('Are you sure you want to clear the current build?')) {
      setBuildItems([]);
      localStorage.setItem('buildItems', JSON.stringify([]));
    }
  };

  const ImportGuideModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">LoL Item Set Import Guide</h2>
          <button
            onClick={() => setShowImportGuide(false)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📋 Step 1: Download the Item Set</h3>
              <p className="text-sm text-gray-600">Click &quot;📥 Download for LoL Import&quot; to download your custom item set as a JSON file.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📁 Step 2: Locate LoL Config Folder</h3>
              <p className="text-sm text-gray-600 mb-2">Navigate to your League of Legends installation folder:</p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                C:\Riot Games\League of Legends\Config\Global\Recommended\
              </div>
              <p className="text-xs text-gray-500 mt-1">If the &quot;Global&quot; or &quot;Recommended&quot; folders don&apos;t exist, create them.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📄 Step 3: Copy the JSON File</h3>
              <p className="text-sm text-gray-600">Place the downloaded JSON file into the Recommended folder.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎮 Step 4: Access In-Game</h3>
              <p className="text-sm text-gray-600">Your custom item set will appear in the in-game shop under &quot;Item Sets&quot;.</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Item sets work for all champions when placed in Global/Recommended</li>
                <li>• Restart League of Legends client to see new item sets</li>
                <li>• You can create multiple item sets for different strategies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showImportGuide && <ImportGuideModal />}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Build Creator</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Build Configuration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Build Name
                </label>
                <input
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Map
                  </label>
                  <select
                    value={buildMap}
                    onChange={(e) => setBuildMap(e.target.value as 'SR' | 'HA' | 'any')}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="SR">Summoner's Rift</option>
                    <option value="HA">ARAM</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mode
                  </label>
                  <select
                    value={buildMode}
                    onChange={(e) => setBuildMode(e.target.value as 'CLASSIC' | 'ARAM' | 'any')}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="CLASSIC">Classic</option>
                    <option value="ARAM">ARAM</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {['Start', 'Core', 'Situational'].map((blockType) => (
            <div key={blockType} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {blockType} Items
                {blockType === 'Core' && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({buildItems.filter(item => item.blockType === 'Core').length}/6)
                  </span>
                )}
              </h3>
              
              <div className="space-y-2">
                {buildItems
                  .filter(item => item.blockType === blockType)
                  .map((buildItem) => (
                    <div key={buildItem.id} className="relative bg-gray-50 rounded-lg p-2">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/15.19.1/img/item/${buildItem.item.image.full}`}
                            alt={buildItem.item.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-800 truncate">{buildItem.item.name}</div>
                          <div className="text-xs text-gray-600">{buildItem.item.gold.total}g</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <select
                          value={buildItem.blockType}
                          onChange={(e) => moveItemToBlock(buildItem.id, e.target.value)}
                          className="text-xs px-1 py-0.5 border rounded bg-white flex-1"
                        >
                          <option value="Start">Start</option>
                          <option value="Core">Core</option>
                          <option value="Situational">Situational</option>
                        </select>
                        <button
                          onClick={() => removeItemFromBuild(buildItem.id)}
                          className="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              {buildItems.filter(item => item.blockType === blockType).length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                  No {blockType.toLowerCase()} items added yet.
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="border-t p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={saveBuild}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Save Build
            </button>
            <button
              onClick={clearBuild}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Clear Build
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={downloadItemSet}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              📥 Download for LoL Import
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                📋 Copy JSON
              </button>
              <button
                onClick={() => setShowImportGuide(true)}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                📖 Import Guide
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}