"""
Discord Bot実装
"""
import discord
from discord.ext import commands
from riot_api import RiotAPIClient
from game_utils import MatchAnalyzer, TeamBalancer, format_rank
import os
from dotenv import load_dotenv

load_dotenv()

# Intents設定
intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!lol ', intents=intents)
riot_client = RiotAPIClient()


@bot.event
async def on_ready():
    """Bot起動時"""
    print(f'{bot.user} としてログインしました')
    print(f'Bot ID: {bot.user.id}')
    print('------')


@bot.command(name='戦績')
async def match_history(ctx, riot_id: str, count: int = 10):
    """
    戦績を表示
    使い方: !lol 戦績 ゲーム名#タグ [試合数]
    例: !lol 戦績 Hide#on#Bush 10
    """
    try:
        # Riot IDを分解
        parts = riot_id.split('#')
        if len(parts) != 2:
            await ctx.send('❌ 正しい形式で入力してください: ゲーム名#タグ')
            return
        
        game_name, tag_line = parts
        
        await ctx.send(f'🔍 {riot_id} の戦績を取得中...')
        
        # アカウント情報取得
        account = riot_client.get_account_by_riot_id(game_name, tag_line)
        if not account:
            await ctx.send('❌ プレイヤーが見つかりませんでした')
            return
        
        puuid = account['puuid']
        summoner = riot_client.get_summoner_by_puuid(puuid)
        
        # ランク情報取得
        rank_text = "Unranked"
        if summoner:
            ranked_stats = riot_client.get_ranked_stats(summoner['id']) or []
            for rank in ranked_stats:
                if rank['queueType'] == 'RANKED_SOLO_5x5':
                    rank_text = format_rank(
                        rank['tier'],
                        rank.get('rank', ''),
                        rank['leaguePoints']
                    )
                    break
        
        # 試合履歴取得
        match_ids = riot_client.get_match_history(puuid, count)
        if not match_ids:
            await ctx.send('❌ 試合履歴が見つかりませんでした')
            return
        
        # Embed作成
        embed = discord.Embed(
            title=f"📊 {riot_id} の戦績",
            color=discord.Color.blue()
        )
        
        embed.add_field(
            name="レベル",
            value=summoner.get('summonerLevel', 'N/A') if summoner else 'N/A',
            inline=True
        )
        embed.add_field(name="ランク", value=rank_text, inline=True)
        
        # 最近の試合を表示
        matches_text = []
        for i, match_id in enumerate(match_ids[:count], 1):
            match_data = riot_client.get_match_detail(match_id)
            if match_data:
                player_stats = MatchAnalyzer.get_player_stats(match_data, puuid)
                if player_stats:
                    result = "🟢 勝利" if player_stats['win'] else "🔴 敗北"
                    matches_text.append(
                        f"{i}. {result} | {player_stats['champion']} | "
                        f"{player_stats['kills']}/{player_stats['deaths']}/{player_stats['assists']} "
                        f"(KDA: {player_stats['kda']})"
                    )
        
        if matches_text:
            embed.add_field(
                name=f"最近の{len(matches_text)}試合",
                value="\n".join(matches_text),
                inline=False
            )
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        await ctx.send(f'❌ エラーが発生しました: {str(e)}')


@bot.command(name='試合情報')
async def current_game(ctx, riot_id: str):
    """
    現在の試合情報を表示
    使い方: !lol 試合情報 ゲーム名#タグ
    例: !lol 試合情報 Hide#on#Bush
    """
    try:
        # Riot IDを分解
        parts = riot_id.split('#')
        if len(parts) != 2:
            await ctx.send('❌ 正しい形式で入力してください: ゲーム名#タグ')
            return
        
        game_name, tag_line = parts
        
        await ctx.send(f'🔍 {riot_id} の試合情報を取得中...')
        
        # アカウント情報取得
        account = riot_client.get_account_by_riot_id(game_name, tag_line)
        if not account:
            await ctx.send('❌ プレイヤーが見つかりませんでした')
            return
        
        puuid = account['puuid']
        
        # 現在のゲーム情報取得
        current_game = riot_client.get_current_game(puuid)
        if not current_game:
            await ctx.send('❌ 現在ゲーム中ではありません')
            return
        
        # Embed作成
        embed = discord.Embed(
            title=f"⚔️ 試合情報 - {riot_id}",
            description=f"ゲームモード: {current_game.get('gameMode', 'Unknown')}",
            color=discord.Color.green()
        )
        
        # チーム1とチーム2に分ける
        team1_players = []
        team2_players = []
        
        for participant in current_game.get('participants', []):
            player_puuid = participant['puuid']
            summoner = riot_client.get_summoner_by_puuid(player_puuid)
            
            rank_info = "Unranked"
            if summoner:
                ranked_stats = riot_client.get_ranked_stats(summoner['id']) or []
                for rank in ranked_stats:
                    if rank['queueType'] == 'RANKED_SOLO_5x5':
                        rank_info = format_rank(
                            rank['tier'],
                            rank.get('rank', ''),
                            rank['leaguePoints']
                        )
                        break
            
            player_text = f"{participant.get('riotId', 'Unknown')} - {rank_info}"
            
            if participant['teamId'] == 100:
                team1_players.append(player_text)
            else:
                team2_players.append(player_text)
        
        if team1_players:
            embed.add_field(
                name="🔵 青チーム",
                value="\n".join(team1_players),
                inline=True
            )
        
        if team2_players:
            embed.add_field(
                name="🔴 赤チーム",
                value="\n".join(team2_players),
                inline=True
            )
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        await ctx.send(f'❌ エラーが発生しました: {str(e)}')


@bot.command(name='組み分け')
async def balance(ctx, *riot_ids: str):
    """
    10人をバランスよく組み分け
    使い方: !lol 組み分け プレイヤー1#タグ プレイヤー2#タグ ... (10人)
    例: !lol 組み分け Player1#JP1 Player2#JP1 Player3#JP1 ... Player10#JP1
    """
    try:
        if len(riot_ids) != 10:
            await ctx.send('❌ 10人のプレイヤーが必要です')
            return
        
        await ctx.send('🔍 プレイヤー情報を取得中...')
        
        players_data = []
        
        for riot_id in riot_ids:
            parts = riot_id.split('#')
            if len(parts) != 2:
                await ctx.send(f'❌ 無効なRiot ID: {riot_id}')
                return
            
            game_name, tag_line = parts
            
            # アカウント情報取得
            account = riot_client.get_account_by_riot_id(game_name, tag_line)
            if not account:
                await ctx.send(f'❌ プレイヤーが見つかりません: {riot_id}')
                return
            
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
        
        # Embed作成
        embed = discord.Embed(
            title="⚖️ チーム組み分け結果",
            color=discord.Color.gold()
        )
        
        team1_text = []
        for player in team1:
            team1_text.append(f"{player['riot_id']} - {player['rank_info']}")
        
        team2_text = []
        for player in team2:
            team2_text.append(f"{player['riot_id']} - {player['rank_info']}")
        
        avg1 = TeamBalancer.calculate_team_average(team1)
        avg2 = TeamBalancer.calculate_team_average(team2)
        
        embed.add_field(
            name=f"🔵 チーム1 (平均スコア: {avg1})",
            value="\n".join(team1_text),
            inline=True
        )
        
        embed.add_field(
            name=f"🔴 チーム2 (平均スコア: {avg2})",
            value="\n".join(team2_text),
            inline=True
        )
        
        embed.add_field(
            name="スコア差",
            value=f"{abs(avg1 - avg2):.2f}",
            inline=False
        )
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        await ctx.send(f'❌ エラーが発生しました: {str(e)}')


@bot.command(name='help')
async def help_command(ctx):
    """ヘルプを表示"""
    embed = discord.Embed(
        title="📖 LoL汎用ツール コマンド一覧",
        description="Riot IDは「ゲーム名#タグ」の形式で入力してください",
        color=discord.Color.purple()
    )
    
    embed.add_field(
        name="!lol 戦績 <Riot ID> [試合数]",
        value="プレイヤーの戦績を表示\n例: `!lol 戦績 Hide#on#Bush 10`",
        inline=False
    )
    
    embed.add_field(
        name="!lol 試合情報 <Riot ID>",
        value="現在の試合情報を表示\n例: `!lol 試合情報 Hide#on#Bush`",
        inline=False
    )
    
    embed.add_field(
        name="!lol 組み分け <10人のRiot ID>",
        value="10人をバランスよく5vs5に組み分け\n例: `!lol 組み分け Player1#JP1 Player2#JP1 ...`",
        inline=False
    )
    
    embed.add_field(
        name="!lol help",
        value="このヘルプを表示",
        inline=False
    )
    
    await ctx.send(embed=embed)


# Bot起動
if __name__ == '__main__':
    token = os.getenv('DISCORD_BOT_TOKEN')
    if not token:
        print('エラー: DISCORD_BOT_TOKENが設定されていません')
        print('.envファイルを確認してください')
    else:
        bot.run(token)
