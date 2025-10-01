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
                "team_position": participant.get("teamPosition")
            }
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


def calculate_performance_score(stats: Dict) -> float:
    """
    パフォーマンススコアを計算
    
    Args:
        stats: プレイヤー統計
        
    Returns:
        パフォーマンススコア (0-100)
    """
    if not stats:
        return 0.0
    
    # 基本スコア計算
    kda_score = min(stats.get("kda", 0) * 10, 40)
    cs_score = min(stats.get("cs_per_minute", 0) * 2, 20)
    damage_score = min(stats.get("damage_per_minute", 0) / 100, 20)
    vision_score = min(stats.get("vision", {}).get("vision_score", 0) / 2, 10)
    gold_score = min(stats.get("gold_per_minute", 0) / 100, 10)
    
    total_score = kda_score + cs_score + damage_score + vision_score + gold_score
    
    return round(min(total_score, 100), 1)


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
