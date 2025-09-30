"""
Vercel Serverless Function: 現在のゲーム情報取得API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# APIモジュールのパスを追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from riot_client import RiotAPIClient
from utils import format_rank


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """GETリクエスト対応（クエリパラメータから取得）"""
        try:
            from urllib.parse import urlparse, parse_qs
            
            # URLパースしてクエリパラメータを取得
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            
            game_name = params.get('game_name', [None])[0]
            tag_line = params.get('tag_line', [None])[0]
            region = params.get('region', ['jp1'])[0]
            routing = params.get('routing', ['asia'])[0]
            
            if not game_name or not tag_line:
                self.send_error_response({'error': 'ゲーム名とタグラインが必要です'}, 400)
                return
            
            # 共通処理を実行
            self._process_current_game(game_name, tag_line, region, routing)
            
        except Exception as e:
            print(f"Error in current_game GET: {e}")
            self.send_error_response({'error': str(e)}, 500)
    
    def do_POST(self):
        """POSTリクエスト対応（JSONボディから取得）"""
        try:
            # リクエストボディを読み取る
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            game_name = data.get('game_name')
            tag_line = data.get('tag_line')
            region = data.get('region', 'jp1')
            routing = data.get('routing', 'asia')
            
            if not game_name or not tag_line:
                self.send_error_response({'error': 'ゲーム名とタグラインが必要です'}, 400)
                return
            
            # 共通処理を実行
            self._process_current_game(game_name, tag_line, region, routing)
            
        except Exception as e:
            print(f"Error in current_game POST: {e}")
            self.send_error_response({'error': str(e)}, 500)
    
    def _process_current_game(self, game_name, tag_line, region, routing):
        """現在のゲーム情報取得の共通処理"""
        try:
            # Riot APIクライアント初期化
            riot_client = RiotAPIClient(region=region, routing=routing)
            
            # アカウント情報取得
            account = riot_client.get_account_by_riot_id(game_name, tag_line)
            if not account:
                self.send_error_response({'error': 'プレイヤーが見つかりませんでした'}, 404)
                return
            
            puuid = account['puuid']
            
            # 現在のゲーム情報取得
            current_game = riot_client.get_current_game(puuid)
            if not current_game:
                self.send_error_response({'error': 'ゲーム中ではありません'}, 404)
                return
            
            # 各プレイヤーの情報を取得
            players = []
            for participant in current_game.get('participants', []):
                player_puuid = participant['puuid']
                summoner = riot_client.get_summoner_by_puuid(player_puuid)
                
                ranked_stats = []
                rank_info = "Unranked"
                rank_score = 0
                
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
                    'summoner_name': participant.get('summonerName', 'Unknown'),
                    'champion_id': participant['championId'],
                    'team_id': participant['teamId'],
                    'rank': rank_info,
                    'summoner_level': summoner.get('summonerLevel', 0) if summoner else 0
                })
            
            # 成功レスポンス
            self.send_success_response({
                'game_mode': current_game.get('gameMode'),
                'game_type': current_game.get('gameType'),
                'game_length': current_game.get('gameLength', 0),
                'map_id': current_game.get('mapId'),
                'players': players
            })
            
        except Exception as e:
            print(f"Error in _process_current_game: {e}")
            self.send_error_response({'error': str(e)}, 500)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_success_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def send_error_response(self, data, status_code):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
