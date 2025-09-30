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

    filteredMatches = data.matches || [];
    displayMatchHistory(filteredMatches);
    resultEl.style.display = "block";
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
    const win = stats.win;
    const winClass = win ? "team-blue" : "team-red";
    const winText = win ? "🏆 勝利" : "💀 敗北";

    html += `
      <div class="team ${winClass}" style="margin: 15px 0;">
        <h4>${winText} - ${match.game_mode} (${match.game_duration})</h4>
        <div class="player">
          <strong>${stats.champion || "不明"}</strong><br>
          <span style="color: #9ae6b4;">KDA: ${stats.kills || 0}/${stats.deaths || 0}/${stats.assists || 0} (${stats.kda || 0})</span><br>
          <span>CS: ${stats.cs || 0} | ダメージ: ${
            stats.damage ? stats.damage.toLocaleString() : "N/A"
          }</span>
        </div>
      </div>
    `;
  });

  resultEl.innerHTML = html;
}

// フィルター適用
let filteredMatches = [];

function applyFilters() {
  if (!filteredMatches.length) return;

  const mode = document.getElementById("filter-mode").value;
  const champion = document.getElementById("filter-champion").value;
  const result = document.getElementById("filter-result").value;

  let filtered = [...filteredMatches];

  if (mode) {
    filtered = filtered.filter((m) => m.game_mode === mode);
  }

  if (champion) {
    filtered = filtered.filter((m) => m.stats?.champion === champion);
  }

  if (result === "win") {
    filtered = filtered.filter((m) => m.stats?.win === true);
  } else if (result === "loss") {
    filtered = filtered.filter((m) => m.stats?.win === false);
  }

  displayMatchHistory(filtered);
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
