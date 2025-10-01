"""
Vercel Serverless Function: 最小限の戦績取得API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import requests
import time


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """最小限の戦績取得"""
        try:
            from urllib.parse import urlparse, parse_qs
            
            # URLパース
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            
            game_name = params.get('game_name', [None])[0]
            tag_line = params.get('tag_line', [None])[0]
            
            if not game_name or not tag_line:
                self.send_error({'error': 'ゲーム名とタグラインが必要です'}, 400)
                return
            
            # 環境変数チェック
            api_key = os.getenv("RIOT_API_KEY")
            if not api_key:
                self.send_error({'error': 'API キーが設定されていません'}, 500)
                return
            
            # 直接APIコール
            headers = {"X-Riot-Token": api_key}
            
            # アカウント情報取得
            account_url = f"https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
            account_response = requests.get(account_url, headers=headers)
            
            if account_response.status_code != 200:
                self.send_error({'error': f'アカウントが見つかりません: {account_response.status_code}'}, 404)
                return
            
            account_data = account_response.json()
            puuid = account_data['puuid']
            
            # 試合履歴取得（最新5試合のみ）
            matches_url = f"https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=5"
            matches_response = requests.get(matches_url, headers=headers)
            
            if matches_response.status_code != 200:
                self.send_error({'error': f'試合履歴取得失敗: {matches_response.status_code}'}, 404)
                return
            
            match_ids = matches_response.json()
            
            # 成功レスポンス（詳細は後で追加）
            response_data = {
                'summoner': {
                    'game_name': game_name,
                    'tag_line': tag_line,
                    'puuid': puuid[:8] + '...',  # 部分表示
                },
                'match_count': len(match_ids),
                'match_ids': match_ids[:3],  # 最初の3つのみ表示
                'status': 'basic_success'
            }
            
            self.send_success(response_data)
            
        except Exception as e:
            self.send_error({'error': f'内部エラー: {str(e)}'}, 500)
    
    def send_success(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def send_error(self, data, status_code):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()