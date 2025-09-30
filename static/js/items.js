// items.js - アイテム管理

// アイテムビルド管理
let currentBuild = {
  name: "カスタムビルド",
  items: [],
  map: "SR",
  mode: "CLASSIC",
};
let savedBuilds = [];
let allItems = [];
let allItemTags = [];
let selectedItemTags = [];

// アイテム一覧読み込み
async function loadItemsList() {
  try {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/ja_JP/item.json`
    );
    const itemData = await response.json();

    // アイテムデータを取得し、重複を除外
    const itemsArray = Object.entries(itemData.data).map(([id, item]) => ({
      id,
      ...item,
    }));

    // 同名アイテムの重複を除外（6桁IDのものを優先的に除外）
    const itemsByName = new Map();
    itemsArray.forEach((item) => {
      const existingItem = itemsByName.get(item.name);
      if (!existingItem) {
        // 新しいアイテム名の場合は追加
        itemsByName.set(item.name, item);
      } else {
        // 既存のアイテムがある場合、IDが短い方（より一般的）を優先
        // 6桁IDは特殊バージョンなので除外
        const existingIdLength = existingItem.id.length;
        const newIdLength = item.id.length;
        
        if (newIdLength < existingIdLength) {
          // 新しいIDの方が短い場合は置き換え
          itemsByName.set(item.name, item);
        }
        // 既存のIDの方が短い場合は何もしない（既存を保持）
      }
    });

    allItems = Array.from(itemsByName.values());

    console.log(`🔍 重複除外前: ${itemsArray.length}個 → 除外後: ${allItems.length}個`);

    // タグの収集
    const tagsSet = new Set();
    allItems.forEach((item) => {
      if (item.tags) {
        item.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    allItemTags = Array.from(tagsSet).sort();

    // 保存済みビルドの読み込み
    const saved = localStorage.getItem("itemBuilds");
    savedBuilds = saved ? JSON.parse(saved) : [];
    updateSavedBuildsCount();

    // タグフィルターの初期化
    renderItemTagsFilter();

    displayItems(allItems);

    // フィルター機能
    document
      .getElementById("item-search")
      .addEventListener("input", filterItems);
    document
      .getElementById("item-price-min")
      .addEventListener("input", filterItems);
    document
      .getElementById("item-price-max")
      .addEventListener("input", filterItems);
    document.getElementById("item-map").addEventListener("change", filterItems);
    document
      .getElementById("item-sort")
      .addEventListener("change", filterItems);
    document
      .getElementById("item-purchasable")
      .addEventListener("change", filterItems);

    document.getElementById("items-loading").style.display = "none";
    document.getElementById("items-grid").style.display = "block";

    // ビルドの初期状態を表示
    updateBuildDisplay();
    updateBuildItemsCount();

    console.log(`✅ ${allItems.length}個のアイテムを読み込みました`);
  } catch (error) {
    console.error("❌ アイテムデータの読み込みに失敗:", error);
    document.getElementById("items-loading").style.display = "none";
    document.getElementById("items-error").textContent =
      "アイテムデータの読み込みに失敗しました";
    document.getElementById("items-error").style.display = "block";
  }
}

// タグフィルターのレンダリング
function renderItemTagsFilter() {
  const container = document.getElementById("item-tags-filter");
  let html = "";

  allItemTags.forEach((tag) => {
    const isActive = selectedItemTags.includes(tag);
    html += `
      <button 
        class="tag-button ${isActive ? "active" : ""}"
        onclick="toggleItemTag('${tag}')"
      >
        ${tag}
      </button>
    `;
  });

  container.innerHTML = html || '<p style="color: #a0aec0;">タグなし</p>';
}

// タグの切り替え
function toggleItemTag(tag) {
  const index = selectedItemTags.indexOf(tag);
  if (index === -1) {
    selectedItemTags.push(tag);
  } else {
    selectedItemTags.splice(index, 1);
  }
  renderItemTagsFilter();
  filterItems();
}

// アイテムフィルターのクリア
function clearItemFilters() {
  document.getElementById("item-search").value = "";
  document.getElementById("item-price-min").value = "0";
  document.getElementById("item-price-max").value = "10000";
  document.getElementById("item-map").value = "all";
  document.getElementById("item-sort").value = "name-asc";
  document.getElementById("item-purchasable").checked = true;

  // すべてのタグを非選択にする
  selectedItemTags = [];
  const tagButtons = document.querySelectorAll("#item-tags-filter .tag-button");
  tagButtons.forEach((btn) => btn.classList.remove("active"));

  filterItems();
}

// アイテムフィルター
function filterItems() {
  const searchTerm = document.getElementById("item-search").value.toLowerCase();
  const priceMin =
    parseInt(document.getElementById("item-price-min").value) || 0;
  const priceMax =
    parseInt(document.getElementById("item-price-max").value) || 999999;
  const selectedMap = document.getElementById("item-map").value;
  const sortBy = document.getElementById("item-sort").value;
  const purchasableOnly = document.getElementById("item-purchasable").checked;

  let filtered = allItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm) ||
      (item.plaintext && item.plaintext.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm));

    const matchesPrice =
      item.gold.total >= priceMin && item.gold.total <= priceMax;

    const matchesMap = selectedMap === "all" || item.maps[selectedMap] === true;

    const matchesPurchasable =
      !purchasableOnly || item.gold.purchasable !== false;

    const matchesTags =
      selectedItemTags.length === 0 ||
      selectedItemTags.every((tag) => item.tags && item.tags.includes(tag));

    return (
      matchesSearch &&
      matchesPrice &&
      matchesMap &&
      matchesPurchasable &&
      matchesTags
    );
  });

  // ソート
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "price-asc":
        return a.gold.total - b.gold.total;
      case "price-desc":
        return b.gold.total - a.gold.total;
      default:
        return 0;
    }
  });

  displayItems(filtered);
  document.getElementById("items-count").textContent = filtered.length;
}

// アイテム表示
function displayItems(items) {
  const container = document.getElementById("items-grid");
  let html = "";

  items.forEach((item) => {
    const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${item.id}.png`;
    const isInBuild = currentBuild.items.some((b) => b.id === item.id);

    html += `
      <div class="item-card ${
        isInBuild ? "in-build" : ""
      }" onclick="showItemDetail('${item.id}')">
        <img src="${imgUrl}" alt="${
      item.name
    }" class="item-card-img" onerror="this.style.display='none'">
        <div class="item-card-name">${item.name}</div>
        <div class="item-card-price">${item.gold.total}G</div>
        <button 
          class="add-to-build-btn" 
          onclick="event.stopPropagation(); addItemToBuild('${
            item.id
          }', 'Core')"
          style="margin-top: 8px; padding: 4px 8px; font-size: 0.75rem; width: 100%;"
        >
          ${isInBuild ? "✓ ビルドに追加済み" : "+ コアに追加"}
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ビルドにアイテムを追加
function addItemToBuild(itemId, blockType = "Core") {
  const item = allItems.find((i) => i.id === itemId);
  if (!item) return;

  const existsIndex = currentBuild.items.findIndex((i) => i.id === itemId);
  if (existsIndex !== -1) {
    alert("このアイテムは既にビルドに含まれています");
    return;
  }

  // コアアイテムの制限チェック
  if (blockType === "Core") {
    const coreCount = currentBuild.items.filter(
      (i) => i.blockType === "Core"
    ).length;
    if (coreCount >= 6) {
      alert("コアアイテムは最大6個までです");
      return;
    }
  }

  currentBuild.items.push({ id: itemId, item, blockType });
  updateBuildDisplay();
  updateBuildItemsCount();
  filterItems(); // 表示を更新
  
  // 初めてアイテムを追加した場合、ビルドパネルを開く
  if (currentBuild.items.length === 1) {
    document.getElementById("build-panel").classList.add("active");
  }
}

// ビルドからアイテムを削除
function removeItemFromBuild(itemId) {
  currentBuild.items = currentBuild.items.filter((i) => i.id !== itemId);
  updateBuildDisplay();
  updateBuildItemsCount();
  filterItems(); // 表示を更新
}

// アイテムを別のブロックに移動
function moveItemToBlock(itemId, newBlockType) {
  const item = currentBuild.items.find((i) => i.id === itemId);
  if (!item) return;

  // コアアイテムの制限チェック
  if (newBlockType === "Core") {
    const coreCount = currentBuild.items.filter(
      (i) => i.blockType === "Core" && i.id !== itemId
    ).length;
    if (coreCount >= 6) {
      alert("コアアイテムは最大6個までです");
      return;
    }
  }

  item.blockType = newBlockType;
  updateBuildDisplay();
}

// ビルド表示の更新
function updateBuildDisplay() {
  const blockTypes = ["Start", "Core", "Situational"];

  blockTypes.forEach((blockType) => {
    const container = document.getElementById(
      `build-${blockType.toLowerCase()}-items`
    );
    const items = currentBuild.items.filter((i) => i.blockType === blockType);

    if (items.length === 0) {
      container.innerHTML =
        '<p style="color: #a0aec0; text-align: center; padding: 20px; white-space: nowrap;">アイテムなし</p>';
      return;
    }

    let html = "";
    items.forEach(({ id, item }) => {
      const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${id}.png`;
      html += `
        <div class="build-item">
          <img src="${imgUrl}" alt="${item.name}">
          <button class="build-item-remove" onclick="removeItemFromBuild('${id}')">✕</button>
          <select class="build-item-move" onchange="moveItemToBlock('${id}', this.value)">
            <option value="Start" ${
              blockType === "Start" ? "selected" : ""
            }>スタート</option>
            <option value="Core" ${
              blockType === "Core" ? "selected" : ""
            }>コア</option>
            <option value="Situational" ${
              blockType === "Situational" ? "selected" : ""
            }>状況</option>
          </select>
        </div>
      `;
    });

    container.innerHTML = html;
  });
}

// ビルドパネルの切り替え
function toggleBuildPanel() {
  const panel = document.getElementById("build-panel");
  const isActive = panel.classList.contains("active");
  
  if (isActive) {
    panel.classList.remove("active");
  } else {
    // 保存済みビルドパネルを閉じる
    document.getElementById("saved-builds-container").style.display = "none";
    // ビルドパネルを開く
    panel.classList.add("active");
  }
}

// ビルドのクリア
function clearBuild() {
  if (!confirm("現在のビルドをクリアしますか？")) return;

  currentBuild.items = [];
  updateBuildDisplay();
  updateBuildItemsCount();
  filterItems();
}

// ビルドの保存
function saveBuild() {
  const name = document.getElementById("build-name").value.trim();

  if (!name) {
    alert("ビルド名を入力してください");
    return;
  }

  if (currentBuild.items.length === 0) {
    alert("アイテムを追加してください");
    return;
  }

  const newBuild = {
    id: Date.now().toString(),
    name,
    items: currentBuild.items,
    map: currentBuild.map,
    mode: currentBuild.mode,
    createdAt: new Date().toISOString(),
  };

  savedBuilds.push(newBuild);
  localStorage.setItem("itemBuilds", JSON.stringify(savedBuilds));

  updateSavedBuildsCount();
  alert("✅ ビルドを保存しました！");
}

// ビルドのダウンロード
function downloadBuild() {
  const name = document.getElementById("build-name").value.trim();

  if (currentBuild.items.length === 0) {
    alert("アイテムを追加してください");
    return;
  }

  const blockTypes = ["Start", "Core", "Situational"];
  const blocks = blockTypes
    .map((blockType) => ({
      type: blockType,
      recMath: false,
      items: currentBuild.items
        .filter((item) => item.blockType === blockType)
        .map((item) => ({ id: item.id, count: 1 })),
    }))
    .filter((block) => block.items.length > 0);

  const itemSet = {
    title: name || "カスタムビルド",
    type: "custom",
    map: currentBuild.map,
    mode: currentBuild.mode,
    priority: false,
    sortrank: 0,
    blocks,
  };

  const json = JSON.stringify(itemSet, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// クリップボードにコピー
async function copyBuildToClipboard() {
  const name = document.getElementById("build-name").value.trim();

  if (currentBuild.items.length === 0) {
    alert("アイテムを追加してください");
    return;
  }

  const blockTypes = ["Start", "Core", "Situational"];
  const blocks = blockTypes
    .map((blockType) => ({
      type: blockType,
      recMath: false,
      items: currentBuild.items
        .filter((item) => item.blockType === blockType)
        .map((item) => ({ id: item.id, count: 1 })),
    }))
    .filter((block) => block.items.length > 0);

  const itemSet = {
    title: name || "カスタムビルド",
    type: "custom",
    map: currentBuild.map,
    mode: currentBuild.mode,
    priority: false,
    sortrank: 0,
    blocks,
  };

  const json = JSON.stringify(itemSet, null, 2);

  try {
    await navigator.clipboard.writeText(json);
    alert("✅ クリップボードにコピーしました！");
  } catch (err) {
    alert("❌ コピーに失敗しました");
  }
}

// 保存済みビルドの切り替え
function toggleSavedBuilds() {
  const container = document.getElementById("saved-builds-container");
  const buildPanel = document.getElementById("build-panel");
  const isVisible = container.style.display !== "none";

  if (isVisible) {
    container.style.display = "none";
  } else {
    // ビルドパネルを閉じる
    buildPanel.classList.remove("active");
    // 保存済みビルドを表示
    renderSavedBuilds();
    container.style.display = "block";
  }
}

// 保存済みビルドのレンダリング
function renderSavedBuilds() {
  const container = document.getElementById("saved-builds-list");

  if (savedBuilds.length === 0) {
    container.innerHTML =
      '<p style="color: #a0aec0; text-align: center;">保存済みのビルドがありません</p>';
    return;
  }

  let html = "";
  savedBuilds.forEach((build) => {
    // ビルド内のアイテムサムネイル（最大6個表示）
    const itemThumbnails = build.items
      .slice(0, 6)
      .map((item) => {
        const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${item.id}.png`;
        return `<img src="${imgUrl}" alt="${item.item.name}" style="width: 32px; height: 32px; border-radius: 4px; margin: 2px;" title="${item.item.name}">`;
      })
      .join("");

    const moreItems = build.items.length > 6 ? ` +${build.items.length - 6}個` : "";

    html += `
      <div class="saved-build-card">
        <div class="saved-build-header">
          <div class="saved-build-name">${build.name}</div>
          <div class="saved-build-actions" onclick="event.stopPropagation()">
            <button onclick="loadBuild('${build.id}')">📥 読込</button>
            <button onclick="deleteBuild('${build.id}')">🗑️ 削除</button>
          </div>
        </div>
        <div class="saved-build-items" style="display: flex; flex-wrap: wrap; margin: 8px 0;">
          ${itemThumbnails}
          ${moreItems ? `<span style="color: #a0aec0; font-size: 0.85rem; align-self: center; margin-left: 8px;">${moreItems}</span>` : ""}
        </div>
        <div class="saved-build-info">
          アイテム数: ${build.items.length} | 作成日: ${new Date(
      build.createdAt
    ).toLocaleDateString("ja-JP")}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ビルドの読み込み
function loadBuild(buildId) {
  const build = savedBuilds.find((b) => b.id === buildId);
  if (!build) return;

  currentBuild = { ...build };
  document.getElementById("build-name").value = build.name;

  updateBuildDisplay();
  updateBuildItemsCount();
  filterItems();

  // 保存済みビルドパネルを閉じて、ビルドパネルを開く
  document.getElementById("saved-builds-container").style.display = "none";
  document.getElementById("build-panel").classList.add("active");
  
  alert("✅ ビルドを読み込みました！");
}

// ビルドの削除
function deleteBuild(buildId) {
  if (!confirm("このビルドを削除しますか？")) return;

  savedBuilds = savedBuilds.filter((b) => b.id !== buildId);
  localStorage.setItem("itemBuilds", JSON.stringify(savedBuilds));

  updateSavedBuildsCount();
  renderSavedBuilds();
}

// ビルドアイテム数の更新
function updateBuildItemsCount() {
  document.getElementById("build-items-count").textContent =
    currentBuild.items.length;
}

// 保存済みビルド数の更新
function updateSavedBuildsCount() {
  document.getElementById("saved-builds-count").textContent =
    savedBuilds.length;
}

// アイテム詳細表示
function showItemDetail(itemId) {
  const item = allItems.find((i) => i.id === itemId);
  if (!item) return;

  let body = `
    <p><strong>価格:</strong> ${item.gold.total}G (売却: ${item.gold.sell}G)</p>
    ${item.plaintext ? `<p><strong>説明:</strong> ${item.plaintext}</p>` : ""}
    <br>
    <p><strong>効果:</strong></p>
    <p>${item.description.replace(/<[^>]*>/g, "")}</p>
  `;

  if (item.tags && item.tags.length > 0) {
    body += `<br><p><strong>タグ:</strong> ${item.tags.join(", ")}</p>`;
  }

  if (item.from && item.from.length > 0) {
    body += `<br><p><strong>作成素材:</strong> ${item.from.join(", ")}</p>`;
  }

  if (item.into && item.into.length > 0) {
    body += `<br><p><strong>アップグレード先:</strong> ${item.into.join(
      ", "
    )}</p>`;
  }

  showModal(item.name, body);
}
