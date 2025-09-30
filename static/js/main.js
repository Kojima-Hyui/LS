// main.js - アプリケーション初期化

// Data Dragonのバージョン
const DDRAGON_VERSION = "15.1.1";

// DOMContentLoadedイベント
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 アプリケーション初期化");

  // 各モジュールの初期化
  loadRunes();
  loadChampionsList();
  loadItemsList();

  // デフォルトタブを表示
  switchTab("match-history");

  console.log("✅ 初期化完了");
});
