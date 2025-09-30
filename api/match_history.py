"""
Vercel Serverless Function: 戦績取得API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# APIモジュールのパスを追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from riot_client import RiotAPIClient
from utils import get_player_stats, format_game_duration


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # リクエストボディを読み取る
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            game_name = data.get('game_name')
            tag_line = data.get('tag_line')
            count = data.get('count', 20)
            region = data.get('region', 'jp1')
            routing = data.get('routing', 'asia')
            
            if not game_name or not tag_line:
                self.send_error_response({'error': 'ゲーム名とタグラインが必要です'}, 400)
                return
            
            # Riot APIクライアント初期化
            riot_client = RiotAPIClient(region=region, routing=routing)
            
            # アカウント情報取得
            account = riot_client.get_account_by_riot_id(game_name, tag_line)
            if not account:
                self.send_error_response({'error': 'プレイヤーが見つかりませんでした'}, 404)
                return
            
            puuid = account['puuid']
            
            # サモナー情報取得
            summoner = riot_client.get_summoner_by_puuid(puuid)
            
            # ランク情報取得（PUUIDから直接）
            ranked_stats = riot_client.get_ranked_stats_by_puuid(puuid) or []
            
            # 試合履歴取得
            match_ids = riot_client.get_match_history(puuid, count)
            if not match_ids:
                self.send_error_response({'error': '試合履歴が見つかりませんでした'}, 404)
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
                            'game_creation': match_data['info']['gameCreation'],
                            'stats': player_stats
                        })
            
            # 成功レスポンス
            self.send_success_response({
                'summoner': {
                    'game_name': game_name,
                    'tag_line': tag_line,
                    'level': summoner.get('summonerLevel') if summoner else 'N/A',
                    'profile_icon_id': summoner.get('profileIconId') if summoner else 0
                },
                'ranked_stats': ranked_stats,
                'matches': matches
            })
            
        except Exception as e:
            print(f"Error in match_history: {e}")
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
