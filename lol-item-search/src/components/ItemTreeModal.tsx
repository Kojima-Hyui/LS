'use client';

import { Item } from '@/types/item';
import { DDragonAPI } from '@/lib/ddragon';
import { useState } from 'react';
import React from 'react';

interface ItemTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  rootItem: { id: string; item: Item };
  items: Record<string, Item>;
  onItemClick: (itemId: string) => void;
}

export default function ItemTreeModal({ 
  isOpen, 
  onClose, 
  rootItem, 
  items, 
  onItemClick 
}: ItemTreeModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(rootItem.id);
  const ddragon = DDragonAPI.getInstance();

  // Reset selected item when a new modal is opened with a different root item
  React.useEffect(() => {
    if (isOpen) {
      setSelectedItemId(rootItem.id);
    }
  }, [isOpen, rootItem.id]);

  if (!isOpen) return null;

  const buildItemTree = (itemId: string, item: Item, visited: Set<string> = new Set()): any => {
    // Prevent infinite recursion by tracking visited items
    if (visited.has(itemId)) {
      return {
        id: itemId,
        item,
        children: []
      };
    }

    const newVisited = new Set([...visited, itemId]);

    const children = item.from?.map(fromId => {
      const fromItem = items[fromId];
      if (!fromItem) return null;
      return buildItemTree(fromId, fromItem, newVisited);
    }).filter(Boolean) || [];

    return {
      id: itemId,
      item,
      children
    };
  };

  const tree = buildItemTree(rootItem.id, rootItem.item);

  // Flatten tree into levels with parent-child relationships
  const flattenTreeByLevels = (node: any, level: number = 0, levels: any[][] = [], parentId?: string): any[][] => {
    if (!levels[level]) levels[level] = [];
    
    const nodeWithParent = {
      ...node,
      parentId,
      level
    };
    
    levels[level].push(nodeWithParent);

    if (node.children && node.children.length > 0 && level < 3) {
      node.children.forEach((child: any) => {
        flattenTreeByLevels(child, level + 1, levels, node.id);
      });
    }

    return levels;
  };

  const levels = flattenTreeByLevels(tree);
  const maxItemsInLevel = Math.max(...levels.map(level => level.length));
  
  // Calculate responsive sizing
  const containerWidth = 800;
  const itemBaseSize = Math.max(32, Math.min(64, containerWidth / (maxItemsInLevel + 2)));
  const levelSpacing = 80;

  const renderLevelBasedTree = () => {
    return (
      <div className="space-y-6">
        {levels.map((levelItems, levelIndex) => (
          <div key={`level-${levelIndex}`} className="flex flex-col items-center">
            {/* Level label */}
            <div className="text-xs text-gray-500 mb-2">
              {levelIndex === 0 ? 'Final Item' : `Level ${levelIndex} Components`}
            </div>
            
            {/* Items in this level */}
            <div 
              className="flex items-center justify-center gap-4 flex-wrap"
              style={{ maxWidth: '100%' }}
            >
              {levelItems.map((item: any, itemIndex: number) => {
                const isSelected = selectedItemId === item.id;
                const size = levelIndex === 0 ? itemBaseSize : Math.max(32, itemBaseSize - levelIndex * 8);
                
                return (
                  <div key={`${item.id}-level-${levelIndex}-${itemIndex}`} className="flex flex-col items-center">
                    {/* Item */}
                    <div
                      className={`relative cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        onItemClick(item.id);
                      }}
                    >
                      <div 
                        className="bg-gray-100 rounded border-2 border-gray-300 hover:border-blue-400 transition-colors"
                        style={{ width: size, height: size }}
                      >
                        <img
                          src={ddragon.getItemImageUrl(item.item.image.full)}
                          alt={item.item.name}
                          className="w-full h-full rounded object-cover"
                        />
                      </div>
                      
                      {/* Tooltip with recipe cost info */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">
                        {item.item.name}
                        <div className="text-yellow-400 text-xs">
                          {item.item.gold.total}g
                          {item.item.gold.base > 0 && (
                            <span className="text-green-400 ml-1">
                              (+{item.item.gold.base}g recipe)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Connection to child components - fixed height container */}
                    <div className="h-8 flex items-start justify-center mt-1">
                      {levelIndex < levels.length - 1 && item.children && item.children.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap justify-center">
                          {item.children.map((child: any, childIndex: number) => (
                            <div 
                              key={`${item.id}-arrow-${child.id}-${childIndex}`}
                              className="relative"
                            >
                              <div 
                                className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
                                onClick={() => {
                                  setSelectedItemId(child.id);
                                  onItemClick(child.id);
                                }}
                                title={`→ ${child.item.name}`}
                              >
                                <img
                                  src={ddragon.getItemImageUrl(child.item.image.full)}
                                  alt={child.item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Connection lines to next level */}
            {levelIndex < levels.length - 1 && (
              <div className="w-full h-8 relative flex items-center justify-center">
                <div className="absolute w-full h-px bg-gray-300 top-1/2"></div>
                
                <div className="bg-gray-400 w-3 h-3 rounded-full z-10 flex items-center justify-center">
                  <div className="text-xs text-white font-bold">↓</div>
                </div>
                
                <div className="absolute top-full mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                  Recipe Components
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const selectedItem = items[selectedItemId];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-full w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Item Creation Tree: {rootItem.item.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex">
          {/* Tree visualization */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="min-h-96 py-4">
              {renderLevelBasedTree()}
            </div>
          </div>

          {/* Selected item details */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
            {selectedItem && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16">
                    <img
                      src={ddragon.getItemImageUrl(selectedItem.image.full)}
                      alt={selectedItem.name}
                      className="w-full h-full rounded object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedItem.name}</h3>
                    <p className="text-sm text-yellow-600 font-medium">{selectedItem.gold.total}g</p>
                  </div>
                </div>

                {selectedItem.plaintext && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
                    <p className="text-sm text-gray-600">{selectedItem.plaintext}</p>
                  </div>
                )}

                {selectedItem.from && selectedItem.from.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recipe:</h4>
                    <div className="space-y-1">
                      {selectedItem.from.map((fromId, index) => {
                        const fromItem = items[fromId];
                        if (!fromItem) return null;
                        return (
                          <div key={`recipe-${selectedItemId}-${fromId}-${index}`} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6">
                              <img
                                src={ddragon.getItemImageUrl(fromItem.image.full)}
                                alt={fromItem.name}
                                className="w-full h-full rounded object-cover"
                              />
                            </div>
                            <span className="text-gray-700">{fromItem.name}</span>
                            <span className="text-yellow-600 font-medium ml-auto">{fromItem.gold.total}g</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    onItemClick(selectedItemId);
                    onClose();
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Go to Item in Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}