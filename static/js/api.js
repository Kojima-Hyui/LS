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
    const response = await fetch(
      `/api/match_history?game_name=${encodeURIComponent(
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

    html += `
      <div class="team ${resultClass}" style="margin: 15px 0;">
        <h4>${resultText} - ${modeName} (${match.game_duration})${laneText}</h4>
        <div class="player" style="display: flex; align-items: center; gap: 15px;">
          ${championIcon ? `<img src="${championIcon}" alt="${stats.champion}" style="width: 64px; height: 64px; border-radius: 8px;" onerror="this.style.display='none'">` : ''}
          <div>
            <strong>${stats.champion || "不明"}</strong><br>
            <span style="color: #9ae6b4;">KDA: ${stats.kills || 0}/${stats.deaths || 0}/${stats.assists || 0} (${stats.kda || 0})</span><br>
            <span>CS: ${stats.cs || 0} | ダメージ: ${
              stats.damage ? stats.damage.toLocaleString() : "N/A"
            } | ゴールド: ${stats.gold ? stats.gold.toLocaleString() : "N/A"}</span>
          </div>
        </div>
      </div>
    `;
  });

  resultEl.innerHTML = html;
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
    const response = await fetch("/api/balance_teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: players.slice(0, 10) }),
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

  let html = `<h3>⚖️ チーム組み分け結果</h3>`;
  html += `<p>平均スコア差: ${data.score_diff}</p>`;

  html += `<div class="team team-blue"><h3>💙 Team 1 (Score: ${data.team1_score})</h3>`;
  data.team1.forEach((p) => {
    html += `
      <div class="player">
        <strong>${p.riotId}</strong><br>
        <span style="color: #9ae6b4;">${p.rank} (Score: ${p.score})</span>
      </div>
    `;
  });
  html += `</div>`;

  html += `<div class="team team-red"><h3>❤️ Team 2 (Score: ${data.team2_score})</h3>`;
  data.team2.forEach((p) => {
    html += `
      <div class="player">
        <strong>${p.riotId}</strong><br>
        <span style="color: #9ae6b4;">${p.rank} (Score: ${p.score})</span>
      </div>
    `;
  });
  html += `</div>`;

  resultEl.innerHTML = html;
}
