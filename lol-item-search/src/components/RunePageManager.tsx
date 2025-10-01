'use client';

import { useState } from 'react';
import { RunePage } from '@/types/rune';
import { RuneAPI } from '@/lib/runeApi';

interface RunePageManagerProps {
  savedPages: RunePage[];
  onLoadPage: (page: RunePage) => void;
  onDeletePage: (pageId: string) => void;
  onClose: () => void;
}

export default function RunePageManager({ 
  savedPages, 
  onLoadPage, 
  onDeletePage, 
  onClose 
}: RunePageManagerProps) {
  const [showImportGuide, setShowImportGuide] = useState(false);
  const getTreeName = (treeId: number) => {
    // This is a simplified approach - in a full implementation, 
    // you'd want to pass the tree data down as props
    const treeNames: Record<number, string> = {
      8000: '精密',
      8100: 'ドミネーション', 
      8200: 'ソーサリー',
      8300: 'インスピレーション',
      8400: '不屈'
    };
    return treeNames[treeId] || '不明';
  };

  const exportPage = (page: RunePage) => {
    // LoL Client API用のフォーマット
    const runePageForImport = {
      name: page.name,
      primaryStyleId: page.primaryTreeId,
      subStyleId: page.secondaryTreeId,
      selectedPerkIds: [
        ...page.selectedRunes.primaryRunes,
        ...page.selectedRunes.secondaryRunes,
        page.statShards.offense,
        page.statShards.flex, 
        page.statShards.defense
      ]
    };
    
    const json = JSON.stringify(runePageForImport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.name.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')}_runepage.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (page: RunePage) => {
    const json = JSON.stringify(page, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      alert('Rune page copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const RuneImportGuideModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">LoL Rune Page Import Guide</h2>
          <button
            onClick={() => setShowImportGuide(false)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Important Note</h3>
              <p className="text-sm text-gray-300">Rune pages cannot be directly imported into League of Legends like item sets. However, you can use third-party apps or manually recreate them.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">🔄 Option 1: Third-Party Apps (Recommended)</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Use apps like <strong>Blitz.gg</strong>, <strong>Mobalytics</strong>, or <strong>Porofessor</strong> that can automatically import rune pages:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Download and install the app</li>
                  <li>Enable auto-import in settings</li>
                  <li>The app will automatically set up runes during champion select</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">✍️ Option 2: Manual Recreation</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Use the exported JSON data to manually recreate the rune page:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Open League of Legends client</li>
                  <li>Go to Collection → Runes</li>
                  <li>Create a new rune page</li>
                  <li>Select runes according to the exported data</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-300 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Copy the exported JSON to reference the exact rune IDs</li>
                <li>• Third-party apps are the most convenient for automatic imports</li>
                <li>• You can create unlimited rune pages manually</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showImportGuide && <RuneImportGuideModal />}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Saved Rune Pages</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportGuide(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              📖 Import Guide
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {savedPages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">No saved rune pages yet.</p>
              <p className="text-gray-500 text-sm mt-2">Create and save a rune page to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPages.map((page) => (
                <div
                  key={page.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {page.name}
                    </h3>
                    <button
                      onClick={() => onDeletePage(page.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>Primary:</span>
                      <span className="text-yellow-400">
                        {getTreeName(page.primaryTreeId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secondary:</span>
                      <span className="text-blue-400">
                        {getTreeName(page.secondaryTreeId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Runes:</span>
                      <span>
                        {page.selectedRunes.primaryRunes.length + page.selectedRunes.secondaryRunes.length}/6
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onLoadPage(page)}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => exportPage(page)}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      📥 Export
                    </button>
                    <button
                      onClick={() => copyToClipboard(page)}
                      className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}