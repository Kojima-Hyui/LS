"""
Vercel Serverless Function: 詳細パフォーマンス分析API
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# APIモジュールのパスを追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from riot_client import RiotAPIClient
from utils import get_player_stats, calculate_performance_score


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # リクエストボディを読み取る
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            riot_id = data.get('riot_id', '')
            region = data.get('region', 'jp1')
            routing = data.get('routing', 'asia')
            match_count = data.get('match_count', 10)
            
            if not riot_id:
                self.send_error_response({'error': 'Riot IDが必要です'}, 400)
                return
            
            try:
                game_name, tag_line = riot_id.split('#')
            except ValueError:
                self.send_error_response({'error': f'無効なRiot ID: {riot_id}'}, 400)
                return
            
            # Riot APIクライアント初期化
            riot_client = RiotAPIClient(region=region, routing=routing)
            
            # アカウント情報取得
            account = riot_client.get_account_by_riot_id(game_name, tag_line)
            if not account:
                self.send_error_response({'error': f'プレイヤーが見つかりません: {riot_id}'}, 404)
                return
            
            puuid = account['puuid']
            
            # 最近の試合IDを取得
            recent_matches = riot_client.get_recent_matches(puuid, count=match_count)
            if not recent_matches:
                self.send_error_response({'error': '試合データが見つかりません'}, 404)
                return
            
            # 各試合の詳細パフォーマンス分析
            match_analyses = []
            performance_trends = []
            total_scores = []
            
            for match_id in recent_matches[:match_count]:
                try:
                    match_data = riot_client.get_match_details(match_id)
                    if not match_data:
                        continue
                    
                    # プレイヤー統計取得
                    player_stats = get_player_stats(match_data, puuid)
                    if not player_stats:
                        continue
                    
                    # 試合分析データ構築
                    match_analysis = {
                        'match_id': match_id,
                        'champion': player_stats.get('champion'),
                        'champion_id': player_stats.get('champion_id'),
                        'position': player_stats.get('position'),
                        'win': player_stats.get('win'),
                        'kda': f"{player_stats.get('kills', 0)}/{player_stats.get('deaths', 0)}/{player_stats.get('assists', 0)}",
                        'game_duration': player_stats.get('game_duration', 0),
                        'performance_analysis': player_stats.get('performance_analysis', {}),
                        'game_creation': match_data.get('info', {}).get('gameCreation', 0)
                    }
                    
                    match_analyses.append(match_analysis)
                    
                    # パフォーマンストレンド用データ
                    perf_data = player_stats.get('performance_analysis', {})
                    if perf_data:
                        total_scores.append(perf_data.get('total_score', 0))
                        performance_trends.append({
                            'match_index': len(performance_trends),
                            'total_score': perf_data.get('total_score', 0),
                            'breakdown': perf_data.get('breakdown', {}),
                            'win': player_stats.get('win', False)
                        })
                    
                except Exception as e:
                    print(f"Error processing match {match_id}: {e}")
                    continue
            
            if not match_analyses:
                self.send_error_response({'error': '分析可能な試合データがありません'}, 404)
                return
            
            # 総合統計計算
            overall_stats = calculate_overall_performance_stats(match_analyses)
            
            # 成功レスポンス
            self.send_success_response({
                'player_info': {
                    'riot_id': riot_id,
                    'puuid': puuid,
                    'region': region
                },
                'overall_stats': overall_stats,
                'match_analyses': match_analyses,
                'performance_trends': performance_trends,
                'analysis_metadata': {
                    'total_matches_analyzed': len(match_analyses),
                    'requested_matches': match_count,
                    'analysis_date': riot_client.get_current_timestamp()
                }
            })
            
        except Exception as e:
            print(f"Error in performance_analysis: {e}")
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


def calculate_overall_performance_stats(match_analyses):
    """全試合の総合パフォーマンス統計を計算"""
    if not match_analyses:
        return {}
    
    total_matches = len(match_analyses)
    wins = sum(1 for match in match_analyses if match.get('win', False))
    
    # スコア統計
    total_scores = []
    farming_scores = []
    combat_scores = []
    vision_scores = []
    objective_scores = []
    gold_efficiency_scores = []
    
    for match in match_analyses:
        perf = match.get('performance_analysis', {})
        breakdown = perf.get('breakdown', {})
        
        total_scores.append(perf.get('total_score', 0))
        farming_scores.append(breakdown.get('farming_score', 0))
        combat_scores.append(breakdown.get('combat_score', 0))
        vision_scores.append(breakdown.get('vision_score', 0))
        objective_scores.append(breakdown.get('objective_score', 0))
        gold_efficiency_scores.append(breakdown.get('gold_efficiency', 0))
    
    def calculate_avg(scores):
        return round(sum(scores) / len(scores), 1) if scores else 0
    
    # チャンピオン別統計
    champion_stats = {}
    for match in match_analyses:
        champion = match.get('champion', 'Unknown')
        if champion not in champion_stats:
            champion_stats[champion] = {'games': 0, 'wins': 0, 'total_score': 0}
        
        champion_stats[champion]['games'] += 1
        if match.get('win', False):
            champion_stats[champion]['wins'] += 1
        
        perf = match.get('performance_analysis', {})
        champion_stats[champion]['total_score'] += perf.get('total_score', 0)
    
    # チャンピオン別平均計算
    for champ_data in champion_stats.values():
        if champ_data['games'] > 0:
            champ_data['win_rate'] = round((champ_data['wins'] / champ_data['games']) * 100, 1)
            champ_data['avg_score'] = round(champ_data['total_score'] / champ_data['games'], 1)
    
    return {
        'total_matches': total_matches,
        'win_rate': round((wins / total_matches) * 100, 1),
        'average_scores': {
            'total_score': calculate_avg(total_scores),
            'farming_score': calculate_avg(farming_scores),
            'combat_score': calculate_avg(combat_scores),
            'vision_score': calculate_avg(vision_scores),
            'objective_score': calculate_avg(objective_scores),
            'gold_efficiency': calculate_avg(gold_efficiency_scores)
        },
        'best_performance': {
            'total_score': max(total_scores) if total_scores else 0,
            'match_index': total_scores.index(max(total_scores)) if total_scores else 0
        },
        'champion_performance': champion_stats,
        'recent_form': {
            'last_5_games': {
                'scores': total_scores[-5:] if len(total_scores) >= 5 else total_scores,
                'wins': sum(1 for match in match_analyses[-5:] if match.get('win', False)),
                'avg_score': calculate_avg(total_scores[-5:]) if total_scores else 0
            }
        }
    }