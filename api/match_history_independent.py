"""
Vercel Serverless Function: 独立した戦績取得API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import requests
import time


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """戦績取得"""
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
            
            # サモナー情報取得
            summoner_url = f"https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
            summoner_response = requests.get(summoner_url, headers=headers)
            summoner_data = summoner_response.json() if summoner_response.status_code == 200 else {}
            
            # 試合履歴取得
            matches_url = f"https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=10"
            matches_response = requests.get(matches_url, headers=headers)
            
            if matches_response.status_code != 200:
                self.send_error({'error': f'試合履歴取得失敗: {matches_response.status_code}'}, 404)
                return
            
            match_ids = matches_response.json()
            
            # 詳細な試合データを取得
            matches = []
            for i, match_id in enumerate(match_ids[:5]):  # 最初の5試合のみ詳細取得
                try:
                    match_url = f"https://asia.api.riotgames.com/lol/match/v5/matches/{match_id}"
                    match_response = requests.get(match_url, headers=headers)
                    
                    if match_response.status_code == 200:
                        match_data = match_response.json()
                        
                        # プレイヤーの統計を抽出
                        player_stats = self.extract_player_stats(match_data, puuid)
                        if player_stats:
                            matches.append({
                                'match_id': match_id,
                                'game_duration': self.format_duration(match_data['info']['gameDuration']),
                                'game_mode': match_data['info']['gameMode'],
                                'game_creation': match_data['info']['gameCreation'],
                                'stats': player_stats
                            })
                    
                    # API制限対策
                    time.sleep(0.1)
                    
                except Exception as e:
                    print(f"Error processing match {match_id}: {e}")
                    continue
            
            # 成功レスポンス
            response_data = {
                'summoner': {
                    'game_name': game_name,
                    'tag_line': tag_line,
                    'level': summoner_data.get('summonerLevel', 'N/A'),
                    'profile_icon_id': summoner_data.get('profileIconId', 0)
                },
                'matches': matches,
                'status': 'independent_success'
            }
            
            self.send_success(response_data)
            
        except Exception as e:
            self.send_error({'error': f'内部エラー: {str(e)}'}, 500)
    
    def extract_player_stats(self, match_data, puuid):
        """プレイヤー統計を抽出"""
        try:
            participants = match_data['info']['participants']
            
            for participant in participants:
                if participant.get('puuid') == puuid:
                    # 基本統計
                    stats = {
                        'champion': participant.get('championName'),
                        'champion_level': participant.get('champLevel'),
                        'kills': participant.get('kills', 0),
                        'deaths': participant.get('deaths', 0),
                        'assists': participant.get('assists', 0),
                        'cs': participant.get('totalMinionsKilled', 0) + participant.get('neutralMinionsKilled', 0),
                        'gold': participant.get('goldEarned', 0),
                        'win': participant.get('win', False),
                        'position': participant.get('teamPosition', 'NONE'),
                        'items': [
                            participant.get('item0', 0),
                            participant.get('item1', 0),
                            participant.get('item2', 0),
                            participant.get('item3', 0),
                            participant.get('item4', 0),
                            participant.get('item5', 0),
                        ]
                    }
                    
                    # KDA計算
                    if stats['deaths'] == 0:
                        stats['kda'] = round((stats['kills'] + stats['assists']), 2)
                    else:
                        stats['kda'] = round((stats['kills'] + stats['assists']) / stats['deaths'], 2)
                    
                    # CS/min計算
                    game_duration_minutes = match_data['info']['gameDuration'] / 60
                    if game_duration_minutes > 0:
                        stats['cs_per_minute'] = round(stats['cs'] / game_duration_minutes, 1)
                        stats['gold_per_minute'] = round(stats['gold'] / game_duration_minutes, 0)
                    else:
                        stats['cs_per_minute'] = 0
                        stats['gold_per_minute'] = 0
                    
                    # ダメージ情報
                    stats['damage'] = {
                        'total_damage_to_champions': participant.get('totalDamageDealtToChampions', 0)
                    }
                    
                    # ビジョン情報
                    stats['vision'] = {
                        'vision_score': participant.get('visionScore', 0)
                    }
                    
                    return stats
            
            return None
            
        except Exception as e:
            print(f"Error extracting player stats: {e}")
            return None
    
    def format_duration(self, seconds):
        """ゲーム時間をフォーマット"""
        try:
            minutes = seconds // 60
            seconds = seconds % 60
            return f"{minutes}:{seconds:02d}"
        except:
            return "0:00"
    
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