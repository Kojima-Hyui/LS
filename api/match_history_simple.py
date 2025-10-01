"""
Vercel Serverless Function: 戦績取得API (Simple Version)
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
    def do_GET(self):
        """GETリクエスト対応（クエリパラメータから取得）"""
        try:
            from urllib.parse import urlparse, parse_qs
            
            # URLパースしてクエリパラメータを取得
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            
            game_name = params.get('game_name', [None])[0]
            tag_line = params.get('tag_line', [None])[0]
            count = int(params.get('count', [20])[0])
            region = params.get('region', ['jp1'])[0]
            routing = params.get('routing', ['asia'])[0]
            
            if not game_name or not tag_line:
                self.send_error_response({'error': 'ゲーム名とタグラインが必要です'}, 400)
                return
            
            # 共通処理を実行
            self._process_match_history(game_name, tag_line, count, region, routing)
            
        except Exception as e:
            print(f"Error in match_history GET: {e}")
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
            count = data.get('count', 20)
            region = data.get('region', 'jp1')
            routing = data.get('routing', 'asia')
            
            if not game_name or not tag_line:
                self.send_error_response({'error': 'ゲーム名とタグラインが必要です'}, 400)
                return
            
            # 共通処理を実行
            self._process_match_history(game_name, tag_line, count, region, routing)
            
        except Exception as e:
            print(f"Error in match_history POST: {e}")
            self.send_error_response({'error': str(e)}, 500)
    
    def _process_match_history(self, game_name, tag_line, count, region, routing):
        """戦績取得の共通処理（シンプル版）"""
        try:
            print(f"Processing match history for {game_name}#{tag_line}")
            
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
            
            # ランク情報取得
            ranked_stats = []
            try:
                if summoner and summoner.get('id'):
                    ranked_stats = riot_client.get_ranked_stats(summoner['id']) or []
            except Exception as e:
                print(f"Ranked stats error: {e}")
            
            # 試合履歴取得
            match_ids = riot_client.get_match_history(puuid, count)
            if not match_ids:
                self.send_error_response({'error': '試合履歴が見つかりませんでした'}, 404)
                return
            
            matches = []
            for match_id in match_ids[:count]:
                try:
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
                except Exception as e:
                    print(f"Error processing match {match_id}: {e}")
                    continue
            
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
            print(f"Error in _process_match_history: {e}")
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