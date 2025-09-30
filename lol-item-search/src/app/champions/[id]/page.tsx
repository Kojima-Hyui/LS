'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChampionDetail, ROLE_NAMES } from '@/types/champion';
import { ChampionAPI } from '@/lib/championApi';
import { cleanLoLText } from '@/lib/textUtils';
import Link from 'next/link';
import Image from 'next/image';

export default function ChampionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const championId = params?.id as string;
  
  const [champion, setChampion] = useState<ChampionDetail | null>(null);
  const [selectedSkin, setSelectedSkin] = useState(0);
  const [apiVersion, setApiVersion] = useState<string>('13.24.1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!championId) return;

    const loadChampionDetail = async () => {
      try {
        const championApi = ChampionAPI.getInstance();
        const version = await championApi.getLatestVersion();
        const championDetail = await championApi.getChampionDetail(championId, 'ja_JP');
        setChampion(championDetail);
        setApiVersion(version);
        setLoading(false);
      } catch (err) {
        console.error('Error loading champion detail:', err);
        setError('チャンピオン詳細の読み込みに失敗しました');
        setLoading(false);
      }
    };

    loadChampionDetail();
  }, [championId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">チャンピオン情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !champion) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'チャンピオンが見つかりませんでした'}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              戻る
            </button>
            <Link href="/champions" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              チャンピオン一覧
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const championApi = ChampionAPI.getInstance();
  const estimatedLanes = championApi.estimateLanes(champion);

  const getStatPercentage = (value: number, max: number = 10) => {
    return Math.min((value / max) * 100, 100);
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < difficulty ? 'text-yellow-400' : 'text-gray-600'}`}
      >
        ★
      </span>
    ));
  };

  const getLaneIcon = (lane: string) => {
    const icons = {
      'top': '🛡️',
      'jungle': '🌲', 
      'middle': '⚡',
      'bottom': '🏹',
      'utility': '💎'
    };
    return icons[lane as keyof typeof icons] || '❓';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">{champion.name} - {champion.title}</h1>
            <nav className="flex items-center space-x-4 ml-auto">
              <Link href="/champions" className="text-gray-300 hover:text-white">
                チャンピオン一覧
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-96 bg-cover bg-center bg-gray-800"
          style={{
            backgroundImage: `url(${championApi.getChampionSplashUrl(championId, selectedSkin)})`
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end gap-6">
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-yellow-400 flex-shrink-0">
                  <Image
                    src={championApi.getChampionImageUrl(champion.image.full, apiVersion)}
                    alt={champion.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{champion.name}</h1>
                  <p className="text-xl text-gray-300">{champion.title}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {/* Roles */}
                    <div className="flex gap-2">
                      {champion.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-600 bg-opacity-80 text-white text-sm rounded-full"
                        >
                          {ROLE_NAMES[tag as keyof typeof ROLE_NAMES] || tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Lanes */}
                    <div className="flex gap-1">
                      {estimatedLanes.map((lane, index) => (
                        <span
                          key={lane}
                          className="w-8 h-8 bg-gray-700 bg-opacity-80 rounded-full flex items-center justify-center text-sm"
                          title={lane}
                        >
                          {getLaneIcon(lane)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lore */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">ストーリー</h2>
              <p className="text-gray-300 leading-relaxed">
                {cleanLoLText(champion.lore)}
              </p>
            </section>

            {/* Abilities */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">スキル</h2>
              
              {/* Passive */}
              <div className="mb-8 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-yellow-500">
                    <Image
                      src={championApi.getPassiveImageUrl(champion.passive.image.full, apiVersion)}
                      alt={champion.passive.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">パッシブ</span>
                      <h3 className="font-semibold text-lg">{champion.passive.name}</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {cleanLoLText(champion.passive.description)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Spells */}
              <div className="space-y-6">
                {champion.spells.map((spell, index) => (
                  <div key={spell.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-blue-500">
                        <Image
                          src={championApi.getSpellImageUrl(spell.image.full, apiVersion)}
                          alt={spell.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {['Q', 'W', 'E', 'R'][index]}
                          </span>
                          <h3 className="font-semibold text-lg">{spell.name}</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">
                          {cleanLoLText(spell.description)}
                        </p>
                        
                        {/* Spell Stats */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                          {spell.cooldownBurn !== "0" && (
                            <span>CD: {spell.cooldownBurn}秒</span>
                          )}
                          {spell.costBurn !== "0" && spell.costBurn !== "No Cost" && (
                            <span>コスト: {spell.costBurn} {spell.costType || champion.partype}</span>
                          )}
                          {spell.rangeBurn !== "self" && spell.rangeBurn !== "0" && (
                            <span>射程: {spell.rangeBurn}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Champion Stats */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">チャンピオン情報</h3>
              
              {/* Difficulty */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">難易度</span>
                  <span className="text-white font-medium">{champion.info.difficulty}/5</span>
                </div>
                <div className="flex">
                  {getDifficultyStars(champion.info.difficulty)}
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-sm">攻撃</span>
                    <span className="text-white text-sm">{champion.info.attack}/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${getStatPercentage(champion.info.attack)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-sm">防御</span>
                    <span className="text-white text-sm">{champion.info.defense}/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${getStatPercentage(champion.info.defense)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-sm">魔法</span>
                    <span className="text-white text-sm">{champion.info.magic}/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${getStatPercentage(champion.info.magic)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Basic Stats */}
            <section className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">基本ステータス</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">体力:</span>
                  <span className="text-white">{champion.stats.hp} (+{champion.stats.hpperlevel}/レベル)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">マナ:</span>
                  <span className="text-white">{champion.stats.mp} (+{champion.stats.mpperlevel}/レベル)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">物理防御:</span>
                  <span className="text-white">{champion.stats.armor} (+{champion.stats.armorperlevel}/レベル)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">魔法防御:</span>
                  <span className="text-white">{champion.stats.spellblock} (+{champion.stats.spellblockperlevel}/レベル)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">攻撃力:</span>
                  <span className="text-white">{champion.stats.attackdamage} (+{champion.stats.attackdamageperlevel}/レベル)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">移動速度:</span>
                  <span className="text-white">{champion.stats.movespeed}</span>
                </div>
              </div>
            </section>

            {/* Skins */}
            {champion.skins && champion.skins.length > 1 && (
              <section className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">スキン</h3>
                <div className="grid grid-cols-2 gap-2">
                  {champion.skins.map((skin, index) => (
                    <button
                      key={skin.id}
                      onClick={() => setSelectedSkin(skin.num)}
                      className={`p-2 rounded text-xs text-left transition-colors ${
                        selectedSkin === skin.num
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {skin.name === "default" ? "クラシック" : skin.name}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}