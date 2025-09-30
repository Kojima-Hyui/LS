#!/usr/bin/env node
/**
 * 統計シャード データ更新スクリプト
 * 
 * 使用方法:
 * node scripts/updateStatShards.js --version=14.2 --notes="パッチ14.2での変更"
 * 
 * または手動でプロンプトに従って更新:
 * node scripts/updateStatShards.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// コマンドライン引数を解析
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log('🎮 League of Legends 統計シャード データ更新スクリプト');
  console.log('================================================\n');

  // 現在のデータを読み込み
  const statShardsPath = path.join(__dirname, '../src/data/statShards.ts');
  const currentData = fs.readFileSync(statShardsPath, 'utf8');
  
  // 現在のバージョンを抽出
  const currentVersionMatch = currentData.match(/version: "([^"]+)"/);
  const currentVersion = currentVersionMatch ? currentVersionMatch[1] : 'unknown';
  
  console.log(`📋 現在のバージョン: ${currentVersion}`);
  
  // 新しいバージョン情報を取得
  const newVersion = getArg('version') || await question('🆕 新しいパッチバージョンを入力してください (例: 14.2): ');
  const updateNotes = getArg('notes') || await question('📝 更新内容を入力してください: ');
  
  if (!newVersion) {
    console.log('❌ バージョンが指定されていません');
    rl.close();
    return;
  }
  
  // 今日の日付を取得
  const today = new Date().toISOString().split('T')[0];
  
  console.log('\n📊 更新予定の情報:');
  console.log(`   バージョン: ${currentVersion} → ${newVersion}`);
  console.log(`   更新日: ${today}`);
  console.log(`   更新内容: ${updateNotes}`);
  
  const confirm = await question('\n✅ この内容で更新しますか？ (y/N): ');
  
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('❌ 更新をキャンセルしました');
    rl.close();
    return;
  }
  
  // データファイルを更新
  const updatedData = currentData
    .replace(/version: "[^"]+"/g, `version: "${newVersion}"`)
    .replace(/lastUpdated: "[^"]+"/g, `lastUpdated: "${today}"`)
    .replace(/updateNotes: "[^"]*"/g, `updateNotes: "${updateNotes}"`);
  
  // バックアップを作成
  const backupPath = path.join(__dirname, `../src/data/statShards.${currentVersion}.backup.ts`);
  fs.writeFileSync(backupPath, currentData);
  console.log(`💾 バックアップを作成しました: ${backupPath}`);
  
  // 更新されたデータを書き込み
  fs.writeFileSync(statShardsPath, updatedData);
  
  console.log('\n✅ 統計シャード データを更新しました！');
  console.log('\n📋 次のステップ:');
  console.log('1. アプリケーションをテスト: npm run dev');
  console.log('2. ルーンページで統計シャードが正しく表示されることを確認');
  console.log('3. 実際の統計値が正しいか確認');
  console.log('4. 問題がある場合はバックアップから復元可能');
  
  // 変更履歴を追加
  const changeLogEntry = `\n// ${today} (v${newVersion}): ${updateNotes}`;
  const updatedDataWithLog = updatedData.replace(
    /(\*\/\s*)$/,
    `${changeLogEntry}$1`
  );
  
  fs.writeFileSync(statShardsPath, updatedDataWithLog);
  
  rl.close();
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('❌ エラーが発生しました:', error.message);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 更新を中断しました');
  rl.close();
  process.exit(0);
});

main().catch(console.error);