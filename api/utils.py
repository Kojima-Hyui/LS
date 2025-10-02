"""
ゲームユーティリティ関数 - Vercel Serverless Functions用
"""
from typing import List, Dict, Tuple, Optional


def calculate_kda(kills: int, deaths: int, assists: int) -> float:
    """KDAを計算"""
    if deaths == 0:
        return float(kills + assists)
    return round((kills + assists) / deaths, 2)


def format_game_duration(duration_seconds: int) -> str:
    """ゲーム時間をフォーマット"""
    minutes = duration_seconds // 60
    seconds = duration_seconds % 60
    return f"{minutes}:{seconds:02d}"


def get_player_stats(match_data: Dict, puuid: str) -> Optional[Dict]:
    """
    試合データから特定プレイヤーの詳細統計を取得
    
    Args:
        match_data: 試合データ
        puuid: プレイヤーUUID
        
    Returns:
        プレイヤーの詳細統計情報
    """
    participants = match_data.get("info", {}).get("participants", [])
    
    for participant in participants:
        if participant.get("puuid") == puuid:
            # アイテム情報
            items = [
                participant.get("item0", 0),
                participant.get("item1", 0),
                participant.get("item2", 0),
                participant.get("item3", 0),
                participant.get("item4", 0),
                participant.get("item5", 0),
                participant.get("item6", 0)  # ワード等
            ]
            
            # ルーン情報
            perks = participant.get("perks", {})
            primary_style = perks.get("styles", [{}])[0] if perks.get("styles") else {}
            secondary_style = perks.get("styles", [{}])[1] if len(perks.get("styles", [])) > 1 else {}
            stat_perks = perks.get("statPerks", {})
            
            # スペル情報
            summoner_spells = {
                "spell1": participant.get("summoner1Id"),
                "spell2": participant.get("summoner2Id")
            }
            
            # ダメージ詳細
            damage_stats = {
                "total_damage_dealt": participant.get("totalDamageDealt", 0),
                "total_damage_to_champions": participant.get("totalDamageDealtToChampions", 0),
                "physical_damage_to_champions": participant.get("physicalDamageDealtToChampions", 0),
                "magic_damage_to_champions": participant.get("magicDamageDealtToChampions", 0),
                "true_damage_to_champions": participant.get("trueDamageDealtToChampions", 0),
                "total_damage_taken": participant.get("totalDamageTaken", 0),
                "damage_self_mitigated": participant.get("damageSelfMitigated", 0)
            }
            
            # ビジョン関連
            vision_stats = {
                "vision_score": participant.get("visionScore", 0),
                "wards_placed": participant.get("wardsPlaced", 0),
                "wards_killed": participant.get("wardsKilled", 0),
                "control_wards_purchased": participant.get("visionWardsBoughtInGame", 0)
            }
            
            return {
                # 基本情報
                "champion": participant.get("championName"),
                "champion_id": participant.get("championId"),
                "champion_level": participant.get("champLevel"),
                "kills": participant.get("kills"),
                "deaths": participant.get("deaths"),
                "assists": participant.get("assists"),
                "kda": calculate_kda(
                    participant.get("kills", 0),
                    participant.get("deaths", 0),
                    participant.get("assists", 0)
                ),
                "win": participant.get("win"),
                "placement": participant.get("placement"),  # Arenaモードの順位
                "position": participant.get("teamPosition"),
                
                # ファーム関連
                "cs": participant.get("totalMinionsKilled", 0) + participant.get("neutralMinionsKilled", 0),
                "minions_killed": participant.get("totalMinionsKilled", 0),
                "neutral_minions_killed": participant.get("neutralMinionsKilled", 0),
                "cs_per_minute": round(
                    (participant.get("totalMinionsKilled", 0) + participant.get("neutralMinionsKilled", 0)) 
                    / max(match_data.get("info", {}).get("gameDuration", 1) / 60, 1), 1
                ),
                
                # 経済
                "gold": participant.get("goldEarned"),
                "gold_per_minute": round(
                    participant.get("goldEarned", 0) / max(match_data.get("info", {}).get("gameDuration", 1) / 60, 1), 1
                ),
                "gold_spent": participant.get("goldSpent", 0),
                
                # ダメージ統計
                "damage": damage_stats,
                "damage_per_minute": round(
                    participant.get("totalDamageDealtToChampions", 0) 
                    / max(match_data.get("info", {}).get("gameDuration", 1) / 60, 1), 1
                ),
                
                # ビジョン統計
                "vision": vision_stats,
                
                # アイテム
                "items": [item for item in items if item > 0],
                
                # ルーン
                "runes": {
                    "primary_style": primary_style.get("style"),
                    "primary_perks": [perk.get("perk") for perk in primary_style.get("selections", [])],
                    "secondary_style": secondary_style.get("style"),
                    "secondary_perks": [perk.get("perk") for perk in secondary_style.get("selections", [])],
                    "stat_perks": {
                        "offense": stat_perks.get("offense"),
                        "flex": stat_perks.get("flex"),
                        "defense": stat_perks.get("defense")
                    }
                },
                
                # サモナースペル
                "summoner_spells": summoner_spells,
                
                # その他統計
                "largest_killing_spree": participant.get("largestKillingSpree", 0),
                "largest_multi_kill": participant.get("largestMultiKill", 0),
                "double_kills": participant.get("doubleKills", 0),
                "triple_kills": participant.get("tripleKills", 0),
                "quadra_kills": participant.get("quadraKills", 0),
                "penta_kills": participant.get("pentaKills", 0),
                "first_blood_kill": participant.get("firstBloodKill", False),
                "first_blood_assist": participant.get("firstBloodAssist", False),
                "first_tower_kill": participant.get("firstTowerKill", False),
                "first_tower_assist": participant.get("firstTowerAssist", False),
                
                # オブジェクト関連
                "turret_kills": participant.get("turretKills", 0),
                "inhibitor_kills": participant.get("inhibitorKills", 0),
                "dragon_kills": participant.get("dragonKills", 0),
                "baron_kills": participant.get("baronKills", 0),
                
                # チーム情報
                "team_id": participant.get("teamId"),
                "team_position": participant.get("teamPosition"),
                
                # ゲーム時間（パフォーマンス計算用）
                "game_duration": match_data.get("info", {}).get("gameDuration", 1800)
            }
            
            # 詳細パフォーマンススコア計算
            player_stats["performance_analysis"] = calculate_performance_score(player_stats)
            
            return player_stats
    return None


def get_rank_score(tier: str, rank: str, lp: int) -> int:
    """
    ランクをスコア化
    
    Args:
        tier: ティア (IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER)
        rank: ランク (IV, III, II, I)
        lp: LP
        
    Returns:
        スコア値
    """
    tier_scores = {
        "IRON": 0,
        "BRONZE": 400,
        "SILVER": 800,
        "GOLD": 1200,
        "PLATINUM": 1600,
        "EMERALD": 2000,
        "DIAMOND": 2400,
        "MASTER": 2800,
        "GRANDMASTER": 3200,
        "CHALLENGER": 3600
    }
    
    rank_scores = {
        "IV": 0,
        "III": 100,
        "II": 200,
        "I": 300
    }
    
    base_score = tier_scores.get(tier, 0)
    rank_score = rank_scores.get(rank, 0) if tier not in ["MASTER", "GRANDMASTER", "CHALLENGER"] else 0
    
    return base_score + rank_score + lp


def balance_teams(players_data: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
    """
    プレイヤーをバランスよく2チームに分ける
    
    Args:
        players_data: プレイヤー情報のリスト (各要素にrank_scoreを含む)
        
    Returns:
        (チーム1, チーム2)のタプル
    """
    if len(players_data) != 10:
        raise ValueError("10人のプレイヤーが必要です")
    
    # スコアでソート
    sorted_players = sorted(players_data, key=lambda x: x.get("rank_score", 0), reverse=True)
    
    # 最適な組み合わせを探す
    from itertools import combinations
    
    total_score = sum(p.get("rank_score", 0) for p in sorted_players)
    best_diff = float('inf')
    best_team1 = []
    best_team2 = []
    
    # ビット全探索で5人ずつの組み合わせを試す
    for team1_indices in combinations(range(10), 5):
        team1 = [sorted_players[i] for i in team1_indices]
        team2 = [sorted_players[i] for i in range(10) if i not in team1_indices]
        
        team1_score = sum(p.get("rank_score", 0) for p in team1)
        team2_score = sum(p.get("rank_score", 0) for p in team2)
        
        diff = abs(team1_score - team2_score)
        
        if diff < best_diff:
            best_diff = diff
            best_team1 = team1
            best_team2 = team2
    
    return best_team1, best_team2


def calculate_team_average(team: List[Dict]) -> float:
    """チームの平均スコアを計算"""
    if not team:
        return 0
    total = sum(p.get("rank_score", 0) for p in team)
    return round(total / len(team), 2)


def format_rank(tier: str, rank: str, lp: int) -> str:
    """ランク情報をフォーマット"""
    if tier in ["MASTER", "GRANDMASTER", "CHALLENGER"]:
        return f"{tier} {lp} LP"
    return f"{tier} {rank} {lp} LP"


def get_match_timeline_events(match_data: Dict, puuid: str) -> List[Dict]:
    """
    試合タイムラインから特定プレイヤーのイベントを取得
    
    Args:
        match_data: 試合データ
        puuid: プレイヤーUUID
        
    Returns:
        プレイヤーのイベントリスト
    """
    # 注意: タイムラインデータは別のAPIエンドポイントが必要
    # 将来の実装のための枠組み
    return []


def calculate_performance_score(stats: Dict) -> Dict:
    """
    詳細パフォーマンススコアを計算
    
    Args:
        stats: プレイヤー統計
        
    Returns:
        詳細パフォーマンススコア情報
    """
    if not stats:
        return {
            'total_score': 0.0,
            'breakdown': {
                'farming_score': 0,
                'combat_score': 0,
                'vision_score': 0,
                'objective_score': 0,
                'gold_efficiency': 0
            },
            'percentile_rank': 0
        }
    
    # ポジション取得（デフォルトはMID）
    position = stats.get("position", "MID")
    
    # 各スコア計算
    farming_score = calculate_farming_efficiency(stats, position)
    combat_score = calculate_combat_effectiveness(stats)
    vision_score = calculate_vision_control(stats, position)
    objective_score = calculate_objective_participation(stats)
    gold_efficiency = calculate_gold_efficiency(stats)
    
    # 総合スコア計算（重み付け）
    total_score = (
        farming_score * 0.20 +      # ファーム 20%
        combat_score * 0.25 +       # 戦闘 25%
        vision_score * 0.20 +       # 視界 20%
        objective_score * 0.15 +    # オブジェクト 15%
        gold_efficiency * 0.20      # ゴールド効率 20%
    )
    
    return {
        'total_score': round(min(total_score, 100), 1),
        'breakdown': {
            'farming_score': round(farming_score, 1),
            'combat_score': round(combat_score, 1),
            'vision_score': round(vision_score, 1),
            'objective_score': round(objective_score, 1),
            'gold_efficiency': round(gold_efficiency, 1)
        },
        'percentile_rank': calculate_percentile_rank(total_score, position, stats.get('champion'))
    }


def calculate_farming_efficiency(stats: Dict, position: str) -> float:
    """ファーム効率スコア (0-20点)"""
    cs_per_min = stats.get('cs_per_minute', 0)
    
    # ロール別基準値
    role_cs_benchmarks = {
        'TOP': 7.5, 'JUNGLE': 6.0, 'MIDDLE': 8.0, 'MID': 8.0,
        'BOTTOM': 8.5, 'ADC': 8.5, 'UTILITY': 2.0, 'SUPPORT': 2.0
    }
    
    benchmark = role_cs_benchmarks.get(position, 7.0)
    if benchmark == 0:
        return 20.0  # サポートなど、CSが重要でないロール
    
    efficiency_ratio = min(cs_per_min / benchmark, 1.5)
    return min(efficiency_ratio * 20, 20)


def calculate_combat_effectiveness(stats: Dict) -> float:
    """戦闘効率スコア (0-25点)"""
    kda = stats.get('kda', 0)
    damage_per_min = stats.get('damage_per_minute', 0)
    kills = stats.get('kills', 0)
    assists = stats.get('assists', 0)
    deaths = stats.get('deaths', 1)
    
    # KDA基本スコア (0-12点)
    kda_score = min(kda * 3, 12)
    
    # ダメージ効率 (0-8点)
    damage_score = min(damage_per_min / 200, 8)
    
    # キル参加率推定 (0-5点)
    kill_participation = min((kills + assists) / max(deaths * 3, 1), 1) * 5
    
    return kda_score + damage_score + kill_participation


def calculate_vision_control(stats: Dict, position: str) -> float:
    """視界コントロールスコア (0-20点)"""
    vision_data = stats.get('vision', {})
    vision_score = vision_data.get('vision_score', 0)
    wards_placed = vision_data.get('wards_placed', 0)
    wards_killed = vision_data.get('wards_killed', 0)
    
    # ポジション別基準
    if position in ['UTILITY', 'SUPPORT']:
        # サポートは視界スコアを重視
        base_score = min(vision_score / 3, 15)
        ward_score = min((wards_placed + wards_killed) / 10, 5)
    else:
        # その他のロールは低めの基準
        base_score = min(vision_score / 4, 15)
        ward_score = min((wards_placed + wards_killed) / 15, 5)
    
    return base_score + ward_score


def calculate_objective_participation(stats: Dict) -> float:
    """オブジェクト参加スコア (0-15点)"""
    # 現在のstatsにオブジェクト情報がない場合の暫定実装
    # 将来的にはタワー破壊、ドラゴン/バロンキルなどを含める
    
    turret_kills = stats.get('turret_kills', 0)
    dragon_kills = stats.get('dragon_kills', 0)
    baron_kills = stats.get('baron_kills', 0)
    
    # 基本的なオブジェクト参加度
    objective_score = min(turret_kills * 2 + dragon_kills * 3 + baron_kills * 4, 15)
    
    return objective_score


def calculate_gold_efficiency(stats: Dict) -> float:
    """ゴールド効率スコア (0-20点)"""
    gold_per_min = stats.get('gold_per_minute', 0)
    gold_earned = stats.get('gold', 0)
    damage_per_min = stats.get('damage_per_minute', 0)
    
    # ゴールド獲得効率 (0-10点)
    gold_rate_score = min(gold_per_min / 400, 10)
    
    # ゴールドダメージ効率 (0-10点)
    if gold_earned > 0:
        damage_per_gold = (damage_per_min * stats.get('game_duration', 1800) / 60) / gold_earned
        efficiency_score = min(damage_per_gold * 5, 10)
    else:
        efficiency_score = 0
    
    return gold_rate_score + efficiency_score


def calculate_percentile_rank(total_score: float, position: str, champion: str) -> float:
    """パーセンタイルランク計算（暫定実装）"""
    # 将来的にはデータベースの統計データから計算
    # 現在は簡易的な計算
    
    if total_score >= 80:
        return 95.0
    elif total_score >= 70:
        return 85.0
    elif total_score >= 60:
        return 70.0
    elif total_score >= 50:
        return 50.0
    elif total_score >= 40:
        return 30.0
    else:
        return 15.0


def get_team_stats(match_data: Dict, team_id: int) -> Dict:
    """
    チーム統計を取得
    
    Args:
        match_data: 試合データ
        team_id: チームID (100 or 200)
        
    Returns:
        チーム統計
    """
    teams = match_data.get("info", {}).get("teams", [])
    
    for team in teams:
        if team.get("teamId") == team_id:
            objectives = team.get("objectives", {})
            
            return {
                "team_id": team_id,
                "win": team.get("win", False),
                "bans": [ban.get("championId") for ban in team.get("bans", [])],
                "objectives": {
                    "baron": objectives.get("baron", {}).get("kills", 0),
                    "dragon": objectives.get("dragon", {}).get("kills", 0),
                    "riftHerald": objectives.get("riftHerald", {}).get("kills", 0),
                    "tower": objectives.get("tower", {}).get("kills", 0),
                    "inhibitor": objectives.get("inhibitor", {}).get("kills", 0)
                }
            }
    
    return {}


def get_detailed_match_info(match_data: Dict) -> Dict:
    """
    試合の詳細情報を取得
    
    Args:
        match_data: 試合データ
        
    Returns:
        詳細な試合情報
    """
    info = match_data.get("info", {})
    
    return {
        "match_id": match_data.get("metadata", {}).get("matchId"),
        "game_creation": info.get("gameCreation"),
        "game_duration": info.get("gameDuration"),
        "game_end_timestamp": info.get("gameEndTimestamp"),
        "game_mode": info.get("gameMode"),
        "game_type": info.get("gameType"),
        "game_version": info.get("gameVersion"),
        "map_id": info.get("mapId"),
        "platform_id": info.get("platformId"),
        "queue_id": info.get("queueId"),
        "tournament_code": info.get("tournamentCode"),
        "teams": [get_team_stats(match_data, 100), get_team_stats(match_data, 200)]
    }


def balance_teams_with_lanes(players_data: List[Dict]) -> Tuple[List[Dict], List[Dict], Dict]:
    """
    レーン配分を考慮したチーム組み分け
    
    Args:
        players_data: プレイヤー情報のリスト (preferred_lanesを含む)
        
    Returns:
        (チーム1, チーム2, レーン配分)のタプル
    """
    if len(players_data) != 10:
        raise ValueError("10人のプレイヤーが必要です")
    
    lanes = ['top', 'jungle', 'mid', 'adc', 'support']
    
    from itertools import combinations, permutations
    
    best_score = float('-inf')
    best_team1 = []
    best_team2 = []
    best_assignments = {}
    
    # 全ての5vs5の組み合わせを試す
    for team1_indices in combinations(range(10), 5):
        team1_players = [players_data[i] for i in team1_indices]
        team2_players = [players_data[i] for i in range(10) if i not in team1_indices]
        
        # チーム1のレーン配分を最適化
        team1_best_assignment, team1_lane_score = optimize_lane_assignment(team1_players, lanes)
        
        # チーム2のレーン配分を最適化
        team2_best_assignment, team2_lane_score = optimize_lane_assignment(team2_players, lanes)
        
        # ランクスコアのバランスも考慮
        team1_rank_score = sum(p.get('rank_score', 0) for p in team1_players)
        team2_rank_score = sum(p.get('rank_score', 0) for p in team2_players)
        rank_balance_score = 1000 - abs(team1_rank_score - team2_rank_score)
        
        # 総合スコア（レーン適性 + ランクバランス）
        total_score = team1_lane_score + team2_lane_score + rank_balance_score
        
        if total_score > best_score:
            best_score = total_score
            best_team1 = team1_players
            best_team2 = team2_players
            best_assignments = {
                'team1': team1_best_assignment,
                'team2': team2_best_assignment
            }
    
    return best_team1, best_team2, best_assignments


def optimize_lane_assignment(team_players: List[Dict], lanes: List[str]) -> Tuple[Dict, float]:
    """
    1チーム（5人）のレーン配分を最適化
    
    Args:
        team_players: チームプレイヤーリスト
        lanes: レーンリスト
        
    Returns:
        (最適配分, スコア)のタプル
    """
    from itertools import permutations
    
    best_assignment = {}
    best_score = float('-inf')
    
    # 全てのレーン配分を試す
    for lane_perm in permutations(lanes):
        assignment = {}
        score = 0
        
        for i, player in enumerate(team_players):
            assigned_lane = lane_perm[i]
            player_id = player['riot_id']
            assignment[player_id] = assigned_lane
            
            # プレイヤーがこのレーンを得意としているかどうかでスコア計算
            preferred_lanes = player.get('preferred_lanes', [])
            if assigned_lane in preferred_lanes:
                # 得意レーンなら高スコア
                score += 100
            elif not preferred_lanes:
                # レーン指定なしならニュートラル
                score += 50
            else:
                # 得意でないレーンなら低スコア
                score += 10
        
        if score > best_score:
            best_score = score
            best_assignment = assignment
    
    return best_assignment, best_score
