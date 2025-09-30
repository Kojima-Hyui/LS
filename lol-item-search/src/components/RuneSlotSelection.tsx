'use client';

import { RuneTreeApiData, RuneApiData } from '@/lib/runeApi';
import { cleanLoLText } from '@/lib/textUtils';
import { useState } from 'react';

interface RuneSlotSelectionProps {
  tree: RuneTreeApiData;
  selectedRunes: number[];
  onSelectRune: (slotIndex: number, runeId: number) => void;
  isPrimary: boolean;
}

export default function RuneSlotSelection({ 
  tree, 
  selectedRunes, 
  onSelectRune, 
  isPrimary 
}: RuneSlotSelectionProps) {
  const [hoveredRune, setHoveredRune] = useState<RuneApiData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  const getRunesBySlot = (slotIndex: number) => {
    if (isPrimary) {
      return tree.slots[slotIndex]?.runes || [];
    } else {
      // Secondary tree: only show slots 1, 2, 3 (skip keystone)
      return tree.slots[slotIndex + 1]?.runes || [];
    }
  };

  const isRuneSelected = (runeId: number) => {
    return selectedRunes.includes(runeId);
  };

  const getSlotTitle = (slotIndex: number) => {
    if (isPrimary) {
      switch (slotIndex) {
        case 0: return 'Keystone';
        case 1: return 'Slot 1';
        case 2: return 'Slot 2'; 
        case 3: return 'Slot 3';
        default: return `Slot ${slotIndex + 1}`;
      }
    } else {
      switch (slotIndex) {
        case 0: return 'Secondary 1';
        case 1: return 'Secondary 2';
        case 2: return 'Secondary 3';
        default: return `Secondary ${slotIndex + 1}`;
      }
    }
  };

  const slotsToShow = isPrimary ? [0, 1, 2, 3] : [0, 1, 2];

  return (
    <>
      {/* Tooltip Portal */}
      {hoveredRune && (
        <div
          className="fixed w-80 bg-gray-900 border border-gray-600 rounded-lg p-4 shadow-xl pointer-events-none z-[9999]"
          style={{
            left: isPrimary ? tooltipPosition.x : tooltipPosition.x - 320,
            top: tooltipPosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          <h6 className="font-bold text-yellow-400 mb-2">
            {hoveredRune.name}
          </h6>
          <p className="text-sm text-gray-300 mb-2">
            {cleanLoLText(hoveredRune.shortDesc)}
          </p>
          <p className="text-xs text-gray-400">
            {cleanLoLText(hoveredRune.longDesc)}
          </p>
        </div>
      )}
    
    <div className="space-y-6">
      {slotsToShow.map((slotIndex) => {
        const runes = getRunesBySlot(slotIndex);
        if (runes.length === 0) return null;

        return (
          <div key={slotIndex} className="space-y-3">
            <h4 className="text-md font-medium text-gray-300">
              {getSlotTitle(slotIndex)}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {runes.map((rune) => (
                <button
                  key={rune.id}
                  onClick={() => onSelectRune(slotIndex, rune.id)}
                  onMouseEnter={(e) => {
                    setHoveredRune(rune);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({
                      x: isPrimary ? rect.right + 16 : rect.left - 16,
                      y: rect.top + rect.height / 2
                    });
                  }}
                  onMouseLeave={() => setHoveredRune(null)}
                  className={`p-3 rounded-lg border transition-all text-left hover:scale-[1.02] relative ${
                    isRuneSelected(rune.id)
                      ? 'border-yellow-400 bg-yellow-400/20 shadow-md'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50'
                  } ${
                    isPrimary && slotIndex === 0 
                      ? 'border-l-4 border-l-orange-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
                        alt={rune.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to text if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className="text-xs font-bold text-gray-300 hidden">
                        {rune.name.substring(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-white truncate">
                        {rune.name}
                      </h5>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {cleanLoLText(rune.shortDesc)}
                      </p>
                    </div>
                  </div>
                  
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}