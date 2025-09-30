'use client';

import { Item } from '@/types/item';
import { DDragonAPI } from '@/lib/ddragon';
import { getItemGroups } from '@/lib/groupConstraints';
import Image from 'next/image';

interface ItemCardProps {
  id: string;
  item: Item;
  onAddToBuild?: (id: string, item: Item) => void;
  showAddButton?: boolean;
  onIconClick?: (id: string, item: Item) => void;
  items?: Record<string, Item>;
}

export default function ItemCard({ id, item, onAddToBuild, showAddButton = false, onIconClick, items = {} }: ItemCardProps) {
  const ddragon = DDragonAPI.getInstance();
  const groups = getItemGroups(id, item);
  
  const handleAddToBuild = () => {
    if (onAddToBuild) {
      onAddToBuild(id, item);
    }
  };

  const formatStatValue = (value: number): string => {
    if (value === Math.floor(value)) {
      return value.toString();
    }
    return value.toFixed(1);
  };

  const getStatDisplayName = (statKey: string): string => {
    const statNames: Record<string, string> = {
      FlatHPPoolMod: 'Health',
      FlatMPPoolMod: 'Mana',
      FlatArmorMod: 'Armor',
      FlatSpellBlockMod: 'Magic Resist',
      FlatPhysicalDamageMod: 'Attack Damage',
      FlatMagicDamageMod: 'Ability Power',
      FlatMovementSpeedMod: 'Movement Speed',
      FlatAttackSpeedMod: 'Attack Speed',
      FlatCritChanceMod: 'Critical Strike Chance',
      FlatEXPBonus: 'Experience Bonus',
      rFlatHPModPerLevel: 'Health per Level',
      rFlatMPModPerLevel: 'Mana per Level',
      rFlatArmorModPerLevel: 'Armor per Level',
      rFlatSpellBlockModPerLevel: 'MR per Level',
      rFlatPhysicalDamageModPerLevel: 'AD per Level',
      rFlatMagicDamageModPerLevel: 'AP per Level',
      PercentHPPoolMod: 'Health %',
      PercentMPPoolMod: 'Mana %',
      PercentArmorMod: 'Armor %',
      PercentSpellBlockMod: 'Magic Resist %',
      PercentPhysicalDamageMod: 'Attack Damage %',
      PercentMagicDamageMod: 'Ability Power %',
      PercentMovementSpeedMod: 'Movement Speed %',
      PercentAttackSpeedMod: 'Attack Speed %',
      PercentCritChanceMod: 'Critical Strike Chance %',
      PercentLifeStealMod: 'Life Steal %',
      PercentSpellVampMod: 'Spell Vamp %',
      FlatEnergyPoolMod: 'Energy',
      rFlatEnergyModPerLevel: 'Energy per Level',
      FlatEnergyRegenMod: 'Energy Regen',
      rFlatEnergyRegenModPerLevel: 'Energy Regen per Level',
      PercentEnergyPoolMod: 'Energy %',
      PercentEnergyRegenMod: 'Energy Regen %'
    };
    return statNames[statKey] || statKey;
  };

  const cleanDescription = (description: string): string => {
    return description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow relative">
      {showAddButton && onAddToBuild && (
        <button
          onClick={handleAddToBuild}
          className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors z-10"
        >
          Add
        </button>
      )}
      
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="relative w-12 h-12 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 rounded transition-all"
          onClick={() => onIconClick?.(id, item)}
        >
          <Image
            src={ddragon.getItemImageUrl(item.image.full)}
            alt={item.name}
            fill
            className="rounded object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0 pr-12">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
          <p className="text-xs text-gray-600">ID: {id}</p>
          <p className="text-sm font-bold text-yellow-600">{item.gold.total}g</p>
        </div>
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.tags.slice(0, 4).map((tag, index) => (
            <span
              key={`${id}-tag-${tag}-${index}`}
              className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {groups.map((group, index) => (
            <span
              key={`${id}-group-${group}-${index}`}
              className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded"
            >
              {group}
            </span>
          ))}
        </div>
      )}

      {item.stats && Object.keys(item.stats).length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Stats:</h4>
          <div className="space-y-1">
            {Object.entries(item.stats).map(([statKey, value], index) => (
              <div key={`${id}-stat-${statKey}-${index}`} className="flex justify-between text-xs">
                <span className="text-gray-600 truncate">{getStatDisplayName(statKey)}:</span>
                <span className="text-gray-900 font-medium ml-2">
                  {statKey.includes('Percent') ? `${formatStatValue(value * 100)}%` : formatStatValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {item.plaintext && (
        <div className="mb-2">
          <p className="text-xs text-gray-600 leading-relaxed">
            {cleanDescription(item.plaintext)}
          </p>
        </div>
      )}

      {item.description && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Description:</h4>
          <div className="text-xs text-gray-600 leading-relaxed max-h-20 overflow-y-auto">
            {cleanDescription(item.description)}
          </div>
        </div>
      )}

      {item.effect && Object.keys(item.effect).length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Effects:</h4>
          <div className="space-y-1">
            {Object.entries(item.effect).map(([key, value], index) => (
              <div key={`${id}-effect-${key}-${index}`} className="text-xs text-gray-600">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {(item.from || item.into) && (
        <div className="mb-3 text-xs">
          {item.from && item.from.length > 0 && (
            <div className="mb-2">
              <div className="font-medium text-gray-700 mb-1">Builds from:</div>
              <div className="flex flex-wrap gap-1">
                {item.from.map((fromId, index) => {
                  const fromItem = items[fromId];
                  if (!fromItem) return null;
                  return (
                    <div
                      key={`${id}-from-${fromId}-${index}`}
                      className="cursor-pointer hover:ring-1 hover:ring-blue-400 rounded transition-all"
                      onClick={() => onIconClick?.(fromId, fromItem)}
                      title={fromItem.name}
                    >
                      <img
                        src={ddragon.getItemImageUrl(fromItem.image.full)}
                        alt={fromItem.name}
                        className="w-6 h-6 rounded border border-gray-300"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {item.into && item.into.length > 0 && (
            <div>
              <div className="font-medium text-gray-700 mb-1">Builds into:</div>
              <div className="flex flex-wrap gap-1">
                {item.into.map((intoId, index) => {
                  const intoItem = items[intoId];
                  if (!intoItem) return null;
                  return (
                    <div
                      key={`${id}-into-${intoId}-${index}`}
                      className="cursor-pointer hover:ring-1 hover:ring-blue-400 rounded transition-all"
                      onClick={() => onIconClick?.(intoId, intoItem)}
                      title={intoItem.name}
                    >
                      <img
                        src={ddragon.getItemImageUrl(intoItem.image.full)}
                        alt={intoItem.name}
                        className="w-6 h-6 rounded border border-gray-300"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}