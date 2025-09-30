// champions.js - チャンピオン管理

// チャンピオンフィルター管理
let allChampionsData = [];
let selectedChampionRoles = [];
let selectedChampionLanes = [];
let selectedChampionDifficulties = [];

// ロールとレーンのマスターデータ
const CHAMPION_ROLES = [
  "Fighter",
  "Tank",
  "Mage",
  "Assassin",
  "Support",
  "Marksman",
];
const CHAMPION_LANES = ["Top", "Jungle", "Mid", "Bot", "Support"];
const DIFFICULTIES = [
  { value: 1, label: "初心者" },
  { value: 2, label: "初級" },
  { value: 3, label: "中級" },
  { value: 4, label: "上級" },
  { value: 5, label: "専門" },
];

// チャンピオン一覧読み込み
async function loadChampionsList() {
  try {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/ja_JP/champion.json`
    );
    const championData = await response.json();

    allChampionsData = Object.entries(championData.data).map(
      ([id, champion]) => ({
        id,
        ...champion,
      })
    );

    // フィルターUIの初期化
    renderChampionRolesFilter();
    renderChampionLanesFilter();
    renderChampionDifficultyFilter();

    displayChampions(allChampionsData);

    // 検索機能
    document
      .getElementById("champion-search")
      .addEventListener("input", filterChampions);
    document
      .getElementById("champion-sort")
      .addEventListener("change", filterChampions);

    document.getElementById("champions-loading").style.display = "none";
    document.getElementById("champions-grid").style.display = "block";

    console.log(
      `✅ ${allChampionsData.length}体のチャンピオンを読み込みました`
    );
  } catch (error) {
    console.error("❌ チャンピオンデータの読み込みに失敗:", error);
    document.getElementById("champions-loading").style.display = "none";
    document.getElementById("champions-error").textContent =
      "チャンピオンデータの読み込みに失敗しました";
    document.getElementById("champions-error").style.display = "block";
  }
}

// ロールフィルターのレンダリング
function renderChampionRolesFilter() {
  const container = document.getElementById("champion-roles-filter");
  let html = "";

  CHAMPION_ROLES.forEach((role) => {
    const isActive = selectedChampionRoles.includes(role);
    html += `
      <button 
        class="tag-button ${isActive ? "active" : ""}"
        onclick="toggleChampionRole('${role}')"
      >
        ${role}
      </button>
    `;
  });

  container.innerHTML = html;
}

// レーンフィルターのレンダリング
function renderChampionLanesFilter() {
  const container = document.getElementById("champion-lanes-filter");
  let html = "";

  CHAMPION_LANES.forEach((lane) => {
    const isActive = selectedChampionLanes.includes(lane);
    html += `
      <button 
        class="tag-button ${isActive ? "active" : ""}"
        onclick="toggleChampionLane('${lane}')"
      >
        ${lane}
      </button>
    `;
  });

  container.innerHTML = html;
}

// 難易度フィルターのレンダリング
function renderChampionDifficultyFilter() {
  const container = document.getElementById("champion-difficulty-filter");
  let html = "";

  DIFFICULTIES.forEach(({ value, label }) => {
    const isActive = selectedChampionDifficulties.includes(value);
    html += `
      <button 
        class="tag-button ${isActive ? "active" : ""}"
        onclick="toggleChampionDifficulty(${value})"
      >
        ${label}
      </button>
    `;
  });

  container.innerHTML = html;
}

// ロールの切り替え
function toggleChampionRole(role) {
  const index = selectedChampionRoles.indexOf(role);
  if (index === -1) {
    selectedChampionRoles.push(role);
  } else {
    selectedChampionRoles.splice(index, 1);
  }
  renderChampionRolesFilter();
  filterChampions();
}

// レーンの切り替え
function toggleChampionLane(lane) {
  const index = selectedChampionLanes.indexOf(lane);
  if (index === -1) {
    selectedChampionLanes.push(lane);
  } else {
    selectedChampionLanes.splice(index, 1);
  }
  renderChampionLanesFilter();
  filterChampions();
}

// 難易度の切り替え
function toggleChampionDifficulty(difficulty) {
  const index = selectedChampionDifficulties.indexOf(difficulty);
  if (index === -1) {
    selectedChampionDifficulties.push(difficulty);
  } else {
    selectedChampionDifficulties.splice(index, 1);
  }
  renderChampionDifficultyFilter();
  filterChampions();
}

// チャンピオンフィルターのクリア
function clearChampionFilters() {
  document.getElementById("champion-search").value = "";
  document.getElementById("champion-sort").value = "name-asc";

  // すべてのロール・レーン・難易度を非選択にする
  selectedChampionRoles = [];
  selectedChampionLanes = [];
  selectedChampionDifficulties = [];

  // ロールボタンの選択状態をクリア
  const roleButtons = document.querySelectorAll(
    "#champion-roles-filter .tag-button"
  );
  roleButtons.forEach((btn) => btn.classList.remove("active"));

  // レーンボタンの選択状態をクリア
  const laneButtons = document.querySelectorAll(
    "#champion-lanes-filter .tag-button"
  );
  laneButtons.forEach((btn) => btn.classList.remove("active"));

  // 難易度ボタンの選択状態をクリア
  const difficultyButtons = document.querySelectorAll(
    "#champion-difficulty-filter .tag-button"
  );
  difficultyButtons.forEach((btn) => btn.classList.remove("active"));

  filterChampions();
}

// チャンピオンフィルター
function filterChampions() {
  const searchTerm = document
    .getElementById("champion-search")
    .value.toLowerCase();
  const sortBy = document.getElementById("champion-sort").value;

  let filtered = allChampionsData.filter((champion) => {
    // 検索テキストマッチング
    const matchesSearch =
      !searchTerm ||
      champion.name.toLowerCase().includes(searchTerm) ||
      champion.id.toLowerCase().includes(searchTerm) ||
      champion.title.toLowerCase().includes(searchTerm);

    // ロールマッチング
    const matchesRoles =
      selectedChampionRoles.length === 0 ||
      selectedChampionRoles.some(
        (role) => champion.tags && champion.tags.includes(role)
      );

    // 難易度マッチング
    const matchesDifficulty =
      selectedChampionDifficulties.length === 0 ||
      selectedChampionDifficulties.includes(champion.info.difficulty);

    // レーンマッチングは現状タグに含まれないため、スキップ
    // 将来的にはAPI拡張が必要

    return matchesSearch && matchesRoles && matchesDifficulty;
  });

  // ソート
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "difficulty-asc":
        return a.info.difficulty - b.info.difficulty;
      case "difficulty-desc":
        return b.info.difficulty - a.info.difficulty;
      default:
        return 0;
    }
  });

  displayChampions(filtered);
  document.getElementById("champions-count").textContent = filtered.length;
}

// チャンピオン表示
function displayChampions(champions) {
  const container = document.getElementById("champions-grid");
  let html = "";

  champions.forEach((champion) => {
    const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${champion.id}.png`;
    const difficulty = "★".repeat(champion.info.difficulty);

    html += `
      <div class="champion-card" onclick="showChampionDetail('${champion.id}')">
        <img src="${imgUrl}" alt="${champion.name}" class="champion-card-img">
        <div class="champion-card-name">${champion.name}</div>
        <div style="font-size: 0.75rem; color: #ffd700; text-align: center; padding: 5px;">
          ${difficulty}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// チャンピオン詳細表示
async function showChampionDetail(championId) {
  try {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/ja_JP/champion/${championId}.json`
    );
    const data = await response.json();
    const champion = data.data[championId];

    let body = `
      <p><strong>${champion.title}</strong></p>
      <p>${champion.lore}</p>
      <br>
      <p><strong>タイプ:</strong> ${champion.tags.join(", ")}</p>
      <p><strong>難易度:</strong> ${"★".repeat(champion.info.difficulty)}</p>
      <br>
      <h3>スキル</h3>
    `;

    // パッシブ
    body += `
      <p><strong>パッシブ: ${champion.passive.name}</strong></p>
      <p>${cleanLoLText(champion.passive.description)}</p>
      <br>
    `;

    // スキル
    champion.spells.forEach((spell, index) => {
      body += `
        <p><strong>${index + 1}. ${spell.name}</strong></p>
        <p>${cleanLoLText(spell.description)}</p>
        <p><em>クールダウン: ${spell.cooldownBurn}秒 | コスト: ${
        spell.costBurn
      }</em></p>
        <br>
      `;
    });

    showModal(champion.name, body);
  } catch (error) {
    console.error("チャンピオン詳細の取得に失敗:", error);
    alert("チャンピオン詳細の取得に失敗しました");
  }
}
