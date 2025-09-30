"""
Vercel Serverless Function: チームバランス組み分けAPI
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# APIモジュールのパスを追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from riot_client import RiotAPIClient
from utils import get_rank_score, balance_teams, calculate_team_average, format_rank


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # リクエストボディを読み取る
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            riot_ids = data.get('riot_ids', [])
            region = data.get('region', 'jp1')
            routing = data.get('routing', 'asia')
            
            if len(riot_ids) != 10:
                self.send_error_response({'error': '10人のプレイヤーが必要です'}, 400)
                return
            
            # Riot APIクライアント初期化
            riot_client = RiotAPIClient(region=region, routing=routing)
            
            players_data = []
            
            for riot_id in riot_ids:
                try:
                    game_name, tag_line = riot_id.split('#')
                except ValueError:
                    self.send_error_response({'error': f'無効なRiot ID: {riot_id}'}, 400)
                    return
                
                # アカウント情報取得
                account = riot_client.get_account_by_riot_id(game_name, tag_line)
                if not account:
                    self.send_error_response({'error': f'プレイヤーが見つかりません: {riot_id}'}, 404)
                    return
                
                puuid = account['puuid']
                summoner = riot_client.get_summoner_by_puuid(puuid)
                
                # ランク情報取得
                rank_score = 0
                rank_info = "Unranked"
                tier = "UNRANKED"
                division = ""
                lp = 0
                
                ranked_stats = riot_client.get_ranked_stats_by_puuid(puuid) or []
                for rank in ranked_stats:
                    if rank['queueType'] == 'RANKED_SOLO_5x5':
                        tier = rank['tier']
                        division = rank.get('rank', 'I')
                        lp = rank['leaguePoints']
                        rank_score = get_rank_score(tier, division, lp)
                        rank_info = format_rank(tier, division, lp)
                        break
                
                players_data.append({
                    'riot_id': riot_id,
                    'rank_score': rank_score,
                    'rank_info': rank_info,
                    'tier': tier,
                    'division': division,
                    'lp': lp
                })
            
            # チーム分け
            team1, team2 = balance_teams(players_data)
            
            # 成功レスポンス
            self.send_success_response({
                'team1': {
                    'players': team1,
                    'average_score': calculate_team_average(team1),
                    'total_score': sum(p.get('rank_score', 0) for p in team1)
                },
                'team2': {
                    'players': team2,
                    'average_score': calculate_team_average(team2),
                    'total_score': sum(p.get('rank_score', 0) for p in team2)
                },
                'score_difference': abs(
                    calculate_team_average(team1) - 
                    calculate_team_average(team2)
                )
            })
            
        except Exception as e:
            print(f"Error in balance_teams: {e}")
            import traceback
            traceback.print_exc()
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
