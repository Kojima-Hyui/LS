// runes.js - ルーンページ管理

// ルーンページの状態管理
let currentRunePage = {
  id: 'current',
  name: '新しいルーンページ',
  primaryTreeId: 0,
  secondaryTreeId: 0,
  selectedRunes: {
    primaryRunes: [], // 4つのメインルーン
    secondaryRunes: [], // 2つのサブルーン
  },
  statShards: {
    offense: 0,
    flex: 0,
    defense: 0,
  },
};

let runesData = [];
let savedRunePages = [];

// 統計シャードデータ (lol-item-searchから移植)
const STAT_SHARDS = {
  offense: [
    { id: 5005, name: '攻撃速度', value: '+10% 攻撃速度' },
    { id: 5008, name: '適応攻撃力', value: '+9 適応攻撃力' },
    { id: 5007, name: '適応攻撃力', value: '+9 適応攻撃力' },
  ],
  flex: [
    { id: 5008, name: '適応攻撃力', value: '+9 適応攻撃力' },
    { id: 5002, name: '物理防御力', value: '+6 物理防御力' },
    { id: 5003, name: '魔法防御力', value: '+8 魔法防御力' },
  ],
  defense: [
    { id: 5001, name: '体力', value: '+15-140 体力（レベル依存）' },
    { id: 5002, name: '物理防御力', value: '+6 物理防御力' },
    { id: 5003, name: '魔法防御力', value: '+8 魔法防御力' },
  ],
};

// ルーンデータ読み込み
async function loadRunes() {
  try {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/ja_JP/runesReforged.json`
    );
    runesData = await response.json();

    // ローカルストレージから保存済みページを読み込み
    const saved = localStorage.getItem('runePages');
    savedRunePages = saved ? JSON.parse(saved) : [];
    updateSavedPagesCount();

    // UIの初期化
    renderRuneBuilder();
    renderStatShards();
    updateRunePageSummary();

    document.getElementById('runes-loading').style.display = 'none';
    document.getElementById('runes-content').style.display = 'block';

    console.log(`✅ ${runesData.length}個のルーンツリーを読み込みました`);
  } catch (error) {
    console.error('❌ ルーンデータの読み込みに失敗:', error);
    document.getElementById('runes-loading').style.display = 'none';
    document.getElementById('runes-error').textContent = 'ルーンデータの読み込みに失敗しました';
    document.getElementById('runes-error').style.display = 'block';
  }
}

// ルーンビルダーのレンダリング
function renderRuneBuilder() {
  renderTreeSelector('primary');
  renderTreeSelector('secondary');
  renderPrimaryRuneSlots();
  renderSecondaryRuneSlots();
}

// ツリーセレクターのレンダリング
function renderTreeSelector(type) {
  const container = document.getElementById(
    type === 'primary' ? 'primary-tree-selector' : 'secondary-tree-selector'
  );
  const selectedTreeId =
    type === 'primary' ? currentRunePage.primaryTreeId : currentRunePage.secondaryTreeId;
  const otherTreeId =
    type === 'primary' ? currentRunePage.secondaryTreeId : currentRunePage.primaryTreeId;

  let html = '';
  runesData.forEach((tree) => {
    const isSelected = tree.id === selectedTreeId;
    const isDisabled = type === 'secondary' && tree.id === otherTreeId;
    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`;

    html += `
      <div 
        class="rune-tree-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
        onclick="${isDisabled ? '' : `selectRuneTree('${type}', ${tree.id})`}"
      >
        <img src="${iconUrl}" alt="${tree.name}" class="rune-tree-option-icon">
        <div class="rune-tree-option-name">${tree.name}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ツリー選択
function selectRuneTree(type, treeId) {
  if (type === 'primary') {
    if (currentRunePage.primaryTreeId === treeId) return;

    currentRunePage.primaryTreeId = treeId;
    currentRunePage.selectedRunes.primaryRunes = [];

    // サブツリーが同じ場合はリセット
    if (currentRunePage.secondaryTreeId === treeId) {
      currentRunePage.secondaryTreeId = 0;
      currentRunePage.selectedRunes.secondaryRunes = [];
    }
  } else {
    if (currentRunePage.secondaryTreeId === treeId) return;
    if (currentRunePage.primaryTreeId === treeId) return;

    currentRunePage.secondaryTreeId = treeId;
    currentRunePage.selectedRunes.secondaryRunes = [];
  }

  renderRuneBuilder();
  updateRunePageSummary();
}

// メインルーンスロットのレンダリング
function renderPrimaryRuneSlots() {
  const container = document.getElementById('primary-rune-slots');

  if (!currentRunePage.primaryTreeId) {
    container.innerHTML = '<p style="color: #a0aec0; text-align: center;">メインツリーを選択してください</p>';
    return;
  }

  const tree = runesData.find((t) => t.id === currentRunePage.primaryTreeId);
  if (!tree) return;

  let html = '';
  tree.slots.forEach((slot, slotIndex) => {
    const slotTitle = slotIndex === 0 ? 'キーストーン' : `スロット ${slotIndex}`;
    const selectedRuneId = currentRunePage.selectedRunes.primaryRunes[slotIndex];

    html += `
      <div class="rune-slot-selection">
        <h4>${slotTitle}</h4>
        <div class="rune-options">
    `;

    slot.runes.forEach((rune) => {
      const isSelected = rune.id === selectedRuneId;
      const iconUrl = `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
      const cleanDesc = cleanLoLText(rune.shortDesc);

      html += `
        <div 
          class="rune-option ${isSelected ? 'selected' : ''}"
          onclick="selectPrimaryRune(${slotIndex}, ${rune.id})"
          title="${rune.name}: ${cleanDesc}"
        >
          <img src="${iconUrl}" alt="${rune.name}" class="rune-option-icon">
          <div class="rune-option-details">
            <div class="rune-option-name">${rune.name}</div>
            <div class="rune-option-desc">${cleanDesc.substring(0, 60)}${cleanDesc.length > 60 ? '...' : ''}</div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// サブルーンスロットのレンダリング
function renderSecondaryRuneSlots() {
  const container = document.getElementById('secondary-rune-slots');

  if (!currentRunePage.secondaryTreeId) {
    container.innerHTML = '<p style="color: #a0aec0; text-align: center;">サブツリーを選択してください</p>';
    return;
  }

  const tree = runesData.find((t) => t.id === currentRunePage.secondaryTreeId);
  if (!tree) return;

  let html = '<p style="color: #a0aec0; margin-bottom: 15px;">以下から2つのルーンを選択してください（キーストーンを除く）</p>';

  // スロット1-3（キーストーンを除く）
  tree.slots.slice(1).forEach((slot, slotIndex) => {
    const actualSlotIndex = slotIndex + 1;

    html += `
      <div class="rune-slot-selection">
        <h4>スロット ${actualSlotIndex}</h4>
        <div class="rune-options">
    `;

    slot.runes.forEach((rune) => {
      const isSelected = currentRunePage.selectedRunes.secondaryRunes.includes(rune.id);
      const iconUrl = `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
      const cleanDesc = cleanLoLText(rune.shortDesc);

      html += `
        <div 
          class="rune-option ${isSelected ? 'selected' : ''}"
          onclick="selectSecondaryRune(${rune.id})"
          title="${rune.name}: ${cleanDesc}"
        >
          <img src="${iconUrl}" alt="${rune.name}" class="rune-option-icon">
          <div class="rune-option-details">
            <div class="rune-option-name">${rune.name}</div>
            <div class="rune-option-desc">${cleanDesc.substring(0, 60)}${cleanDesc.length > 60 ? '...' : ''}</div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// メインルーン選択
function selectPrimaryRune(slotIndex, runeId) {
  currentRunePage.selectedRunes.primaryRunes[slotIndex] = runeId;
  renderPrimaryRuneSlots();
  updateRunePageSummary();
}

// サブルーン選択
function selectSecondaryRune(runeId) {
  const secondaryRunes = currentRunePage.selectedRunes.secondaryRunes;
  const index = secondaryRunes.indexOf(runeId);

  if (index !== -1) {
    // 既に選択されている場合は解除
    secondaryRunes.splice(index, 1);
  } else if (secondaryRunes.length < 2) {
    // 2つ未満の場合は追加
    secondaryRunes.push(runeId);
  } else {
    // 既に2つ選択されている場合は最初のものを置き換え
    secondaryRunes.shift();
    secondaryRunes.push(runeId);
  }

  renderSecondaryRuneSlots();
  updateRunePageSummary();
}

// 統計シャードのレンダリング
function renderStatShards() {
  const container = document.getElementById('stat-shards');
  const categories = [
    { key: 'offense', title: '⚔️ 攻撃' },
    { key: 'flex', title: '⚡ フレックス' },
    { key: 'defense', title: '🛡️ 防御' },
  ];

  let html = '';
  categories.forEach((category) => {
    const shards = STAT_SHARDS[category.key];
    const selectedShardId = currentRunePage.statShards[category.key];

    html += `
      <div class="stat-shard-category">
        <h4>${category.title}</h4>
        <div class="stat-shard-options">
    `;

    shards.forEach((shard) => {
      const isSelected = shard.id === selectedShardId;

      html += `
        <div 
          class="stat-shard-option ${isSelected ? 'selected' : ''} ${category.key}"
          onclick="selectStatShard('${category.key}', ${shard.id})"
        >
          <div class="stat-shard-icon">${shard.name.substring(0, 2)}</div>
          <div class="stat-shard-details">
            <div class="stat-shard-name">${shard.name}</div>
            <div class="stat-shard-value">${shard.value}</div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 統計シャード選択
function selectStatShard(category, shardId) {
  currentRunePage.statShards[category] = shardId;
  renderStatShards();
  updateRunePageSummary();
}

// ルーンページ概要の更新
function updateRunePageSummary() {
  const primaryTree = runesData.find((t) => t.id === currentRunePage.primaryTreeId);
  const secondaryTree = runesData.find((t) => t.id === currentRunePage.secondaryTreeId);

  document.getElementById('summary-primary').textContent = primaryTree ? primaryTree.name : '未選択';
  document.getElementById('summary-secondary').textContent = secondaryTree ? secondaryTree.name : '未選択';

  const primaryCount = currentRunePage.selectedRunes.primaryRunes.filter((r) => r).length;
  const secondaryCount = currentRunePage.selectedRunes.secondaryRunes.length;
  const shardsCount = Object.values(currentRunePage.statShards).filter((s) => s > 0).length;

  document.getElementById('summary-primary-runes').textContent = `${primaryCount}/4`;
  document.getElementById('summary-secondary-runes').textContent = `${secondaryCount}/2`;
  document.getElementById('summary-shards').textContent = `${shardsCount}/3`;
}

// ルーンページ保存
function saveRunePage() {
  const name = document.getElementById('rune-page-name').value.trim();

  if (!name) {
    alert('ルーンページ名を入力してください');
    return;
  }

  if (currentRunePage.primaryTreeId === 0) {
    alert('メインツリーを選択してください');
    return;
  }

  const newPage = {
    ...currentRunePage,
    id: Date.now().toString(),
    name: name,
    createdAt: new Date().toISOString(),
  };

  savedRunePages.push(newPage);
  localStorage.setItem('runePages', JSON.stringify(savedRunePages));

  updateSavedPagesCount();
  alert('✅ ルーンページを保存しました！');
}

// ルーンページリセット
function resetRunePage() {
  if (!confirm('ルーンページをリセットしますか？')) return;

  currentRunePage = {
    id: 'current',
    name: '新しいルーンページ',
    primaryTreeId: 0,
    secondaryTreeId: 0,
    selectedRunes: {
      primaryRunes: [],
      secondaryRunes: [],
    },
    statShards: {
      offense: 0,
      flex: 0,
      defense: 0,
    },
  };

  document.getElementById('rune-page-name').value = '新しいルーンページ';
  renderRuneBuilder();
  renderStatShards();
  updateRunePageSummary();
}

// 保存済みページ表示切り替え
function toggleSavedPages() {
  const container = document.getElementById('saved-pages-container');
  const isVisible = container.style.display !== 'none';

  if (isVisible) {
    container.style.display = 'none';
  } else {
    renderSavedPages();
    container.style.display = 'block';
  }
}

// 保存済みページのレンダリング
function renderSavedPages() {
  const container = document.getElementById('saved-pages-list');

  if (savedRunePages.length === 0) {
    container.innerHTML = '<p style="color: #a0aec0; text-align: center;">保存済みのルーンページがありません</p>';
    return;
  }

  let html = '';
  savedRunePages.forEach((page) => {
    const primaryTree = runesData.find((t) => t.id === page.primaryTreeId);
    const secondaryTree = runesData.find((t) => t.id === page.secondaryTreeId);

    html += `
      <div class="saved-rune-page" onclick="loadRunePage('${page.id}')">
        <div class="saved-rune-page-header">
          <div class="saved-rune-page-name">${page.name}</div>
          <div class="saved-rune-page-actions" onclick="event.stopPropagation()">
            <button onclick="loadRunePage('${page.id}')">📥 読込</button>
            <button onclick="deleteRunePage('${page.id}')">🗑️ 削除</button>
          </div>
        </div>
        <div class="saved-rune-page-info">
          ${primaryTree ? primaryTree.name : '未選択'} / ${secondaryTree ? secondaryTree.name : '未選択'}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ルーンページ読み込み
function loadRunePage(pageId) {
  const page = savedRunePages.find((p) => p.id === pageId);
  if (!page) return;

  currentRunePage = { ...page };
  document.getElementById('rune-page-name').value = page.name;

  renderRuneBuilder();
  renderStatShards();
  updateRunePageSummary();

  document.getElementById('saved-pages-container').style.display = 'none';
}

// ルーンページ削除
function deleteRunePage(pageId) {
  if (!confirm('このルーンページを削除しますか？')) return;

  savedRunePages = savedRunePages.filter((p) => p.id !== pageId);
  localStorage.setItem('runePages', JSON.stringify(savedRunePages));

  updateSavedPagesCount();
  renderSavedPages();
}

// 保存済みページ数の更新
function updateSavedPagesCount() {
  document.getElementById('saved-pages-count').textContent = savedRunePages.length;
}
