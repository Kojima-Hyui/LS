"""
テスト用スクリプト - APIの動作確認
"""
from riot_api import RiotAPIClient
from game_utils import MatchAnalyzer, TeamBalancer, format_rank
import os
from dotenv import load_dotenv

load_dotenv()


def test_riot_api():
    """Riot APIの基本的な動作テスト"""
    print("=== Riot API テスト ===\n")
    
    # APIキーの確認
    api_key = os.getenv("RIOT_API_KEY")
    if not api_key:
        print("❌ エラー: RIOT_API_KEYが設定されていません")
        print(".envファイルを確認してください")
        return False
    
    print(f"✓ APIキーが設定されています: {api_key[:10]}...")
    
    # クライアント初期化
    client = RiotAPIClient()
    print(f"✓ クライアント初期化完了")
    print(f"  リージョン: {client.region}")
    print(f"  ルーティング: {client.routing}\n")
    
    # テスト用のRiot ID（存在しない可能性があるため、エラーは想定内）
    test_game_name = input("テストするゲーム名を入力してください（例: Hide on Bush）: ").strip()
    test_tag_line = input("タグラインを入力してください（例: KR1）: ").strip()
    
    if not test_game_name or not test_tag_line:
        print("❌ ゲーム名とタグラインが必要です")
        return False
    
    print(f"\n=== {test_game_name}#{test_tag_line} の情報を取得中 ===\n")
    
    # 1. アカウント情報取得テスト
    print("1. アカウント情報取得...")
    account = client.get_account_by_riot_id(test_game_name, test_tag_line)
    
    if not account:
        print("❌ プレイヤーが見つかりませんでした")
        print("   別のRiot IDで試してください")
        return False
    
    print(f"✓ アカウント取得成功")
    print(f"  PUUID: {account['puuid'][:20]}...")
    print(f"  Game Name: {account['gameName']}")
    print(f"  Tag Line: {account['tagLine']}\n")
    
    puuid = account['puuid']
    
    # 2. サモナー情報取得テスト
    print("2. サモナー情報取得...")
    summoner = client.get_summoner_by_puuid(puuid)
    
    if summoner:
        print(f"✓ サモナー情報取得成功")
        print(f"  サモナーレベル: {summoner['summonerLevel']}")
        print(f"  Summoner ID: {summoner['id'][:20]}...\n")
    else:
        print("❌ サモナー情報の取得に失敗\n")
    
    # 3. ランク情報取得テスト
    if summoner:
        print("3. ランク情報取得...")
        ranked_stats = client.get_ranked_stats(summoner['id'])
        
        if ranked_stats:
            print(f"✓ ランク情報取得成功")
            for rank in ranked_stats:
                rank_display = format_rank(
                    rank['tier'],
                    rank.get('rank', ''),
                    rank['leaguePoints']
                )
                win_rate = round(rank['wins'] / (rank['wins'] + rank['losses']) * 100, 1) if (rank['wins'] + rank['losses']) > 0 else 0
                print(f"  {rank['queueType']}: {rank_display}")
                print(f"    戦績: {rank['wins']}W {rank['losses']}L ({win_rate}%)")
        else:
            print("  ランク情報なし（Unranked）")
        print()
    
    # 4. 試合履歴取得テスト
    print("4. 試合履歴取得...")
    match_ids = client.get_match_history(puuid, 5)
    
    if match_ids:
        print(f"✓ 試合履歴取得成功（{len(match_ids)}試合）")
        
        # 最新の試合詳細を取得
        print("\n5. 最新試合の詳細情報取得...")
        latest_match = client.get_match_detail(match_ids[0])
        
        if latest_match:
            print(f"✓ 試合詳細取得成功")
            player_stats = MatchAnalyzer.get_player_stats(latest_match, puuid)
            
            if player_stats:
                print(f"\n=== 最新試合の統計 ===")
                print(f"  結果: {'🟢 勝利' if player_stats['win'] else '🔴 敗北'}")
                print(f"  チャンピオン: {player_stats['champion']}")
                print(f"  KDA: {player_stats['kills']}/{player_stats['deaths']}/{player_stats['assists']} ({player_stats['kda']})")
                print(f"  CS: {player_stats['cs']}")
                print(f"  ダメージ: {player_stats['damage']:,}")
                print(f"  視界スコア: {player_stats['vision_score']}")
                print(f"  ゴールド: {player_stats['gold']:,}")
    else:
        print("❌ 試合履歴の取得に失敗")
    
    # 6. 現在のゲーム情報取得テスト
    print("\n6. 現在のゲーム情報取得...")
    current_game = client.get_current_game(puuid)
    
    if current_game:
        print(f"✓ 現在ゲーム中です！")
        print(f"  ゲームモード: {current_game['gameMode']}")
        print(f"  参加者数: {len(current_game['participants'])}人")
    else:
        print("  現在ゲーム中ではありません")
    
    print("\n=== テスト完了 ===")
    return True


def test_team_balancer():
    """チームバランサーのテスト"""
    print("\n\n=== チームバランサー テスト ===\n")
    
    # テストデータ
    test_players = [
        {"name": "Player1", "rank_score": 2500},  # Diamond
        {"name": "Player2", "rank_score": 2400},  # Diamond
        {"name": "Player3", "rank_score": 1800},  # Platinum
        {"name": "Player4", "rank_score": 1700},  # Platinum
        {"name": "Player5", "rank_score": 1200},  # Gold
        {"name": "Player6", "rank_score": 1100},  # Gold
        {"name": "Player7", "rank_score": 800},   # Silver
        {"name": "Player8", "rank_score": 700},   # Silver
        {"name": "Player9", "rank_score": 400},   # Bronze
        {"name": "Player10", "rank_score": 300},  # Bronze
    ]
    
    print("テストプレイヤー:")
    for player in test_players:
        print(f"  {player['name']}: {player['rank_score']}")
    
    print("\n組み分け実行中...")
    team1, team2 = TeamBalancer.balance_teams(test_players)
    
    avg1 = TeamBalancer.calculate_team_average(team1)
    avg2 = TeamBalancer.calculate_team_average(team2)
    
    print(f"\n🔵 チーム1 (平均: {avg1}):")
    for player in team1:
        print(f"  {player['name']}: {player['rank_score']}")
    print(f"  合計: {sum(p['rank_score'] for p in team1)}")
    
    print(f"\n🔴 チーム2 (平均: {avg2}):")
    for player in team2:
        print(f"  {player['name']}: {player['rank_score']}")
    print(f"  合計: {sum(p['rank_score'] for p in team2)}")
    
    print(f"\nスコア差: {abs(avg1 - avg2):.2f}")
    print("\n✓ チームバランサーテスト完了")


def main():
    """メインテスト実行"""
    print("=" * 60)
    print("League of Legends 汎用ツール - テストスクリプト")
    print("=" * 60)
    print()
    
    # Riot APIテスト
    api_test_result = test_riot_api()
    
    # チームバランサーテスト
    test_team_balancer()
    
    print("\n" + "=" * 60)
    if api_test_result:
        print("✓ すべてのテストが完了しました")
    else:
        print("⚠ 一部のテストに問題がありました")
    print("=" * 60)


if __name__ == "__main__":
    main()
