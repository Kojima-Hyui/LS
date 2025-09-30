"""
Vercel Serverless Functions ローカルテストサーバー
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import sys
import os
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# APIモジュールのパスを追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

from api.riot_client import RiotAPIClient
from api.utils import (
    get_player_stats, 
    format_game_duration, 
    format_rank,
    get_rank_score,
    balance_teams,
    calculate_team_average
)


class LocalTestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        """静的ファイルを提供"""
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
        return SimpleHTTPRequestHandler.do_GET(self)
    
    def do_POST(self):
        """APIエンドポイント処理"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/match_history':
            self.handle_match_history()
        elif parsed_path.path == '/api/current_game':
            self.handle_current_game()
        elif parsed_path.path == '/api/balance_teams':
            self.handle_balance_teams()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_match_history(self):
        """戦績取得"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            game_name = data.get('game_name')
            tag_line = data.get('tag_line')
            count = data.get('count', 20)
            
            riot_client = RiotAPIClient()
            
            # アカウント情報取得
            account = riot_client.get_account_by_riot_id(game_name, tag_line)
            if not account:
                self.send_json_response({'error': 'プレイヤーが見つかりませんでした'}, 404)
                return
            
            puuid = account['puuid']
            summoner = riot_client.get_summoner_by_puuid(puuid)
            
            # デバッグ: サモナー情報を出力
            print(f"Summoner data: {summoner}")
            
            # ランク情報取得（PUUIDから直接）
            ranked_stats = riot_client.get_ranked_stats_by_puuid(puuid) or []
            
            # 試合履歴取得
            match_ids = riot_client.get_match_history(puuid, count)
            if not match_ids:
                self.send_json_response({'error': '試合履歴が見つかりませんでした'}, 404)
                return
            
            matches = []
            for match_id in match_ids[:count]:
                match_data = riot_client.get_match_detail(match_id)
                if match_data:
                    player_stats = get_player_stats(match_data, puuid)
                    if player_stats:
                        matches.append({
                            'match_id': match_id,
                            'game_duration': format_game_duration(
                                match_data['info']['gameDuration']
                            ),
                            'game_mode': match_data['info']['gameMode'],
                            'stats': player_stats
                        })
            
            self.send_json_response({
                'summoner': {
                    'game_name': game_name,
                    'tag_line': tag_line,
                    'level': summoner.get('summonerLevel') if summoner else 'N/A'
                },
                'ranked_stats': ranked_stats,
                'matches': matches
            })
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            self.send_json_response({'error': str(e)}, 500)
    
    def handle_current_game(self):
        """現在のゲーム情報取得"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            game_name = data.get('game_name')
            tag_line = data.get('tag_line')
            
            riot_client = RiotAPIClient()
            
            # アカウント情報取得
            account = riot_client.get_account_by_riot_id(game_name, tag_line)
            if not account:
                self.send_json_response({'error': 'プレイヤーが見つかりませんでした'}, 404)
                return
            
            puuid = account['puuid']
            current_game = riot_client.get_current_game(puuid)
            
            if not current_game:
                self.send_json_response({'error': 'ゲーム中ではありません'}, 404)
                return
            
            # 各プレイヤーの情報を取得
            players = []
            for participant in current_game.get('participants', []):
                player_puuid = participant['puuid']
                summoner = riot_client.get_summoner_by_puuid(player_puuid)
                
                rank_info = "Unranked"
                ranked_stats = riot_client.get_ranked_stats_by_puuid(player_puuid) or []
                if ranked_stats:
                    for rank in ranked_stats:
                        if rank['queueType'] == 'RANKED_SOLO_5x5':
                            rank_info = format_rank(
                                rank['tier'],
                                rank.get('rank', ''),
                                rank['leaguePoints']
                            )
                            break
                
                players.append({
                    'riot_id': participant.get('riotId', 'Unknown'),
                    'champion_id': participant['championId'],
                    'team_id': participant['teamId'],
                    'rank': rank_info
                })
            
            self.send_json_response({
                'game_mode': current_game.get('gameMode'),
                'game_length': current_game.get('gameLength', 0),
                'players': players
            })
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            self.send_json_response({'error': str(e)}, 500)
    
    def handle_balance_teams(self):
        """チームバランス組み分け"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            riot_ids = data.get('riot_ids', [])
            
            if len(riot_ids) != 10:
                self.send_json_response({'error': '10人のプレイヤーが必要です'}, 400)
                return
            
            riot_client = RiotAPIClient()
            players_data = []
            
            for riot_id in riot_ids:
                game_name, tag_line = riot_id.split('#')
                
                # アカウント情報取得
                account = riot_client.get_account_by_riot_id(game_name, tag_line)
                if not account:
                    self.send_json_response({'error': f'プレイヤーが見つかりません: {riot_id}'}, 404)
                    return
                
                puuid = account['puuid']
                summoner = riot_client.get_summoner_by_puuid(puuid)
                
                # ランク情報取得
                rank_score = 0
                rank_info = "Unranked"
                
                ranked_stats = riot_client.get_ranked_stats_by_puuid(puuid) or []
                for rank in ranked_stats:
                    if rank['queueType'] == 'RANKED_SOLO_5x5':
                        rank_score = get_rank_score(
                            rank['tier'],
                            rank.get('rank', 'I'),
                            rank['leaguePoints']
                        )
                        rank_info = format_rank(
                            rank['tier'],
                            rank.get('rank', ''),
                            rank['leaguePoints']
                        )
                        break
                
                players_data.append({
                    'riot_id': riot_id,
                    'rank_score': rank_score,
                    'rank_info': rank_info
                })
            
            # チーム分け
            team1, team2 = balance_teams(players_data)
            
            self.send_json_response({
                'team1': {
                    'players': team1,
                    'average_score': calculate_team_average(team1)
                },
                'team2': {
                    'players': team2,
                    'average_score': calculate_team_average(team2)
                },
                'score_difference': abs(
                    calculate_team_average(team1) - 
                    calculate_team_average(team2)
                )
            })
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            self.send_json_response({'error': str(e)}, 500)
    
    def send_json_response(self, data, status_code=200):
        """JSON レスポンスを送信"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        """CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def main():
    """ローカルテストサーバーを起動"""
    print("=" * 60)
    print("LoL 汎用ツール - ローカルテストサーバー")
    print("=" * 60)
    print()
    
    # 環境変数チェック
    api_key = os.getenv("RIOT_API_KEY")
    if not api_key:
        print("⚠️  警告: RIOT_API_KEYが設定されていません")
        print("   .envファイルを確認するか、以下のコマンドで設定してください:")
        print("   set RIOT_API_KEY=your_api_key_here  # Windows")
        print("   export RIOT_API_KEY=your_api_key_here  # Linux/Mac")
        print()
    else:
        print(f"✓ RIOT_API_KEY: {api_key[:10]}...")
        print()
    
    port = 8000
    server = HTTPServer(('0.0.0.0', port), LocalTestHandler)
    
    print(f"🚀 サーバー起動: http://localhost:{port}")
    print()
    print("利用可能なエンドポイント:")
    print(f"  - GET  http://localhost:{port}/")
    print(f"  - POST http://localhost:{port}/api/match_history")
    print(f"  - POST http://localhost:{port}/api/current_game")
    print(f"  - POST http://localhost:{port}/api/balance_teams")
    print()
    print("サーバーを停止するには Ctrl+C を押してください")
    print("=" * 60)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nサーバーを停止しました")
        server.shutdown()


if __name__ == '__main__':
    main()
