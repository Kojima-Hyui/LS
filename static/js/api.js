// API.js - Riot API / Data Dragon API呼び出し

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com/cdn";
let currentVersion = "14.1.1"; // デフォルトバージョン

// 最新バージョンを取得
async function fetchLatestVersion() {
  try {
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const versions = await response.json();
    currentVersion = versions[0];
    return currentVersion;
  } catch (error) {
    console.error("バージョン取得エラー:", error);
    return currentVersion;
  }
}

// デバッグ用API テスト関数
async function testDebugAPI() {
  try {
    console.log('Testing debug API...');
    const response = await fetch('/api/debug');
    const data = await response.json();
    console.log('Debug API Response:', data);
    alert('Debug info logged to console. Check F12 developer tools.');
  } catch (error) {
    console.error('Debug API Error:', error);
    alert(`Debug API failed: ${error.message}`);
  }
}

// テスト用API テスト関数
async function testBasicAPI() {
  try {
    console.log('Testing basic API...');
    const response = await fetch('/api/test');
    const data = await response.json();
    console.log('Test API Response:', data);
    alert('Basic API is working! Check console for details.');
  } catch (error) {
    console.error('Test API Error:', error);
    alert(`Test API failed: ${error.message}`);
  }
}

// 最小限APIテスト
async function testMinimalAPI() {
  try {
    console.log('Testing minimal match API...');
    const response = await fetch('/api/match_minimal?game_name=Hide%20on%20Bush&tag_line=KR1');
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Minimal API Response:', data);
    alert('Minimal API test completed! Check console for details.');
  } catch (error) {
    console.error('Minimal API Error:', error);
    alert(`Minimal API failed: ${error.message}`);
  }
}

// 戦績取得
async function fetchMatchHistory() {
  const riotId = document.getElementById("game-riot-id").value.trim();
  const loadingEl = document.getElementById("match-loading");
  const errorEl = document.getElementById("match-error");
  const resultEl = document.getElementById("match-result");

  if (!riotId || !riotId.includes("#")) {
    errorEl.textContent =
      "⚠️ Riot IDを「ゲーム名#タグライン」形式で入力してください";
    errorEl.style.display = "block";
    loadingEl.style.display = "none";
    resultEl.style.display = "none";
    return;
  }

  loadingEl.style.display = "block";
  errorEl.style.display = "none";
  resultEl.style.display = "none";

  const [gameName, tagLine] = riotId.split("#");

  try {
    let response;
    let apiEndpoint;
    
    // まずは基本版APIを試行
    apiEndpoint = `/api/match_history_simple?game_name=${encodeURIComponent(
      gameName
    )}&tag_line=${encodeURIComponent(tagLine)}`;
    
    console.log('Trying Simple API endpoint:', apiEndpoint);
    response = await fetch(apiEndpoint);

    // シンプル版が失敗した場合は通常版を試行
    if (!response.ok) {
      console.warn('Simple API failed, trying regular API...');
      apiEndpoint = `/api/match_history?game_name=${encodeURIComponent(
        gameName
      )}&tag_line=${encodeURIComponent(tagLine)}`;
      
      response = await fetch(apiEndpoint);
      
      // 通常版も失敗した場合は独立版を試行
      if (!response.ok) {
        console.warn('Regular API failed, trying independent API...');
        apiEndpoint = `/api/match_history_independent?game_name=${encodeURIComponent(
          gameName
        )}&tag_line=${encodeURIComponent(tagLine)}`;
        
        response = await fetch(apiEndpoint);
        
        if (!response.ok) {
          throw new Error(`All APIs failed! Last status: ${response.status}`);
        }
      }
    }

    const data = await response.json();
    loadingEl.style.display = "none";

    if (data.error) {
      errorEl.textContent = `❌ ${data.error}`;
      errorEl.style.display = "block";
      return;
    }

    allMatches = data.matches || [];
    displayMatchHistory(allMatches);
    resultEl.style.display = "block";
    
    // フィルターを表示
    document.getElementById("match-filters").style.display = "block";
    
    console.log(`✅ ${allMatches.length}試合の戦績を取得しました`);
  } catch (error) {
    loadingEl.style.display = "none";
    errorEl.textContent = `❌ エラーが発生しました: ${error.message}`;
    errorEl.style.display = "block";
  }
}

// 戦績表示
function displayMatchHistory(matches) {
  const resultEl = document.getElementById("match-result");

  if (!matches || matches.length === 0) {
    resultEl.innerHTML = "<p>試合データが見つかりませんでした。</p>";
    return;
  }

  let html = `<h3>📊 試合履歴（${matches.length}試合）</h3>`;

  matches.forEach((match, index) => {
    const stats = match.stats || {};
    const isArena = match.game_mode === "CHERRY";
    
    // Arena: 順位表示、通常: 勝敗表示
    let resultText, resultClass;
    if (isArena) {
      const placement = stats.placement || "?";
      resultClass = placement <= 2 ? "team-blue" : (placement <= 4 ? "team-neutral" : "team-red");
      resultText = `🏆 ${placement}位`;
    } else {
      const win = stats.win;
      resultClass = win ? "team-blue" : "team-red";
      resultText = win ? "🏆 勝利" : "💀 敗北";
    }
    
    // レーン情報（CLASSICモードのみ）
    const position = stats.position;
    const laneEmoji = {
      'TOP': '⬆️',
      'JUNGLE': '🌳',
      'MIDDLE': '⭐',
      'BOTTOM': '⬇️',
      'UTILITY': '🛡️'
    };
    const laneText = (match.game_mode === "CLASSIC" && position) 
      ? ` | ${laneEmoji[position] || ''} ${position}` 
      : '';
    
    // チャンピオンアイコンURL
    const championIcon = stats.champion 
      ? `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${stats.champion}.png`
      : "";
    
    // ゲームモード名を日本語に変換
    const modeNames = {
      'CLASSIC': 'ランク/ノーマル',
      'ARAM': 'ARAM',
      'CHERRY': 'Arena',
      'URF': 'URF',
      'NEXUSBLITZ': 'Nexus Blitz',
      'ONEFORALL': 'ワンフォーオール',
      'TUTORIAL': 'チュートリアル',
      'SWIFTPLAY': 'スイフト'
    };
    const modeName = modeNames[match.game_mode] || match.game_mode;

    // パフォーマンススコア表示
    const performanceScore = match.performance_score || 0;
    const scoreColor = performanceScore >= 70 ? '#48bb78' : performanceScore >= 50 ? '#ecc94b' : '#f56565';

    // アイテム表示
    const items = stats.items || [];
    const itemsHtml = items.slice(0, 6).map(itemId => 
      `<img src="https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png" 
       alt="Item ${itemId}" style="width: 32px; height: 32px; margin: 2px; border-radius: 4px;" 
       onerror="this.style.display='none'">`
    ).join('');

    html += `
      <div class="match-card ${resultClass}" style="margin: 15px 0; padding: 15px; border-radius: 8px; border: 2px solid ${resultClass === 'team-blue' ? '#3182ce' : '#e53e3e'};">
        <div class="match-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4>${resultText} - ${modeName} (${match.game_duration})${laneText}</h4>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: ${scoreColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
              スコア: ${performanceScore}
            </span>
            <button onclick="showMatchDetail('${match.match_id}')" class="detail-button">
              詳細表示
            </button>
          </div>
        </div>
        
        <div class="match-content" style="display: flex; align-items: center; gap: 15px;">
          ${championIcon ? `<img src="${championIcon}" alt="${stats.champion}" style="width: 64px; height: 64px; border-radius: 8px;" onerror="this.style.display='none'">` : ''}
          
          <div class="champion-info" style="flex: 1;">
            <strong style="font-size: 16px;">${stats.champion || "不明"} (Lv.${stats.champion_level || 1})</strong><br>
            <span style="color: #9ae6b4; font-size: 14px;">KDA: ${stats.kills || 0}/${stats.deaths || 0}/${stats.assists || 0} (${stats.kda || 0})</span><br>
            <span style="font-size: 12px;">CS: ${stats.cs || 0} (${stats.cs_per_minute || 0}/min) | ダメージ: ${
              stats.damage?.total_damage_to_champions ? stats.damage.total_damage_to_champions.toLocaleString() : "N/A"
            }</span><br>
            <span style="font-size: 12px;">ゴールド: ${stats.gold ? stats.gold.toLocaleString() : "N/A"} (${stats.gold_per_minute || 0}/min) | ビジョン: ${stats.vision?.vision_score || 0}</span>
          </div>
          
          <div class="items-display" style="display: flex; flex-direction: column; align-items: center;">
            <div style="margin-bottom: 5px; font-size: 12px; color: #a0aec0;">アイテム</div>
            <div class="items-grid">
              ${itemsHtml}
            </div>
          </div>
        </div>
        
        ${stats.largest_multi_kill > 1 || stats.penta_kills > 0 || stats.quadra_kills > 0 ? `
          <div class="achievements-badge">
            <span style="font-size: 12px; color: #ffd700; font-weight: bold;">
              ${stats.penta_kills > 0 ? '🏆 PENTAKILL! ' : ''}
              ${stats.quadra_kills > 0 ? '⭐ QUADRAKILL! ' : ''}
              ${stats.triple_kills > 0 ? '🔥 Triple Kill ' : ''}
              ${stats.first_blood_kill ? '🩸 First Blood ' : ''}
            </span>
          </div>
        ` : ''}
      </div>
    `;
  });

  resultEl.innerHTML = html;
}

// 試合詳細表示
async function showMatchDetail(matchId) {
  console.log('試合詳細を取得中:', matchId);
  
  // 暫定対応: 新APIエンドポイントがデプロイされるまで、既存データから詳細モーダルを表示
  const matchData = allMatches.find(match => match.match_id === matchId);
  if (matchData) {
    console.log('既存データから詳細表示:', matchData);
    displaySimpleMatchDetail(matchData);
    return;
  }
  
  try {
    const apiUrl = `/api/match_detail?match_id=${encodeURIComponent(matchId)}`;
    console.log('APIコール:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('レスポンス:', response.status, response.statusText);
    
    if (!response.ok) {
      // 404の場合は既存データで表示
      if (response.status === 404) {
        console.log('新APIが利用できません。既存データで表示します。');
        const matchData = allMatches.find(match => match.match_id === matchId);
        if (matchData) {
          displaySimpleMatchDetail(matchData);
          return;
        }
      }
      
      const errorText = await response.text();
      console.error('API エラーレスポンス:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('取得データ:', data);
    
    if (data.error) {
      alert(`エラー: ${data.error}`);
      return;
    }
    
    displayMatchDetailModal(data);
    
  } catch (error) {
    console.error('試合詳細取得エラー:', error);
    // エラーの場合も既存データで表示を試行
    const matchData = allMatches.find(match => match.match_id === matchId);
    if (matchData) {
      console.log('エラーのため既存データで表示');
      displaySimpleMatchDetail(matchData);
    } else {
      alert(`試合詳細の取得に失敗しました: ${error.message}`);
    }
  }
}

// 簡単な試合詳細表示（既存データ用）
function displaySimpleMatchDetail(matchData) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.className = 'match-detail-modal';
  modalContent.style.cssText = `
    border-radius: 12px;
    max-width: 800px;
    max-height: 90vh;
    width: 100%;
    overflow-y: auto;
    padding: 24px;
    color: white;
  `;
  
  const stats = matchData.stats || {};
  const isArena = matchData.game_mode === "CHERRY";
  
  let resultText, resultClass;
  if (isArena) {
    const placement = stats.placement || "?";
    resultClass = placement <= 2 ? "team-blue" : (placement <= 4 ? "team-neutral" : "team-red");
    resultText = `🏆 ${placement}位`;
  } else {
    const win = stats.win;
    resultClass = win ? "team-blue" : "team-red";
    resultText = win ? "🏆 勝利" : "💀 敗北";
  }
  
  const championIcon = stats.champion 
    ? `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${stats.champion}.png`
    : "";
  
  const items = stats.items || [];
  const itemsHtml = items.slice(0, 6).map(itemId => 
    `<img src="https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png" 
     alt="Item ${itemId}" style="width: 48px; height: 48px; margin: 2px; border-radius: 4px;" 
     onerror="this.style.display='none'">`
  ).join('');
  
  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #4299e1;">試合詳細</h2>
      <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
              class="close-button">
        閉じる
      </button>
    </div>
    
    <div style="text-align: center; margin-bottom: 20px;">
      <div class="match-card ${resultClass}" style="padding: 20px; margin: 0;">
        <h3>${resultText} - ${matchData.game_mode} (${matchData.game_duration})</h3>
        
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin: 20px 0;">
          ${championIcon ? `<img src="${championIcon}" alt="${stats.champion}" style="width: 80px; height: 80px; border-radius: 12px;">` : ''}
          
          <div style="text-align: left;">
            <h4 style="margin: 0; color: white;">${stats.champion || "不明"} (Lv.${stats.champion_level || 1})</h4>
            <div style="margin: 10px 0;">
              <span style="color: #9ae6b4; font-size: 18px; font-weight: bold;">
                KDA: ${stats.kills || 0}/${stats.deaths || 0}/${stats.assists || 0} (${stats.kda || 0})
              </span>
            </div>
            
            <div style="font-size: 14px; color: #e2e8f0;">
              <div>CS: ${stats.cs || 0} (${stats.cs_per_minute || 0}/min)</div>
              <div>ダメージ: ${stats.damage?.total_damage_to_champions ? stats.damage.total_damage_to_champions.toLocaleString() : "N/A"}</div>
              <div>ゴールド: ${stats.gold ? stats.gold.toLocaleString() : "N/A"} (${stats.gold_per_minute || 0}/min)</div>
              <div>ビジョンスコア: ${stats.vision?.vision_score || 0}</div>
            </div>
            
            ${matchData.performance_score ? `
              <div style="margin-top: 10px;">
                <span class="performance-score ${matchData.performance_score >= 70 ? 'excellent' : matchData.performance_score >= 50 ? 'good' : 'poor'}">
                  パフォーマンススコア: ${matchData.performance_score}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
        
        ${itemsHtml ? `
          <div style="margin-top: 20px;">
            <h4 style="color: #a0aec0; margin-bottom: 10px;">アイテム</h4>
            <div style="display: flex; justify-content: center; gap: 4px;">
              ${itemsHtml}
            </div>
          </div>
        ` : ''}
        
        ${stats.largest_multi_kill > 1 || stats.penta_kills > 0 || stats.quadra_kills > 0 ? `
          <div class="achievements-badge" style="margin-top: 20px;">
            <span style="font-size: 14px; color: #ffd700; font-weight: bold;">
              ${stats.penta_kills > 0 ? '🏆 PENTAKILL! ' : ''}
              ${stats.quadra_kills > 0 ? '⭐ QUADRAKILL! ' : ''}
              ${stats.triple_kills > 0 ? '🔥 Triple Kill ' : ''}
              ${stats.first_blood_kill ? '🩸 First Blood ' : ''}
            </span>
          </div>
        ` : ''}
      </div>
    </div>
    
    <div style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px;">
      ※ 簡易表示モード - 全プレイヤー詳細は今後のアップデートで利用可能になります
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // ESCキーで閉じる
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// 試合詳細モーダル表示
function displayMatchDetailModal(data) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.className = 'match-detail-modal';
  modalContent.style.cssText = `
    border-radius: 12px;
    max-width: 1200px;
    max-height: 90vh;
    width: 100%;
    overflow-y: auto;
    padding: 24px;
    color: white;
  `;
  
  const matchInfo = data.match_info;
  const blueTeam = data.participants.blue_team;
  const redTeam = data.participants.red_team;
  
  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #4299e1;">試合詳細</h2>
      <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
              class="close-button">
        閉じる
      </button>
    </div>
    
    <div style="margin-bottom: 20px; padding: 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
      <h3 style="margin: 0 0 10px 0;">ゲーム情報</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 14px;">
        <div>ゲーム時間: ${formatGameDuration(matchInfo.game_duration)}</div>
        <div>ゲームモード: ${matchInfo.game_mode}</div>
        <div>マップ: ${getMapName(matchInfo.map_id)}</div>
        <div>バージョン: ${matchInfo.game_version}</div>
      </div>
    </div>
    
    <div class="team-details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      ${renderTeamDetails('Blue Team', blueTeam, matchInfo.teams[0], '#3182ce')}
      ${renderTeamDetails('Red Team', redTeam, matchInfo.teams[1], '#e53e3e')}
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // ESCキーで閉じる
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// チーム詳細レンダリング
function renderTeamDetails(teamName, players, teamStats, teamColor) {
  const objectives = teamStats.objectives || {};
  
  const playersHtml = players.map(player => {
    const stats = player.stats;
    const scoreColor = player.performance_score >= 70 ? '#48bb78' : player.performance_score >= 50 ? '#ecc94b' : '#f56565';
    
    const itemsHtml = (stats.items || []).slice(0, 6).map(itemId => 
      `<img src="https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png" 
       alt="Item ${itemId}" style="width: 24px; height: 24px; margin: 1px; border-radius: 3px;" 
       onerror="this.style.display='none'">`
    ).join('');
    
    return `
      <div class="player-card">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <img src="https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${stats.champion}.png" 
               alt="${stats.champion}" class="champion-portrait" style="width: 40px; height: 40px;">
          <div style="flex: 1;">
            <div style="font-weight: bold; color: ${teamColor};">${player.riot_id}</div>
            <div style="font-size: 12px; color: #a0aec0;">${stats.champion} (Lv.${stats.champion_level})</div>
          </div>
          <div class="performance-score ${player.performance_score >= 70 ? 'excellent' : player.performance_score >= 50 ? 'good' : 'poor'}">
            ${player.performance_score}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px;">
          <div>KDA: ${stats.kills}/${stats.deaths}/${stats.assists} (${stats.kda})</div>
          <div>CS: ${stats.cs} (${stats.cs_per_minute}/min)</div>
          <div>ダメージ: ${stats.damage?.total_damage_to_champions?.toLocaleString() || 'N/A'}</div>
          <div>ゴールド: ${stats.gold?.toLocaleString() || 'N/A'}</div>
          <div>ビジョン: ${stats.vision?.vision_score || 0}</div>
          <div>ワード: ${stats.vision?.wards_placed || 0}</div>
        </div>
        
        <div style="margin-top: 8px;">
          <div style="font-size: 11px; color: #a0aec0; margin-bottom: 4px;">アイテム:</div>
          <div>${itemsHtml}</div>
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <div style="border: 2px solid ${teamColor}; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 16px 0; color: ${teamColor};">
        ${teamName} ${teamStats.win ? '🏆 勝利' : '💀 敗北'}
      </h3>
      
      <div style="margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">オブジェクト</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 12px;">
          <div>🐉 ドラゴン: ${objectives.dragon || 0}</div>
          <div>👑 バロン: ${objectives.baron || 0}</div>
          <div>🛡️ ヘラルド: ${objectives.riftHerald || 0}</div>
          <div>🏰 タワー: ${objectives.tower || 0}</div>
        </div>
      </div>
      
      ${playersHtml}
    </div>
  `;
}

// ヘルパー関数
function formatGameDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getMapName(mapId) {
  const mapNames = {
    11: "サモナーズリフト",
    12: "ハウリングアビス (ARAM)",
    21: "Nexus Blitz",
    22: "Teamfight Tactics",
    30: "Arena"
  };
  return mapNames[mapId] || `マップ ${mapId}`;
}

// フィルター適用
let allMatches = [];  // 元データを保持

function applyFilters() {
  if (!allMatches.length) return;

  const mode = document.getElementById("filter-mode").value;
  const result = document.getElementById("filter-result").value;

  let filtered = [...allMatches];

  // ゲームモードでフィルター
  if (mode) {
    filtered = filtered.filter((m) => m.game_mode === mode);
  }

  // 勝敗でフィルター
  if (result === "win") {
    filtered = filtered.filter((m) => m.stats?.win === true);
  } else if (result === "loss") {
    filtered = filtered.filter((m) => m.stats?.win === false);
  }

  console.log(`🔍 フィルター適用: ${allMatches.length}試合 → ${filtered.length}試合`);
  displayMatchHistory(filtered);
}

// フィルターをリセット
function resetMatchFilters() {
  document.getElementById("filter-mode").value = "";
  document.getElementById("filter-result").value = "";
  displayMatchHistory(allMatches);
  console.log(`🔄 フィルターをリセットしました`);
}

// 現在の試合情報取得
async function fetchCurrentGame() {
  const riotId = document.getElementById("current-game-riot-id").value.trim();
  const loadingEl = document.getElementById("current-loading");
  const errorEl = document.getElementById("current-error");
  const resultEl = document.getElementById("current-result");

  if (!riotId || !riotId.includes("#")) {
    errorEl.textContent =
      "⚠️ Riot IDを「ゲーム名#タグライン」形式で入力してください";
    errorEl.style.display = "block";
    loadingEl.style.display = "none";
    resultEl.style.display = "none";
    return;
  }

  loadingEl.style.display = "block";
  errorEl.style.display = "none";
  resultEl.style.display = "none";

  const [gameName, tagLine] = riotId.split("#");

  try {
    const response = await fetch(
      `/api/current_game?game_name=${encodeURIComponent(
        gameName
      )}&tag_line=${encodeURIComponent(tagLine)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    loadingEl.style.display = "none";

    if (data.error) {
      errorEl.textContent = `❌ ${data.error}`;
      errorEl.style.display = "block";
      return;
    }

    displayCurrentGame(data);
    resultEl.style.display = "block";
  } catch (error) {
    loadingEl.style.display = "none";
    errorEl.textContent = `❌ エラーが発生しました: ${error.message}`;
    errorEl.style.display = "block";
  }
}

// 現在の試合表示
function displayCurrentGame(data) {
  const resultEl = document.getElementById("current-result");
  const blueTeam = data.participants.filter((p) => p.teamId === 100);
  const redTeam = data.participants.filter((p) => p.teamId === 200);

  let html = `<h3>🎯 試合情報 - ${data.mode}</h3>`;

  html += `<div class="team team-blue"><h3>💙 Blue Team</h3>`;
  blueTeam.forEach((p) => {
    html += `
      <div class="player">
        <strong>${p.riotId}</strong> - ${p.champion}<br>
        <span style="color: #9ae6b4;">${p.rank}</span>
      </div>
    `;
  });
  html += `</div>`;

  html += `<div class="team team-red"><h3>❤️ Red Team</h3>`;
  redTeam.forEach((p) => {
    html += `
      <div class="player">
        <strong>${p.riotId}</strong> - ${p.champion}<br>
        <span style="color: #9ae6b4;">${p.rank}</span>
      </div>
    `;
  });
  html += `</div>`;

  resultEl.innerHTML = html;
}

// レーン選択UI制御
function toggleLaneInputs() {
  const enableLaneBalance = document.getElementById("enable-lane-balance").checked;
  const laneInputsEl = document.getElementById("lane-inputs");
  
  if (enableLaneBalance) {
    laneInputsEl.style.display = "block";
    updatePlayerLaneSelection();
  } else {
    laneInputsEl.style.display = "none";
  }
}

function updatePlayerLaneSelection() {
  const playersText = document.getElementById("balance-players").value.trim();
  const players = playersText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p);

  const container = document.getElementById("player-lane-selection");
  container.innerHTML = "";

  const lanes = [
    { id: "top", name: "トップ", emoji: "🛡️" },
    { id: "jungle", name: "ジャングル", emoji: "🌲" },
    { id: "mid", name: "ミッド", emoji: "⚡" },
    { id: "adc", name: "ADC", emoji: "🏹" },
    { id: "support", name: "サポート", emoji: "🛡️" }
  ];

  players.forEach((player, index) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = "player-lane-item";
    
    const playerName = document.createElement("div");
    playerName.className = "player-name";
    playerName.textContent = player;
    
    const laneOptions = document.createElement("div");
    laneOptions.className = "lane-options";
    
    lanes.forEach(lane => {
      const laneOption = document.createElement("label");
      laneOption.className = "lane-option";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = `player-${index}-lanes`;
      checkbox.value = lane.id;
      checkbox.onchange = () => updateLaneOptionStyle(laneOption, checkbox.checked);
      
      const text = document.createElement("span");
      text.textContent = `${lane.emoji} ${lane.name}`;
      
      laneOption.appendChild(checkbox);
      laneOption.appendChild(text);
      laneOptions.appendChild(laneOption);
    });
    
    playerDiv.appendChild(playerName);
    playerDiv.appendChild(laneOptions);
    container.appendChild(playerDiv);
  });
}

function updateLaneOptionStyle(laneOption, isSelected) {
  if (isSelected) {
    laneOption.classList.add("selected");
  } else {
    laneOption.classList.remove("selected");
  }
}

function getPlayerLanePreferences() {
  const players = document.getElementById("balance-players").value
    .split("\n")
    .map(p => p.trim())
    .filter(p => p);
    
  const preferences = {};
  
  players.forEach((player, index) => {
    const checkboxes = document.querySelectorAll(`input[name="player-${index}-lanes"]:checked`);
    const selectedLanes = Array.from(checkboxes).map(cb => cb.value);
    preferences[player] = selectedLanes;
  });
  
  return preferences;
}

// チーム組み分け
async function balanceTeams() {
  const playersText = document.getElementById("balance-players").value.trim();
  const loadingEl = document.getElementById("balance-loading");
  const errorEl = document.getElementById("balance-error");
  const resultEl = document.getElementById("balance-result");

  if (!playersText) {
    errorEl.textContent = "⚠️ プレイヤーリストを入力してください";
    errorEl.style.display = "block";
    loadingEl.style.display = "none";
    resultEl.style.display = "none";
    return;
  }

  const players = playersText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p);

  if (players.length < 10) {
    errorEl.textContent = "⚠️ 10人のプレイヤーを入力してください";
    errorEl.style.display = "block";
    loadingEl.style.display = "none";
    resultEl.style.display = "none";
    return;
  }

  loadingEl.style.display = "block";
  errorEl.style.display = "none";
  resultEl.style.display = "none";

  try {
    const enableLaneBalance = document.getElementById("enable-lane-balance").checked;
    const requestBody = { players: players.slice(0, 10) };
    
    if (enableLaneBalance) {
      requestBody.lane_preferences = getPlayerLanePreferences();
    }

    const response = await fetch("/api/balance_teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    loadingEl.style.display = "none";

    if (data.error) {
      errorEl.textContent = `❌ ${data.error}`;
      errorEl.style.display = "block";
      return;
    }

    displayBalancedTeams(data);
    resultEl.style.display = "block";
  } catch (error) {
    loadingEl.style.display = "none";
    errorEl.textContent = `❌ エラーが発生しました: ${error.message}`;
    errorEl.style.display = "block";
  }
}

// 組み分け結果表示
function displayBalancedTeams(data) {
  const resultEl = document.getElementById("balance-result");
  const enableLaneBalance = document.getElementById("enable-lane-balance").checked;

  let html = `<h3>⚖️ チーム組み分け結果</h3>`;
  html += `<p>平均スコア差: ${data.score_difference || data.score_diff}</p>`;
  
  if (enableLaneBalance && data.lane_assignments) {
    html += `<p style="color: #fbbf24;">🎯 レーン配分を考慮した組み分けを実行しました</p>`;
  }

  html += `<div class="team-result-enhanced">`;
  
  html += `<div class="team-section team-blue">
    <div class="team-header">
      <div class="team-name">💙 Team 1</div>
      <div class="team-score">Score: ${data.team1_score || data.team1?.total_score}</div>
    </div>`;
    
  (data.team1?.players || data.team1).forEach((p) => {
    const assignedLane = enableLaneBalance && data.lane_assignments?.team1 ? 
      data.lane_assignments.team1[p.riotId || p.riot_id] : null;
    
    html += `
      <div class="player-with-lane">
        <div class="player-info">
          <strong>${p.riotId || p.riot_id}</strong><br>
          <span style="color: #9ae6b4;">${p.rank || p.rank_info} (Score: ${p.score || p.rank_score})</span>
        </div>
        ${assignedLane ? `<div class="player-lane-badge">${getLaneEmoji(assignedLane)} ${getLaneName(assignedLane)}</div>` : ''}
      </div>
    `;
  });
  html += `</div>`;

  html += `<div class="team-section team-red">
    <div class="team-header">
      <div class="team-name">❤️ Team 2</div>
      <div class="team-score">Score: ${data.team2_score || data.team2?.total_score}</div>
    </div>`;
    
  (data.team2?.players || data.team2).forEach((p) => {
    const assignedLane = enableLaneBalance && data.lane_assignments?.team2 ? 
      data.lane_assignments.team2[p.riotId || p.riot_id] : null;
    
    html += `
      <div class="player-with-lane">
        <div class="player-info">
          <strong>${p.riotId || p.riot_id}</strong><br>
          <span style="color: #9ae6b4;">${p.rank || p.rank_info} (Score: ${p.score || p.rank_score})</span>
        </div>
        ${assignedLane ? `<div class="player-lane-badge">${getLaneEmoji(assignedLane)} ${getLaneName(assignedLane)}</div>` : ''}
      </div>
    `;
  });
  html += `</div>`;
  
  html += `</div>`;

  resultEl.innerHTML = html;
}

function getLaneEmoji(lane) {
  const emojis = {
    'top': '🛡️',
    'jungle': '🌲',
    'mid': '⚡',
    'adc': '🏹',
    'support': '🛡️'
  };
  return emojis[lane] || '❓';
}

function getLaneName(lane) {
  const names = {
    'top': 'トップ',
    'jungle': 'ジャングル',
    'mid': 'ミッド',
    'adc': 'ADC',
    'support': 'サポート'
  };
  return names[lane] || lane;
}

// プレイヤーリストの変更を検知してレーン選択UIを更新
document.addEventListener("DOMContentLoaded", function() {
  const playersTextarea = document.getElementById("balance-players");
  if (playersTextarea) {
    playersTextarea.addEventListener("input", function() {
      const enableLaneBalance = document.getElementById("enable-lane-balance");
      if (enableLaneBalance && enableLaneBalance.checked) {
        updatePlayerLaneSelection();
      }
    });
  }
});
