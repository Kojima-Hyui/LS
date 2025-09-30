"""
Riot Games APIとのやり取りを管理するクライアント
"""
import requests
import time
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class RiotAPIClient:
    """Riot Games APIクライアント"""
    
    def __init__(self, api_key: Optional[str] = None, region: str = "jp1", routing: str = "asia"):
        """
        初期化
        
        Args:
            api_key: Riot Games APIキー
            region: リージョン (jp1, kr, na1, euw1, etc.)
            routing: ルーティング (asia, americas, europe, sea)
        """
        self.api_key = api_key or os.getenv("RIOT_API_KEY")
        self.region = region
        self.routing = routing
        self.base_url = f"https://{region}.api.riotgames.com"
        self.routing_url = f"https://{routing}.api.riotgames.com"
        self.headers = {
            "X-Riot-Token": self.api_key
        }
        
    def _make_request(self, url: str, retries: int = 3) -> Optional[Dict]:
        """
        APIリクエストを実行
        
        Args:
            url: リクエストURL
            retries: リトライ回数
            
        Returns:
            レスポンスJSON
        """
        for attempt in range(retries):
            try:
                response = requests.get(url, headers=self.headers)
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429:  # Rate limit
                    retry_after = int(response.headers.get("Retry-After", 1))
                    time.sleep(retry_after)
                    continue
                elif response.status_code == 404:
                    return None
                else:
                    print(f"Error: {response.status_code} - {response.text}")
                    return None
            except Exception as e:
                print(f"Request error: {e}")
                if attempt < retries - 1:
                    time.sleep(1)
                    continue
                return None
        return None
    
    def get_account_by_riot_id(self, game_name: str, tag_line: str) -> Optional[Dict]:
        """
        Riot ID (game_name#tag_line) からアカウント情報を取得
        
        Args:
            game_name: ゲーム内名前
            tag_line: タグライン
            
        Returns:
            アカウント情報
        """
        url = f"{self.routing_url}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        return self._make_request(url)
    
    def get_summoner_by_puuid(self, puuid: str) -> Optional[Dict]:
        """
        PUUIDからサモナー情報を取得
        
        Args:
            puuid: プレイヤーUUID
            
        Returns:
            サモナー情報
        """
        url = f"{self.base_url}/lol/summoner/v4/summoners/by-puuid/{puuid}"
        return self._make_request(url)
    
    def get_match_history(self, puuid: str, count: int = 20) -> Optional[List[str]]:
        """
        マッチ履歴のIDリストを取得
        
        Args:
            puuid: プレイヤーUUID
            count: 取得する試合数
            
        Returns:
            マッチIDのリスト
        """
        url = f"{self.routing_url}/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}"
        return self._make_request(url)
    
    def get_match_detail(self, match_id: str) -> Optional[Dict]:
        """
        試合の詳細情報を取得
        
        Args:
            match_id: マッチID
            
        Returns:
            試合詳細情報
        """
        url = f"{self.routing_url}/lol/match/v5/matches/{match_id}"
        return self._make_request(url)
    
    def get_current_game(self, puuid: str) -> Optional[Dict]:
        """
        現在のゲーム情報を取得
        
        Args:
            puuid: プレイヤーUUID
            
        Returns:
            現在のゲーム情報
        """
        url = f"{self.base_url}/lol/spectator/v5/active-games/by-summoner/{puuid}"
        return self._make_request(url)
    
    def get_ranked_stats(self, summoner_id: str) -> Optional[List[Dict]]:
        """
        ランク情報を取得
        
        Args:
            summoner_id: サモナーID
            
        Returns:
            ランク情報のリスト
        """
        url = f"{self.base_url}/lol/league/v4/entries/by-summoner/{summoner_id}"
        return self._make_request(url)
    
    def get_champion_mastery(self, puuid: str) -> Optional[List[Dict]]:
        """
        チャンピオンマスタリー情報を取得
        
        Args:
            puuid: プレイヤーUUID
            
        Returns:
            チャンピオンマスタリー情報
        """
        url = f"{self.base_url}/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}"
        return self._make_request(url)
