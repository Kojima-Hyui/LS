"""
Flaskを使用したWebアプリケーション
"""
from flask import Flask, render_template, request, jsonify
from riot_api import RiotAPIClient
from game_utils import MatchAnalyzer, TeamBalancer, format_rank
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')

riot_client = RiotAPIClient()


@app.route('/')
def index():
    """トップページ"""
    return render_template('index.html')


@app.route('/api/match-history', methods=['POST'])
def get_match_history():
    """戦績取得API"""
    data = request.json
    game_name = data.get('game_name')
    tag_line = data.get('tag_line')
    count = data.get('count', 20)
    
    if not game_name or not tag_line:
        return jsonify({'error': 'ゲーム名とタグラインが必要です'}), 400
    
    # アカウント情報取得
    account = riot_client.get_account_by_riot_id(game_name, tag_line)
    if not account:
        return jsonify({'error': 'プレイヤーが見つかりませんでした'}), 404
    
    puuid = account['puuid']
    
    # サモナー情報取得
    summoner = riot_client.get_summoner_by_puuid(puuid)
    
    # ランク情報取得
    ranked_stats = []
    if summoner:
        ranked_stats = riot_client.get_ranked_stats(summoner['id']) or []
    
    # 試合履歴取得
    match_ids = riot_client.get_match_history(puuid, count)
    if not match_ids:
        return jsonify({'error': '試合履歴が見つかりませんでした'}), 404
    
    matches = []
    for match_id in match_ids[:count]:
        match_data = riot_client.get_match_detail(match_id)
        if match_data:
            player_stats = MatchAnalyzer.get_player_stats(match_data, puuid)
            if player_stats:
                matches.append({
                    'match_id': match_id,
                    'game_duration': MatchAnalyzer.format_game_duration(
                        match_data['info']['gameDuration']
                    ),
                    'game_mode': match_data['info']['gameMode'],
                    'stats': player_stats
                })
    
    return jsonify({
        'summoner': {
            'game_name': game_name,
            'tag_line': tag_line,
            'level': summoner.get('summonerLevel') if summoner else 'N/A'
        },
        'ranked_stats': ranked_stats,
        'matches': matches
    })


@app.route('/api/current-game', methods=['POST'])
def get_current_game():
    """現在のゲーム情報取得API"""
    data = request.json
    game_name = data.get('game_name')
    tag_line = data.get('tag_line')
    
    if not game_name or not tag_line:
        return jsonify({'error': 'ゲーム名とタグラインが必要です'}), 400
    
    # アカウント情報取得
    account = riot_client.get_account_by_riot_id(game_name, tag_line)
    if not account:
        return jsonify({'error': 'プレイヤーが見つかりませんでした'}), 404
    
    puuid = account['puuid']
    
    # 現在のゲーム情報取得
    current_game = riot_client.get_current_game(puuid)
    if not current_game:
        return jsonify({'error': 'ゲーム中ではありません'}), 404
    
    # 各プレイヤーの情報を取得
    players = []
    for participant in current_game.get('participants', []):
        player_puuid = participant['puuid']
        summoner = riot_client.get_summoner_by_puuid(player_puuid)
        
        ranked_stats = []
        rank_info = "Unranked"
        if summoner:
            ranked_stats = riot_client.get_ranked_stats(summoner['id']) or []
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
            'rank': rank_info,
            'ranked_stats': ranked_stats
        })
    
    return jsonify({
        'game_mode': current_game.get('gameMode'),
        'game_length': current_game.get('gameLength', 0),
        'players': players
    })


@app.route('/api/balance-teams', methods=['POST'])
def balance_teams():
    """チームバランスAPI"""
    data = request.json
    riot_ids = data.get('riot_ids', [])
    
    if len(riot_ids) != 10:
        return jsonify({'error': '10人のプレイヤーが必要です'}), 400
    
    players_data = []
    
    for riot_id in riot_ids:
        try:
            game_name, tag_line = riot_id.split('#')
        except ValueError:
            return jsonify({'error': f'無効なRiot ID: {riot_id}'}), 400
        
        # アカウント情報取得
        account = riot_client.get_account_by_riot_id(game_name, tag_line)
        if not account:
            return jsonify({'error': f'プレイヤーが見つかりません: {riot_id}'}), 404
        
        puuid = account['puuid']
        summoner = riot_client.get_summoner_by_puuid(puuid)
        
        # ランク情報取得
        rank_score = 0
        rank_info = "Unranked"
        if summoner:
            ranked_stats = riot_client.get_ranked_stats(summoner['id']) or []
            for rank in ranked_stats:
                if rank['queueType'] == 'RANKED_SOLO_5x5':
                    rank_score = MatchAnalyzer.get_rank_score(
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
    team1, team2 = TeamBalancer.balance_teams(players_data)
    
    return jsonify({
        'team1': {
            'players': team1,
            'average_score': TeamBalancer.calculate_team_average(team1)
        },
        'team2': {
            'players': team2,
            'average_score': TeamBalancer.calculate_team_average(team2)
        },
        'score_difference': abs(
            TeamBalancer.calculate_team_average(team1) - 
            TeamBalancer.calculate_team_average(team2)
        )
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
