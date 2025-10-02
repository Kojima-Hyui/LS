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

// パフォーマンス分析実行
async function analyzePerformance() {
  const riotId = document.getElementById("performance-riot-id").value.trim();
  const matchCount = parseInt(document.getElementById("performance-match-count").value);
  
  if (!riotId) {
    const errorEl = document.getElementById("performance-error");
    errorEl.textContent = "⚠️ Riot IDを入力してください";
    errorEl.style.display = "block";
    return;
  }
  
  await loadDetailedPerformanceAnalysis(riotId, matchCount);
}
