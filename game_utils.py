"""
データ処理とゲームロジックのユーティリティ
"""
from typing import List, Dict, Tuple, Optional
import math


class MatchAnalyzer:
    """試合データの分析クラス"""
    
    @staticmethod
    def calculate_kda(kills: int, deaths: int, assists: int) -> float:
        """KDAを計算"""
        if deaths == 0:
            return float(kills + assists)
        return round((kills + assists) / deaths, 2)
    
    @staticmethod
    def format_game_duration(duration_seconds: int) -> str:
        """ゲーム時間をフォーマット"""
        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        return f"{minutes}:{seconds:02d}"
    
    @staticmethod
    def get_player_stats(match_data: Dict, puuid: str) -> Optional[Dict]:
        """
        試合データから特定プレイヤーの統計を取得
        
        Args:
            match_data: 試合データ
            puuid: プレイヤーUUID
            
        Returns:
            プレイヤーの統計情報
        """
        participants = match_data.get("info", {}).get("participants", [])
        
        for participant in participants:
            if participant.get("puuid") == puuid:
                return {
                    "champion": participant.get("championName"),
                    "kills": participant.get("kills"),
                    "deaths": participant.get("deaths"),
                    "assists": participant.get("assists"),
                    "kda": MatchAnalyzer.calculate_kda(
                        participant.get("kills", 0),
                        participant.get("deaths", 0),
                        participant.get("assists", 0)
                    ),
                    "win": participant.get("win"),
                    "position": participant.get("teamPosition"),
                    "cs": participant.get("totalMinionsKilled", 0) + participant.get("neutralMinionsKilled", 0),
                    "gold": participant.get("goldEarned"),
                    "damage": participant.get("totalDamageDealtToChampions"),
                    "vision_score": participant.get("visionScore"),
                }
        return None
    
    @staticmethod
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


class TeamBalancer:
    """チームバランサー - 10人を公平に5vs5に分ける"""
    
    @staticmethod
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
        
        # 動的計画法で最適な組み合わせを探す
        best_team1, best_team2 = TeamBalancer._find_best_split(sorted_players)
        
        return best_team1, best_team2
    
    @staticmethod
    def _find_best_split(players: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
        """
        最も公平な分割を見つける（総当たり的アプローチを簡略化）
        """
        total_score = sum(p.get("rank_score", 0) for p in players)
        target_score = total_score / 2
        
        n = len(players)
        best_diff = float('inf')
        best_team1 = []
        best_team2 = []
        
        # ビット全探索で5人ずつの組み合わせを試す
        from itertools import combinations
        
        for team1_indices in combinations(range(n), 5):
            team1 = [players[i] for i in team1_indices]
            team2 = [players[i] for i in range(n) if i not in team1_indices]
            
            team1_score = sum(p.get("rank_score", 0) for p in team1)
            team2_score = sum(p.get("rank_score", 0) for p in team2)
            
            diff = abs(team1_score - team2_score)
            
            if diff < best_diff:
                best_diff = diff
                best_team1 = team1
                best_team2 = team2
        
        return best_team1, best_team2
    
    @staticmethod
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
