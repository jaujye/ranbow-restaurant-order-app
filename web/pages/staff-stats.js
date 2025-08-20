// Staff Statistics - Personal and team performance metrics

class StaffStats {
    constructor() {
        this.currentView = 'personal'; // 'personal' or 'team'
        this.currentPeriod = 'today'; // 'today', 'week', 'month'
        this.personalStats = {};
        this.teamStats = {};
        this.achievements = [];
        this.refreshInterval = null;
    }

    getStatsPageTemplate() {
        return `
        <div class="staff-stats">
            <!-- Header -->
            <div class="staff-stats-header">
                <div class="header-left">
                    <button class="back-btn" onclick="app.goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>工作統計</h2>
                </div>
                <div class="header-actions">
                    <button class="period-selector" onclick="staffStats.showPeriodSelector()">
                        <i class="fas fa-calendar"></i>
                        <span id="current-period-text">${this.getPeriodText()}</span>
                    </button>
                </div>
            </div>

            <!-- View Toggle -->
            <div class="view-toggle">
                <button class="toggle-btn ${this.currentView === 'personal' ? 'active' : ''}" 
                        onclick="staffStats.switchView('personal')">
                    <i class="fas fa-user"></i>
                    個人統計
                </button>
                <button class="toggle-btn ${this.currentView === 'team' ? 'active' : ''}" 
                        onclick="staffStats.switchView('team')">
                    <i class="fas fa-users"></i>
                    團隊統計
                </button>
            </div>

            <!-- Content Container -->
            <div class="stats-content" id="stats-content">
                ${this.currentView === 'personal' ? this.getPersonalStatsHTML() : this.getTeamStatsHTML()}
            </div>

            <!-- Period Selector Modal -->
            <div class="period-modal" id="period-modal" style="display: none;">
                <div class="modal-content" id="period-modal-content">
                    ${this.getPeriodSelectorHTML()}
                </div>
            </div>
        </div>`;
    }

    getPersonalStatsHTML() {
        const user = Storage.getUser();
        const stats = this.personalStats;
        
        return `
            <!-- Staff Info Card -->
            <div class="staff-info-card">
                <div class="staff-avatar-large">
                    ${this.getStaffAvatar(user)}
                </div>
                <div class="staff-details">
                    <h3>${user?.username || '員工'}</h3>
                    <p class="staff-id">工號: ${user?.staffId || 'N/A'}</p>
                    <p class="staff-department">部門: ${user?.department || '廚房'}</p>
                </div>
            </div>

            <!-- Working Hours -->
            <div class="working-hours-section">
                <h4>⏰ 工作時間</h4>
                <div class="working-hours-card">
                    <div class="time-info">
                        <div class="time-item">
                            <span class="time-label">上班:</span>
                            <span class="time-value">${stats.startTime || '09:00'}</span>
                        </div>
                        <div class="time-item">
                            <span class="time-label">現在:</span>
                            <span class="time-value" id="current-work-time">${this.getCurrentTime()}</span>
                        </div>
                        <div class="time-item total">
                            <span class="time-label">已工作:</span>
                            <span class="time-value">${stats.workedHours || '5小時35分'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Processing Stats -->
            <div class="order-stats-section">
                <h4>📋 處理訂單</h4>
                <div class="stats-grid">
                    <div class="stat-item completed">
                        <div class="stat-header">
                            <span class="stat-label">已完成</span>
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-value">${stats.completedOrders || 24}</div>
                    </div>
                    <div class="stat-item in-progress">
                        <div class="stat-header">
                            <span class="stat-label">進行中</span>
                            <i class="fas fa-utensils"></i>
                        </div>
                        <div class="stat-value">${stats.inProgressOrders || 3}</div>
                    </div>
                    <div class="stat-item average-time">
                        <div class="stat-header">
                            <span class="stat-label">平均時間</span>
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-value">${stats.averageTime || '18分鐘'}</div>
                    </div>
                    <div class="stat-item efficiency">
                        <div class="stat-header">
                            <span class="stat-label">效率評分</span>
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-value">${stats.efficiency || '95%'}</div>
                    </div>
                </div>
            </div>

            <!-- Performance Chart -->
            <div class="performance-chart-section">
                <h4>📈 效率趨勢</h4>
                <div class="chart-container">
                    <div class="chart-placeholder">
                        <div class="chart-bars">
                            ${this.getPerformanceChartHTML()}
                        </div>
                        <div class="chart-labels">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Today's Achievements -->
            <div class="achievements-section">
                <h4>🏆 今日成就</h4>
                <div class="achievements-grid">
                    ${this.getAchievementsHTML()}
                </div>
            </div>

            <!-- Detailed Report -->
            <div class="detailed-report-section">
                <button class="btn btn-primary btn-large" onclick="staffStats.showDetailedReport()">
                    📈 詳細報告
                </button>
            </div>
        `;
    }

    getTeamStatsHTML() {
        const teamStats = this.teamStats;
        
        return `
            <!-- Team Overview -->
            <div class="team-overview-section">
                <h4>📊 今日整體表現</h4>
                <div class="team-overview-card">
                    <div class="overview-stats">
                        <div class="overview-item">
                            <span class="overview-label">總訂單數:</span>
                            <span class="overview-value">${teamStats.totalOrders || 156}</span>
                        </div>
                        <div class="overview-item">
                            <span class="overview-label">已完成:</span>
                            <span class="overview-value">${teamStats.completedOrders || 142}</span>
                        </div>
                        <div class="overview-item">
                            <span class="overview-label">進行中:</span>
                            <span class="overview-value">${teamStats.inProgressOrders || 8}</span>
                        </div>
                        <div class="overview-item">
                            <span class="overview-label">已取消:</span>
                            <span class="overview-value">${teamStats.cancelledOrders || 6}</span>
                        </div>
                        <div class="overview-item total">
                            <span class="overview-label">完成率:</span>
                            <span class="overview-value">${teamStats.completionRate || '95.6%'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Staff Performance Ranking -->
            <div class="staff-ranking-section">
                <h4>👥 員工表現排行</h4>
                <div class="ranking-list">
                    ${this.getStaffRankingHTML()}
                </div>
            </div>

            <!-- Team Performance Metrics -->
            <div class="team-metrics-section">
                <h4>📊 團隊指標</h4>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-header">
                            <h5>⏰ 平均處理時間</h5>
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="metric-value">${teamStats.averageProcessingTime || '18分鐘'}</div>
                        <div class="metric-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <h5>🎯 目標達成率</h5>
                            <i class="fas fa-target"></i>
                        </div>
                        <div class="metric-value">${teamStats.targetAchievement || '75%'}</div>
                        <div class="metric-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <h5>😊 顧客滿意度</h5>
                            <i class="fas fa-smile"></i>
                        </div>
                        <div class="metric-value">${teamStats.customerSatisfaction || '4.8/5.0'}</div>
                        <div class="metric-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 96%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Team Report Actions -->
            <div class="team-report-actions">
                <button class="btn btn-secondary btn-large" onclick="staffStats.showWeeklyReport()">
                    週報告
                </button>
                <button class="btn btn-secondary btn-large" onclick="staffStats.showMonthlyReport()">
                    月報告
                </button>
            </div>
        `;
    }

    getStaffRankingHTML() {
        const rankings = this.staffRanking || [
            { rank: 1, name: '李小華', orders: 28, efficiency: '98%', icon: '🥇' },
            { rank: 2, name: '王大明', orders: 25, efficiency: '95%', icon: '🥈' },
            { rank: 3, name: '陳小美', orders: 22, efficiency: '92%', icon: '🥉' },
            { rank: 4, name: '張三', orders: 19, efficiency: '89%', icon: '' }
        ];

        return rankings.map(staff => `
            <div class="ranking-item ${staff.rank <= 3 ? 'top-three' : ''}">
                <div class="rank-info">
                    <span class="rank-icon">${staff.icon}</span>
                    <span class="rank-number">${staff.rank}</span>
                </div>
                <div class="staff-info">
                    <div class="staff-name">${staff.name}</div>
                    <div class="staff-metrics">
                        <span class="metric">📋 ${staff.orders}單</span>
                        <span class="metric">⚡ ${staff.efficiency}</span>
                    </div>
                </div>
                <div class="performance-indicator">
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${staff.efficiency}"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getPerformanceChartHTML() {
        const weeklyData = [85, 92, 88, 95, 91, 97, 94]; // Sample efficiency percentages
        const maxValue = Math.max(...weeklyData);
        
        return weeklyData.map((value, index) => {
            const height = (value / maxValue) * 100;
            return `
                <div class="chart-bar">
                    <div class="bar-fill" style="height: ${height}%"></div>
                    <div class="bar-value">${value}%</div>
                </div>
            `;
        }).join('');
    }

    getAchievementsHTML() {
        const achievements = [
            { icon: '✨', title: '零超時處理', description: '今日無超時訂單', earned: true },
            { icon: '🚀', title: '效率達人', description: '效率超過95%', earned: true },
            { icon: '👑', title: '顧客滿意', description: '好評率100%', earned: true },
            { icon: '🔥', title: '連續完成', description: '連續完成20單', earned: false }
        ];

        return achievements.map(achievement => `
            <div class="achievement-card ${achievement.earned ? 'earned' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
                ${achievement.earned ? `
                    <div class="achievement-badge">
                        <i class="fas fa-check"></i>
                    </div>
                ` : `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%"></div>
                        </div>
                    </div>
                `}
            </div>
        `).join('');
    }

    getPeriodSelectorHTML() {
        const periods = [
            { key: 'today', label: '今日', icon: 'fas fa-calendar-day' },
            { key: 'week', label: '本週', icon: 'fas fa-calendar-week' },
            { key: 'month', label: '本月', icon: 'fas fa-calendar-alt' }
        ];

        return `
            <div class="period-selector-header">
                <button class="modal-close-btn" onclick="staffStats.hidePeriodSelector()">
                    <i class="fas fa-times"></i>
                </button>
                <h3>選擇時間範圍</h3>
            </div>
            
            <div class="period-options">
                ${periods.map(period => `
                    <button class="period-option ${this.currentPeriod === period.key ? 'active' : ''}" 
                            onclick="staffStats.setPeriod('${period.key}')">
                        <i class="${period.icon}"></i>
                        <span>${period.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    initialize() {
        this.loadStatsData();
        this.setupAutoRefresh();
        this.startTimeUpdate();
    }

    async loadStatsData() {
        try {
            const currentUser = Storage.getUser();
            if (!currentUser || !currentUser.staffId) {
                throw new Error('員工身份驗證失敗');
            }

            // Load personal statistics based on current period
            await this.loadPersonalStats(currentUser.staffId);

            // Load team statistics
            await this.loadTeamStats();

            // Load staff leaderboard
            await this.loadStaffRanking();

            this.updateStatsUI();
            
        } catch (error) {
            console.error('Failed to load stats data:', error);
            
            // Fallback to demo data
            this.loadDemoStatsData();
            app.showToast('使用示範數據 - API連接失敗', 'warning');
        }
    }

    async loadPersonalStats(staffId) {
        try {
            let statsResponse;
            
            // Load appropriate statistics based on current period
            switch (this.currentPeriod) {
                case 'today':
                    statsResponse = await api.getDailyStats(staffId);
                    break;
                case 'week':
                    statsResponse = await api.getWeeklyStats(staffId);
                    break;
                case 'month':
                    statsResponse = await api.getMonthlyStats(staffId);
                    break;
                default:
                    statsResponse = await api.getDailyStats(staffId);
            }

            if (statsResponse && statsResponse.statistics) {
                const stats = statsResponse.statistics;
                
                this.personalStats = {
                    startTime: this.formatTime(stats.shiftStartTime) || '09:00',
                    workedHours: this.formatDuration(stats.totalWorkingMinutes) || this.calculateWorkedHours(),
                    completedOrders: stats.completedOrders || 0,
                    inProgressOrders: stats.inProgressOrders || 0,
                    averageTime: this.formatDuration(stats.averageCompletionMinutes) || '18分鐘',
                    efficiency: `${Math.round(stats.efficiencyPercentage || 95)}%`,
                    todayRevenue: this.formatCurrency(stats.totalRevenue) || 'NT$ 0',
                    customerSatisfaction: `${stats.customerSatisfactionScore || 4.9}/5.0`
                };
            } else {
                // Use demo data if no API response
                this.loadDemoPersonalStats();
            }
            
        } catch (error) {
            console.error('Failed to load personal stats:', error);
            this.loadDemoPersonalStats();
        }
    }

    async loadTeamStats() {
        try {
            const teamStatsResponse = await api.getTeamStats();
            
            if (teamStatsResponse) {
                this.teamStats = {
                    totalOrders: teamStatsResponse.totalOrders || 156,
                    completedOrders: teamStatsResponse.completedOrders || 142,
                    inProgressOrders: teamStatsResponse.inProgressOrders || 8,
                    cancelledOrders: teamStatsResponse.cancelledOrders || 6,
                    completionRate: `${Math.round(teamStatsResponse.completionRate || 95.6)}%`,
                    averageProcessingTime: this.formatDuration(teamStatsResponse.averageProcessingMinutes) || '18分鐘',
                    targetAchievement: `${Math.round(teamStatsResponse.targetAchievementPercentage || 75)}%`,
                    customerSatisfaction: `${teamStatsResponse.averageCustomerSatisfaction || 4.8}/5.0`,
                    totalRevenue: this.formatCurrency(teamStatsResponse.totalRevenue) || 'NT$ 89,420'
                };
            } else {
                this.loadDemoTeamStats();
            }
            
        } catch (error) {
            console.error('Failed to load team stats:', error);
            this.loadDemoTeamStats();
        }
    }

    async loadStaffRanking() {
        try {
            const period = this.mapPeriodToAPI(this.currentPeriod);
            const rankingResponse = await api.getStaffLeaderboard(period, 10);
            
            if (rankingResponse && rankingResponse.leaderboard) {
                this.staffRanking = rankingResponse.leaderboard.map((staff, index) => ({
                    rank: index + 1,
                    name: staff.staffName || staff.name,
                    orders: staff.completedOrders || 0,
                    efficiency: `${Math.round(staff.efficiencyPercentage || 0)}%`,
                    icon: this.getRankIcon(index + 1)
                }));
            } else {
                this.loadDemoRanking();
            }
            
        } catch (error) {
            console.error('Failed to load staff ranking:', error);
            this.loadDemoRanking();
        }
    }

    mapPeriodToAPI(period) {
        const periodMap = {
            'today': 'DAILY',
            'week': 'WEEKLY',
            'month': 'MONTHLY'
        };
        return periodMap[period] || 'DAILY';
    }

    loadDemoStatsData() {
        this.loadDemoPersonalStats();
        this.loadDemoTeamStats();
        this.loadDemoRanking();
    }

    loadDemoPersonalStats() {
        this.personalStats = {
            startTime: '09:00',
            workedHours: this.calculateWorkedHours(),
            completedOrders: 24,
            inProgressOrders: 3,
            averageTime: '18分鐘',
            efficiency: '95%',
            todayRevenue: 'NT$ 12,480',
            customerSatisfaction: '4.9/5.0'
        };
    }

    loadDemoTeamStats() {
        this.teamStats = {
            totalOrders: 156,
            completedOrders: 142,
            inProgressOrders: 8,
            cancelledOrders: 6,
            completionRate: '95.6%',
            averageProcessingTime: '18分鐘',
            targetAchievement: '75%',
            customerSatisfaction: '4.8/5.0',
            totalRevenue: 'NT$ 89,420'
        };
    }

    loadDemoRanking() {
        this.staffRanking = [
            { rank: 1, name: '李小華', orders: 28, efficiency: '98%', icon: '🥇' },
            { rank: 2, name: '王大明', orders: 25, efficiency: '95%', icon: '🥈' },
            { rank: 3, name: '陳小美', orders: 22, efficiency: '92%', icon: '🥉' },
            { rank: 4, name: '張三', orders: 19, efficiency: '89%', icon: '' }
        ];
    }

    updateStatsUI() {
        const contentEl = document.getElementById('stats-content');
        if (contentEl) {
            contentEl.innerHTML = this.currentView === 'personal' ? 
                this.getPersonalStatsHTML() : 
                this.getTeamStatsHTML();
        }
    }

    setupAutoRefresh() {
        // Refresh stats every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadStatsData();
        }, 300000);
    }

    startTimeUpdate() {
        // Update current time every second
        setInterval(() => {
            const currentTimeEl = document.getElementById('current-work-time');
            if (currentTimeEl) {
                currentTimeEl.textContent = this.getCurrentTime();
            }
        }, 1000);
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // View and period management
    switchView(view) {
        this.currentView = view;
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        event.target.classList.add('active');
        
        this.updateStatsUI();
    }

    setPeriod(period) {
        this.currentPeriod = period;
        
        // Update period text
        const periodTextEl = document.getElementById('current-period-text');
        if (periodTextEl) {
            periodTextEl.textContent = this.getPeriodText();
        }
        
        this.hidePeriodSelector();
        this.loadStatsData(); // Reload data for new period
    }

    showPeriodSelector() {
        const modal = document.getElementById('period-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hidePeriodSelector() {
        const modal = document.getElementById('period-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    getPeriodText() {
        const periodLabels = {
            'today': '今日',
            'week': '本週',
            'month': '本月'
        };
        return periodLabels[this.currentPeriod] || '今日';
    }

    // Data calculation methods
    calculateWorkedHours() {
        const startTime = new Date();
        startTime.setHours(9, 0, 0, 0); // Assume 9 AM start
        
        const now = new Date();
        const diffMs = now - startTime;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}小時${minutes}分`;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStaffAvatar(user) {
        if (user?.department === '廚房') return '👨‍🍳';
        if (user?.department === '外場') return '👨‍💼';
        return '👤';
    }

    // Utility methods for data formatting
    formatTime(timeString) {
        if (!timeString) return null;
        
        try {
            const time = new Date(timeString);
            return time.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return null;
        }
    }

    formatDuration(minutes) {
        if (!minutes) return null;
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}小時${mins}分`;
        } else {
            return `${mins}分鐘`;
        }
    }

    formatCurrency(amount) {
        if (!amount) return null;
        
        return `NT$ ${amount.toLocaleString('zh-TW')}`;
    }

    getRankIcon(rank) {
        const icons = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };
        return icons[rank] || '';
    }

    // Report methods
    showDetailedReport() {
        app.showToast('詳細報告功能建構中', 'info');
        // TODO: Implement detailed report modal or navigation
    }

    showWeeklyReport() {
        app.showToast('週報告功能建構中', 'info');
        // TODO: Implement weekly report
    }

    showMonthlyReport() {
        app.showToast('月報告功能建構中', 'info');
        // TODO: Implement monthly report
    }

    // Performance tracking methods
    updateRealTimeStats() {
        // This would be called when orders are completed, etc.
        this.personalStats.completedOrders++;
        this.updateStatsUI();
    }

    recordOrderCompletion(orderId, completionTime) {
        // Record completion time for efficiency calculation
        console.log(`Order ${orderId} completed in ${completionTime} minutes`);
        
        // Update efficiency metrics
        this.calculateEfficiency();
    }

    calculateEfficiency() {
        // Calculate current efficiency based on completion times
        // This is a simplified calculation
        const targetTime = 20; // Target completion time in minutes
        const actualTime = 18; // Current average time
        
        const efficiency = Math.min((targetTime / actualTime) * 100, 100);
        this.personalStats.efficiency = `${Math.round(efficiency)}%`;
    }

    // Performance insights
    getPerformanceInsights() {
        const insights = [];
        
        if (this.personalStats.efficiency > '95%') {
            insights.push({
                type: 'positive',
                message: '您的效率表現優秀！',
                suggestion: '保持這個水準'
            });
        }
        
        if (this.personalStats.completedOrders >= 25) {
            insights.push({
                type: 'achievement',
                message: '今日訂單處理量達標！',
                suggestion: '繼續保持高效率'
            });
        }
        
        return insights;
    }

    // Export and sharing
    exportStats() {
        const statsData = {
            personal: this.personalStats,
            team: this.teamStats,
            period: this.currentPeriod,
            exportDate: new Date().toISOString()
        };
        
        // Create downloadable file
        const dataStr = JSON.stringify(statsData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `staff-stats-${this.currentPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        app.showToast('統計數據已匯出', 'success');
    }
}

// Create global instance
window.staffStats = new StaffStats();