"""
Vercel Serverless Function: デバッグ用API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """デバッグ情報を返す"""
        try:
            # 環境変数チェック
            riot_api_key = os.getenv("RIOT_API_KEY")
            has_api_key = riot_api_key is not None and len(riot_api_key) > 0
            
            # パス情報
            current_path = os.path.dirname(os.path.abspath(__file__))
            
            # モジュールインポートテスト
            import_status = {}
            
            try:
                sys.path.append(current_path)
                from riot_client import RiotAPIClient
                import_status['riot_client'] = 'OK'
            except Exception as e:
                import_status['riot_client'] = str(e)
            
            try:
                from utils import get_player_stats, format_game_duration
                import_status['utils_basic'] = 'OK'
            except Exception as e:
                import_status['utils_basic'] = str(e)
            
            try:
                from utils import calculate_performance_score, get_detailed_match_info
                import_status['utils_advanced'] = 'OK'
            except Exception as e:
                import_status['utils_advanced'] = str(e)
            
            # レスポンス
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            debug_info = {
                'status': 'debug_ok',
                'environment': {
                    'has_riot_api_key': has_api_key,
                    'api_key_length': len(riot_api_key) if riot_api_key else 0,
                    'current_path': current_path,
                    'python_path': sys.path[:3],  # 最初の3つのパスのみ
                },
                'imports': import_status,
                'files_in_api_dir': os.listdir(current_path) if os.path.exists(current_path) else []
            }
            
            self.wfile.write(json.dumps(debug_info, ensure_ascii=False, indent=2).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_data = {
                'status': 'debug_error',
                'error': str(e),
                'error_type': type(e).__name__
            }
            self.wfile.write(json.dumps(error_data).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()