"""
Vercel Serverless Function: 個別試合詳細API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# APIモジュールのパスを追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from riot_client import RiotAPIClient
    from utils import get_player_stats, format_game_duration, calculate_performance_score, get_detailed_match_info
except ImportError:
    # フォールバック: 親ディレクトリから読み込み
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from api.riot_client import RiotAPIClient
    from api.utils import get_player_stats, format_game_duration, calculate_performance_score, get_detailed_match_info


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """GETリクエスト対応（クエリパラメータから取得）"""
        try:
            from urllib.parse import urlparse, parse_qs
            
            # URLパースしてクエリパラメータを取得
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            
            match_id = params.get('match_id', [None])[0]
            region = params.get('region', ['jp1'])[0]
            routing = params.get('routing', ['asia'])[0]
            
            if not match_id:
                self.send_error_response({'error': 'マッチIDが必要です'}, 400)
                return
            
            # 共通処理を実行
            self._process_match_detail(match_id, region, routing)
            
        except Exception as e:
            print(f"Error in match_detail GET: {e}")
            self.send_error_response({'error': str(e)}, 500)
    
    def do_POST(self):
        """POSTリクエスト対応（JSONボディから取得）"""
        try:
            # リクエストボディを読み取る
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            match_id = data.get('match_id')
            region = data.get('region', 'jp1')
            routing = data.get('routing', 'asia')
            
            if not match_id:
                self.send_error_response({'error': 'マッチIDが必要です'}, 400)
                return
            
            # 共通処理を実行
            self._process_match_detail(match_id, region, routing)
            
        except Exception as e:
            print(f"Error in match_detail POST: {e}")
            self.send_error_response({'error': str(e)}, 500)
    
    def _process_match_detail(self, match_id, region, routing):
        """試合詳細取得の共通処理"""
        try:
            # Riot APIクライアント初期化
            riot_client = RiotAPIClient(region=region, routing=routing)
            
            # 試合詳細取得
            match_data = riot_client.get_match_detail(match_id)
            if not match_data:
                self.send_error_response({'error': '試合データが見つかりませんでした'}, 404)
                return
            
            # 詳細な試合情報を取得
            detailed_info = get_detailed_match_info(match_data)
            
            # 全参加者の詳細統計を取得
            participants = []
            for participant in match_data.get("info", {}).get("participants", []):
                puuid = participant.get("puuid")
                player_stats = get_player_stats(match_data, puuid)
                
                if player_stats:
                    performance_score = calculate_performance_score(player_stats)
                    
                    participants.append({
                        'puuid': puuid,
                        'riot_id': f"{participant.get('riotIdGameName', 'Unknown')}#{participant.get('riotIdTagline', 'NA1')}",
                        'stats': player_stats,
                        'performance_score': performance_score
                    })
            
            # チーム別に分類
            blue_team = [p for p in participants if p['stats']['team_id'] == 100]
            red_team = [p for p in participants if p['stats']['team_id'] == 200]
            
            # 成功レスポンス
            self.send_success_response({
                'match_info': detailed_info,
                'participants': {
                    'blue_team': blue_team,
                    'red_team': red_team
                },
                'total_participants': len(participants)
            })
            
        except Exception as e:
            print(f"Error in _process_match_detail: {e}")
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