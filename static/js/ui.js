// UI.js - UI制御とヘルパー関数

// タブ切り替え
function switchTab(tabName) {
  // すべてのタブとボタンの active を外す
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // 指定されたタブとボタンを active にする
  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");
}

// モーダル表示
function showModal(title, body) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body;
  modal.style.display = "block";
}

// モーダルを閉じる
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// モーダル外クリックで閉じる
window.onclick = function (event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// LoLテキストのHTMLタグをクリーンアップする関数
function cleanLoLText(text) {
  if (!text) return "";

  // LoLの特殊タグを処理
  return text
    .replace(/<br>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "") // すべてのHTMLタグを削除
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim();
}

// ローディング表示
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "block";
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}

// エラー表示
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  }
}

function hideError(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}

// フィルターセクションのトグル
function toggleFiltersSection(headerElement) {
  const contentElement = headerElement.nextElementSibling;
  const toggleIcon = headerElement.querySelector(".toggle-icon");

  contentElement.classList.toggle("collapsed");

  // アイコンの向きを変更
  if (contentElement.classList.contains("collapsed")) {
    toggleIcon.textContent = "▶️";
  } else {
    toggleIcon.textContent = "🔽";
  }
}

// 数値をカンマ区切りにフォーマット
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 日付をフォーマット
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("ja-JP");
}
