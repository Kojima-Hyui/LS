/**
 * 詳細パフォーマンス分析UI
 */

class PerformanceAnalyzer {
    constructor() {
        this.currentData = null;
    }

    /**
     * 詳細パフォーマンス分析を表示
     */
    static displayDetailedStats(matchData, playerData) {
        const container = document.getElementById('detailed-performance');
        if (!container) return;

        const performanceData = playerData.performance_analysis || {};
        const breakdown = performanceData.breakdown || {};

        const performanceHTML = `
            <div class="performance-breakdown">
                <div class="performance-header">
                    <h4>📊 詳細パフォーマンス分析</h4>
                    <div class="close-button" onclick="this.parentElement.parentElement.parentElement.style.display='none'">×</div>
                </div>
                
                <div class="total-score-section">
                    <div class="score-circle">
                        <div class="score-value">${performanceData.total_score || 0}</div>
                        <div class="score-label">総合スコア</div>
                    </div>
                    <div class="percentile-rank">
                        <span>同レベル中 ${performanceData.percentile_rank || 0}%タイル</span>
                    </div>
                </div>
                
                <div class="score-breakdown">
                    ${this.renderScoreBar('🌾 ファーム効率', breakdown.farming_score || 0, 20)}
                    ${this.renderScoreBar('⚔️ 戦闘効率', breakdown.combat_score || 0, 25)}
                    ${this.renderScoreBar('👁️ 視界制御', breakdown.vision_score || 0, 20)}
                    ${this.renderScoreBar('🏰 オブジェクト', breakdown.objective_score || 0, 15)}
                    ${this.renderScoreBar('💰 ゴールド効率', breakdown.gold_efficiency || 0, 20)}
                </div>
                
                <div class="performance-insights">
                    <h5>💡 パフォーマンス分析</h5>
                    <ul>
                        ${this.generateInsights(breakdown, playerData).map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        container.innerHTML = performanceHTML;
        container.style.display = 'block';
    }

    /**
     * スコアバーを描画
     */
    static renderScoreBar(label, score, maxScore) {
        const percentage = Math.min((score / maxScore) * 100, 100);
        const color = this.getScoreColor(percentage);
        
        return `
            <div class="score-item">
                <div class="score-header">
                    <span class="score-label">${label}</span>
                    <span class="score-value">${score.toFixed(1)}/${maxScore}</span>
                </div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
                <div class="score-percentage">${percentage.toFixed(0)}%</div>
            </div>
        `;
    }

    /**
     * スコアに応じた色を取得
     */
    static getScoreColor(percentage) {
        if (percentage >= 80) return '#48bb78';      // 緑
        if (percentage >= 60) return '#38b2ac';      // 青緑
        if (percentage >= 40) return '#ecc94b';      // 黄
        if (percentage >= 20) return '#ed8936';      // オレンジ
        return '#f56565';                            // 赤
    }

    /**
     * パフォーマンス分析のインサイトを生成
     */
    static generateInsights(breakdown, playerData) {
        const insights = [];
        
        const farming = breakdown.farming_score || 0;
        const combat = breakdown.combat_score || 0;
        const vision = breakdown.vision_score || 0;
        const objective = breakdown.objective_score || 0;
        const gold = breakdown.gold_efficiency || 0;

        // ファーム分析
        if (farming >= 16) {
            insights.push('🌾 ファームが非常に優秀です！レーニングフェーズを支配できています。');
        } else if (farming <= 8) {
            insights.push('🌾 ファーム効率を改善しましょう。CSを取ることに集中してください。');
        }

        // 戦闘分析
        if (combat >= 20) {
            insights.push('⚔️ 戦闘での貢献が素晴らしいです！チームファイトで活躍できています。');
        } else if (combat <= 10) {
            insights.push('⚔️ 戦闘での影響力を高めましょう。ポジショニングと集団戦を意識してください。');
        }

        // 視界分析
        const position = playerData.position || '';
        if (position === 'UTILITY' || position === 'SUPPORT') {
            if (vision >= 16) {
                insights.push('👁️ サポートとして視界制御が完璧です！');
            } else if (vision <= 8) {
                insights.push('👁️ サポートはもっとワードを置いて視界を取りましょう。');
            }
        } else {
            if (vision >= 12) {
                insights.push('👁️ 視界制御も意識できていて素晴らしいです！');
            } else if (vision <= 6) {
                insights.push('👁️ ワードを置いて視界を確保することを心がけましょう。');
            }
        }

        // オブジェクト分析
        if (objective >= 12) {
            insights.push('🏰 オブジェクト制圧に積極的で、チームに大きく貢献しています！');
        } else if (objective <= 5) {
            insights.push('🏰 ドラゴンやタワーなど、オブジェクト争いにもっと参加しましょう。');
        }

        // ゴールド効率分析
        if (gold >= 16) {
            insights.push('💰 ゴールド効率が優秀で、アイテムパワーを最大化できています！');
        } else if (gold <= 8) {
            insights.push('💰 ゴールド効率を上げるため、ファームとキル参加のバランスを取りましょう。');
        }

        // 総合評価
        const totalScore = farming + combat + vision + objective + gold;
        if (totalScore >= 80) {
            insights.push('🏆 総合的に非常に優秀なパフォーマンスです！この調子で頑張ってください！');
        } else if (totalScore >= 60) {
            insights.push('⭐ 良いパフォーマンスです！さらなる向上を目指しましょう。');
        } else if (totalScore <= 40) {
            insights.push('📈 改善の余地があります。基本に立ち返って練習しましょう。');
        }

        return insights.length > 0 ? insights : ['📊 データを収集中です。'];
    }

    /**
     * パフォーマンストレンドを表示
     */
    static displayPerformanceTrend(trendsData) {
        const container = document.getElementById('performance-trend');
        if (!container || !trendsData || trendsData.length === 0) return;

        const recentScores = trendsData.slice(-10).map(trend => trend.total_score);
        const recentWins = trendsData.slice(-10).map(trend => trend.win);

        let trendHTML = `
            <div class="trend-section">
                <h4>📈 パフォーマンストレンド（直近10試合）</h4>
                <div class="trend-chart">
                    <div class="score-trend">
                        ${recentScores.map((score, index) => `
                            <div class="trend-point ${recentWins[index] ? 'win' : 'loss'}" 
                                 style="height: ${(score / 100) * 60}px"
                                 title="試合${index + 1}: ${score}点 (${recentWins[index] ? '勝利' : '敗北'})">
                                <span class="score-text">${score.toFixed(0)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="trend-summary">
                    <p>平均スコア: ${(recentScores.reduce((a, b) => a + b, 0) / recentScores.length).toFixed(1)}</p>
                    <p>勝率: ${((recentWins.filter(w => w).length / recentWins.length) * 100).toFixed(1)}%</p>
                </div>
            </div>
        `;

        container.innerHTML = trendHTML;
    }
}

/**
 * 詳細パフォーマンス分析を取得して表示
 */
async function loadDetailedPerformanceAnalysis(riotId, matchCount = 10) {
    try {
        const loadingEl = document.getElementById('performance-loading');
        const errorEl = document.getElementById('performance-error');
        const resultEl = document.getElementById('performance-result');

        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (resultEl) resultEl.style.display = 'none';

        const response = await fetch('/api/performance_analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                riot_id: riotId,
                match_count: matchCount
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (loadingEl) loadingEl.style.display = 'none';

        if (data.error) {
            if (errorEl) {
                errorEl.textContent = `❌ ${data.error}`;
                errorEl.style.display = 'block';
            }
            return;
        }

        // 結果表示
        displayDetailedPerformanceResults(data);
        if (resultEl) resultEl.style.display = 'block';

    } catch (error) {
        console.error('Performance analysis error:', error);
        if (document.getElementById('performance-loading')) {
            document.getElementById('performance-loading').style.display = 'none';
        }
        if (document.getElementById('performance-error')) {
            document.getElementById('performance-error').textContent = `❌ エラーが発生しました: ${error.message}`;
            document.getElementById('performance-error').style.display = 'block';
        }
    }
}

/**
 * 詳細パフォーマンス結果を表示
 */
function displayDetailedPerformanceResults(data) {
    const resultEl = document.getElementById('performance-result');
    if (!resultEl) return;

    const overallStats = data.overall_stats || {};
    const averageScores = overallStats.average_scores || {};

    let html = `
        <div class="performance-overview">
            <h3>🎯 詳細パフォーマンス分析</h3>
            
            <div class="overview-stats">
                <div class="stat-card">
                    <div class="stat-value">${overallStats.total_matches || 0}</div>
                    <div class="stat-label">分析試合数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${overallStats.win_rate || 0}%</div>
                    <div class="stat-label">勝率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${averageScores.total_score || 0}</div>
                    <div class="stat-label">平均スコア</div>
                </div>
            </div>
            
            <div class="average-performance">
                <h4>📊 平均パフォーマンス</h4>
                <div class="score-breakdown">
                    ${PerformanceAnalyzer.renderScoreBar('🌾 ファーム効率', averageScores.farming_score || 0, 20)}
                    ${PerformanceAnalyzer.renderScoreBar('⚔️ 戦闘効率', averageScores.combat_score || 0, 25)}
                    ${PerformanceAnalyzer.renderScoreBar('👁️ 視界制御', averageScores.vision_score || 0, 20)}
                    ${PerformanceAnalyzer.renderScoreBar('🏰 オブジェクト', averageScores.objective_score || 0, 15)}
                    ${PerformanceAnalyzer.renderScoreBar('💰 ゴールド効率', averageScores.gold_efficiency || 0, 20)}
                </div>
            </div>
        </div>
        
        <div class="match-details">
            <h4>📋 試合別詳細</h4>
            <div class="matches-list">
                ${data.match_analyses ? data.match_analyses.map((match, index) => `
                    <div class="match-performance-card ${match.win ? 'win' : 'loss'}">
                        <div class="match-info">
                            <span class="champion">${match.champion || '不明'}</span>
                            <span class="queue-type">${match.queue_type || 'ランク・ノーマル'}</span>
                            <span class="result">${match.win ? '勝利' : '敗北'}</span>
                            <span class="kda">${match.kda}</span>
                        </div>
                        <div class="performance-score">
                            <span class="score">${match.performance_analysis?.total_score || 0}</span>
                        </div>
                        <button onclick="PerformanceAnalyzer.displayDetailedStats(null, ${JSON.stringify(match).replace(/"/g, '&quot;')})" 
                                class="detail-btn">詳細</button>
                    </div>
                `).join('') : ''}
            </div>
        </div>
        
        <div id="detailed-performance" class="detailed-performance-modal" style="display: none;"></div>
    `;

    resultEl.innerHTML = html;

    // トレンド表示
    if (data.performance_trends) {
        PerformanceAnalyzer.displayPerformanceTrend(data.performance_trends);
    }
}