'use client';

import { useState, useEffect } from 'react';
import { RunePage } from '@/types/rune';
import { RuneAPI, RuneTreeApiData } from '@/lib/runeApi';
import RuneTreeSelection from '@/components/RuneTreeSelection';
import RuneSlotSelection from '@/components/RuneSlotSelection';
import StatShardSelection from '@/components/StatShardSelection';
import RunePageManager from '@/components/RunePageManager';
import Link from 'next/link';

export default function RunePage() {
  const [currentPage, setCurrentPage] = useState<RunePage>({
    id: 'current',
    name: 'New Rune Page',
    primaryTreeId: 0,
    secondaryTreeId: 0,
    selectedRunes: {
      primaryRunes: [],
      secondaryRunes: []
    },
    statShards: {
      offense: 0,
      flex: 0,
      defense: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [savedPages, setSavedPages] = useState<RunePage[]>([]);
  const [showSavedPages, setShowSavedPages] = useState(false);
  const [runeTrees, setRuneTrees] = useState<RuneTreeApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRuneData = async () => {
      try {
        const runeApi = RuneAPI.getInstance();
        const trees = await runeApi.getRuneData('ja_JP');
        setRuneTrees(trees);
        
        const saved = JSON.parse(localStorage.getItem('runePages') || '[]');
        setSavedPages(saved);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading rune data:', err);
        setError('ルーンデータの読み込みに失敗しました');
        setLoading(false);
      }
    };

    loadRuneData();
  }, []);

  const primaryTree = runeTrees.find(tree => tree.id === currentPage.primaryTreeId);
  const secondaryTree = runeTrees.find(tree => tree.id === currentPage.secondaryTreeId);

  const updatePage = (updates: Partial<RunePage>) => {
    setCurrentPage(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const selectPrimaryTree = (treeId: number) => {
    updatePage({
      primaryTreeId: treeId,
      secondaryTreeId: currentPage.secondaryTreeId === treeId ? 0 : currentPage.secondaryTreeId,
      selectedRunes: {
        primaryRunes: [],
        secondaryRunes: currentPage.secondaryTreeId === treeId ? [] : currentPage.selectedRunes.secondaryRunes
      }
    });
  };

  const selectSecondaryTree = (treeId: number) => {
    if (treeId === currentPage.primaryTreeId) return;
    
    updatePage({
      secondaryTreeId: treeId,
      selectedRunes: {
        ...currentPage.selectedRunes,
        secondaryRunes: []
      }
    });
  };

  const selectPrimaryRune = (slotIndex: number, runeId: number) => {
    const newPrimaryRunes = [...currentPage.selectedRunes.primaryRunes];
    newPrimaryRunes[slotIndex] = runeId;
    
    updatePage({
      selectedRunes: {
        ...currentPage.selectedRunes,
        primaryRunes: newPrimaryRunes
      }
    });
  };

  const selectSecondaryRune = (runeId: number) => {
    const currentSecondary = currentPage.selectedRunes.secondaryRunes;
    let newSecondaryRunes;
    
    if (currentSecondary.includes(runeId)) {
      // Remove if already selected
      newSecondaryRunes = currentSecondary.filter(id => id !== runeId);
    } else if (currentSecondary.length < 2) {
      // Add if less than 2 selected
      newSecondaryRunes = [...currentSecondary, runeId];
    } else {
      // Replace first if 2 already selected
      newSecondaryRunes = [currentSecondary[1], runeId];
    }
    
    updatePage({
      selectedRunes: {
        ...currentPage.selectedRunes,
        secondaryRunes: newSecondaryRunes
      }
    });
  };

  const selectStatShard = (category: 'offense' | 'flex' | 'defense', shardId: number) => {
    updatePage({
      statShards: {
        ...currentPage.statShards,
        [category]: shardId
      }
    });
  };

  const savePage = () => {
    if (currentPage.primaryTreeId === 0) {
      alert('Please select a primary rune tree first!');
      return;
    }
    
    const newPage: RunePage = {
      ...currentPage,
      id: Date.now().toString()
    };
    
    const updatedPages = [...savedPages, newPage];
    setSavedPages(updatedPages);
    localStorage.setItem('runePages', JSON.stringify(updatedPages));
    alert('Rune page saved successfully!');
  };

  const loadPage = (page: RunePage) => {
    setCurrentPage(page);
    setShowSavedPages(false);
  };

  const deletePage = (pageId: string) => {
    if (confirm('Are you sure you want to delete this rune page?')) {
      const updatedPages = savedPages.filter(p => p.id !== pageId);
      setSavedPages(updatedPages);
      localStorage.setItem('runePages', JSON.stringify(updatedPages));
    }
  };

  const resetPage = () => {
    if (confirm('Reset current rune page?')) {
      setCurrentPage({
        id: 'current',
        name: 'New Rune Page',
        primaryTreeId: 0,
        secondaryTreeId: 0,
        selectedRunes: {
          primaryRunes: [],
          secondaryRunes: []
        },
        statShards: {
          offense: 0,
          flex: 0,
          defense: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">ルーンデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">エラー: {error}</p>
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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">LoL Rune Builder</h1>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white">
                Item Search
              </Link>
              <Link href="/builder" className="text-gray-300 hover:text-white">
                Item Builder
              </Link>
              <Link href="/runes" className="text-blue-400 font-medium">
                Runes
              </Link>
              <Link href="/champions" className="text-gray-300 hover:text-white">
                Champions
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <input
              type="text"
              value={currentPage.name}
              onChange={(e) => updatePage({ name: e.target.value })}
              className="text-2xl font-bold bg-transparent border-b border-gray-600 focus:border-blue-400 outline-none"
              placeholder="Rune Page Name"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowSavedPages(!showSavedPages)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Saved Pages ({savedPages.length})
            </button>
            <button
              onClick={savePage}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Save Page
            </button>
            <button
              onClick={resetPage}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {showSavedPages && (
          <RunePageManager
            savedPages={savedPages}
            onLoadPage={loadPage}
            onDeletePage={deletePage}
            onClose={() => setShowSavedPages(false)}
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Primary Rune Tree */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Primary Tree</h2>
            
            <RuneTreeSelection
              trees={runeTrees}
              selectedTreeId={currentPage.primaryTreeId}
              onSelectTree={selectPrimaryTree}
              isPrimary={true}
            />

            {primaryTree && (
              <RuneSlotSelection
                tree={primaryTree}
                selectedRunes={currentPage.selectedRunes.primaryRunes}
                onSelectRune={selectPrimaryRune}
                isPrimary={true}
              />
            )}
          </div>

          {/* Secondary Rune Tree */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Secondary Tree</h2>
            
            <RuneTreeSelection
              trees={runeTrees.filter(tree => tree.id !== currentPage.primaryTreeId)}
              selectedTreeId={currentPage.secondaryTreeId}
              onSelectTree={selectSecondaryTree}
              isPrimary={false}
            />

            {secondaryTree && (
              <RuneSlotSelection
                tree={secondaryTree}
                selectedRunes={currentPage.selectedRunes.secondaryRunes}
                onSelectRune={(_, runeId) => selectSecondaryRune(runeId)}
                isPrimary={false}
              />
            )}
          </div>
        </div>

        {/* Stat Shards */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">統計シャード</h2>
          <StatShardSelection
            statShards={RuneAPI.getInstance().getStatShards()}
            selectedShards={currentPage.statShards}
            onSelectShard={selectStatShard}
          />
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">ルーンページ概要</h2>
          <div className="text-sm text-gray-300 space-y-2">
            <p>メインツリー: {primaryTree?.name || '未選択'}</p>
            <p>サブツリー: {secondaryTree?.name || '未選択'}</p>
            <p>メインルーン: {currentPage.selectedRunes.primaryRunes.length}/4</p>
            <p>サブルーン: {currentPage.selectedRunes.secondaryRunes.length}/2</p>
            <p>統計シャード: {Object.values(currentPage.statShards).filter(id => id > 0).length}/3</p>
          </div>
        </div>
      </main>
    </div>
  );
}