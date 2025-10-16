/**
 * Happy Chicken Ticket System - Admin JavaScript
 * 管理者向けフロントエンド機能
 */

class HappyChickenAdminApp {
    constructor() {
        this.updateInterval = null;
        this.autoRefreshEnabled = true;
        this.currentTickets = [];
        this.completedTickets = [];
        this.stats = {};
        
        // DOM要素
        this.pendingCount = document.getElementById('pending-count');
        this.completedCount = document.getElementById('completed-count');
        this.totalCount = document.getElementById('total-count');
        this.nextNumber = document.getElementById('next-number');
        this.ticketsList = document.getElementById('tickets-list');
        this.completedList = document.getElementById('completed-list');
        this.pendingBadge = document.getElementById('pending-badge');
        this.completedBadge = document.getElementById('completed-badge');
        
        // ボタン要素
        this.refreshAllBtn = document.getElementById('refresh-all-btn');
        this.autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        this.resetSystemBtn = document.getElementById('reset-system-btn');
        this.cleanupExpiredBtn = document.getElementById('cleanup-expired-btn');
        
        // ダイアログ要素
        this.confirmDialog = document.getElementById('confirm-dialog');
        this.dialogTitle = document.getElementById('dialog-title');
        this.dialogMessage = document.getElementById('dialog-message');
        this.dialogIcon = document.getElementById('dialog-icon');
        this.dialogConfirm = document.getElementById('dialog-confirm');
        this.dialogCancel = document.getElementById('dialog-cancel');
        
        // 通知とローディング
        this.notificationContainer = document.getElementById('notification-container');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        this.initializeApp();
    }

    /**
     * アプリケーション初期化
     */
    async initializeApp() {
        console.log('🐔 Happy Chicken Admin System - Initializing...');
        
        this.setupEventListeners();
        await this.loadAllData();
        this.startAutoRefresh();
        
        console.log('✅ Admin system initialized');
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // 要素の存在確認とデバッグログ
        console.log('resetSystemBtn:', this.resetSystemBtn);
        console.log('confirmDialog:', this.confirmDialog);
        console.log('dialogConfirm:', this.dialogConfirm);
        console.log('dialogCancel:', this.dialogCancel);
        
        // ヘッダーボタン
        if (this.refreshAllBtn) {
            this.refreshAllBtn.addEventListener('click', () => this.loadAllData());
        }
        if (this.autoRefreshToggle) {
            this.autoRefreshToggle.addEventListener('click', () => this.toggleAutoRefresh());
        }
        
        // アクションボタン
        if (this.resetSystemBtn) {
            this.resetSystemBtn.addEventListener('click', () => {
                console.log('🔄 Reset button clicked!');
                this.showResetConfirmation();
            });
        } else {
            console.error('❌ resetSystemBtn not found!');
        }
        
        if (this.cleanupExpiredBtn) {
            this.cleanupExpiredBtn.addEventListener('click', () => this.showCleanupConfirmation());
        }
        
        // ダイアログ
        if (this.dialogConfirm) {
            this.dialogConfirm.addEventListener('click', () => {
                console.log('🔄 Confirm button clicked!');
                this.executeConfirmedAction();
            });
        } else {
            console.error('❌ dialogConfirm not found!');
        }
        
        if (this.dialogCancel) {
            this.dialogCancel.addEventListener('click', () => this.hideConfirmDialog());
        } else {
            console.error('❌ dialogCancel not found!');
        }
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.loadAllData();
                        break;
                }
            }
        });
        
        // ページフォーカス時の自動更新
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.autoRefreshEnabled) {
                this.loadAllData();
            }
        });
    }

    /**
     * 全データの読み込み
     */
    async loadAllData() {
        try {
            console.log('🔄 Loading all admin data...');
            
            const [statsResponse, ticketsResponse] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/tickets')
            ]);

            const statsData = await statsResponse.json();
            const ticketsData = await ticketsResponse.json();

            if (!statsResponse.ok || !statsData.success) {
                throw new Error(statsData.error || '統計データの取得に失敗しました');
            }

            if (!ticketsResponse.ok || !ticketsData.success) {
                throw new Error(ticketsData.error || 'チケットデータの取得に失敗しました');
            }

            this.stats = statsData.data;
            this.currentTickets = ticketsData.data.pending || [];
            this.completedTickets = ticketsData.data.completed || [];

            this.updateDisplay();
            console.log('✅ Admin data loaded successfully');

        } catch (error) {
            console.error('❌ Error loading admin data:', error);
            this.showNotification('データ読み込みエラー', error.message, 'error');
        }
    }

    /**
     * 表示の更新
     */
    updateDisplay() {
        // 統計情報の更新
        this.pendingCount.textContent = this.stats.pending || 0;
        this.completedCount.textContent = this.stats.completed || 0;
        this.totalCount.textContent = this.stats.total || 0;
        this.nextNumber.textContent = this.stats.nextNumber || '001';
        
        // バッジの更新
        this.pendingBadge.textContent = this.currentTickets.length;
        this.completedBadge.textContent = this.completedTickets.length;
        

        
        // チケットリストの更新
        this.updateTicketsList();
        this.updateCompletedList();
    }



    /**
     * 待機中チケットリストの更新
     */
    updateTicketsList() {
        if (this.currentTickets.length === 0) {
            this.ticketsList.innerHTML = `
                <div class="no-tickets">
                    <div class="no-tickets-icon">📭</div>
                    <div class="no-tickets-text">現在待機中の番号はありません</div>
                </div>
            `;
            return;
        }

        const ticketsHtml = this.currentTickets.map(ticket => {
            const createdTime = new Date(ticket.createdAt);
            const expiresTime = new Date(ticket.expiresAt);
            const now = new Date();
            const remainingMs = expiresTime - now;
            const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
            
            return `
                <div class="ticket-item" data-session-id="${ticket.sessionId}">
                    <div class="ticket-info">
                        <div class="ticket-number">${ticket.ticketNumber}</div>
                        <div class="ticket-details">
                            <div class="ticket-time">
                                取得: ${createdTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div class="ticket-remaining">残り ${remainingMinutes}分</div>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="ticket-btn complete" onclick="adminApp.completeTicket(${ticket.id})" title="完了">
                            ✅
                        </button>
                        <button class="ticket-btn cancel" onclick="adminApp.cancelTicket(${ticket.id})" title="キャンセル">
                            ❌
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.ticketsList.innerHTML = ticketsHtml;
    }

    /**
     * 完了済みチケットリストの更新
     */
    updateCompletedList() {
        if (this.completedTickets.length === 0) {
            this.completedList.innerHTML = `
                <div class="no-completed">
                    <div class="no-completed-icon">📝</div>
                    <div class="no-completed-text">まだ完了した番号はありません</div>
                </div>
            `;
            return;
        }

        const completedHtml = this.completedTickets.map(ticket => {
            const createdTime = new Date(ticket.createdAt);
            const completedTime = new Date(ticket.updatedAt);
            
            return `
                <div class="ticket-item">
                    <div class="ticket-info">
                        <div class="ticket-number">${ticket.ticketNumber}</div>
                        <div class="ticket-details">
                            <div class="ticket-time">
                                取得: ${createdTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div class="ticket-time">
                                完了: ${completedTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <div style="color: var(--success-green); font-size: 1.5rem;">✅</div>
                    </div>
                </div>
            `;
        }).join('');

        this.completedList.innerHTML = completedHtml;
    }

    /**
     * 次の番号を呼び出し
     */
    async callNextTicket() {
        if (this.currentTickets.length === 0) {
            this.showNotification('呼び出し不可', '待機中の番号がありません', 'warning');
            return;
        }

        const nextTicket = this.currentTickets[0];
        this.showNotification('呼び出し中', `番号 ${nextTicket.ticketNumber} を呼び出しています`, 'info');
        
        // 実際の呼び出し処理（音声やディスプレイ連携など）はここで実装
        // 現在は通知のみ
        
        setTimeout(() => {
            this.showNotification('呼び出し完了', `番号 ${nextTicket.ticketNumber} の呼び出しが完了しました`, 'success');
        }, 2000);
    }

    /**
     * 現在の番号を完了
     */
    async completeCurrentTicket() {
        if (this.currentTickets.length === 0) {
            this.showNotification('完了不可', '待機中の番号がありません', 'warning');
            return;
        }

        const currentTicket = this.currentTickets[0];
        await this.completeTicket(currentTicket.sessionId);
    }

    /**
     * 指定されたチケットを完了
     */
    async completeTicket(ticketId) {
        try {
            this.showLoading(true);
            
            const response = await fetch(`/api/admin/tickets/${ticketId}/complete`, {
                method: 'PUT'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'チケットの完了処理に失敗しました');
            }

            this.showNotification('完了', 'チケットが完了されました', 'success');
            await this.loadAllData();

        } catch (error) {
            console.error('❌ Error completing ticket:', error);
            this.showNotification('完了エラー', error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 指定されたチケットをキャンセル
     */
    async cancelTicket(ticketId) {
        try {
            this.showLoading(true);
            
            const response = await fetch(`/api/admin/tickets/${ticketId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'チケットのキャンセルに失敗しました');
            }

            this.showNotification('キャンセル', 'チケットがキャンセルされました', 'success');
            await this.loadAllData();

        } catch (error) {
            console.error('❌ Error cancelling ticket:', error);
            this.showNotification('キャンセルエラー', error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * システムリセットの確認表示
     */
    showResetConfirmation() {
        console.log('🔄 showResetConfirmation called!');
        this.showConfirmDialog(
            '🔄', 
            'システムリセット',
            'すべての番号をリセットして1番から開始します。<br><strong>この操作は取り消せません。</strong>',
            'reset'
        );
    }

    /**
     * 期限切れ整理の確認表示
     */
    showCleanupConfirmation() {
        this.showConfirmDialog(
            '🗑️',
            '期限切れ整理',
            '期限切れの番号をすべて削除します。<br>この操作は取り消せません。',
            'cleanup'
        );
    }

    /**
     * 確認ダイアログの表示
     */
    showConfirmDialog(icon, title, message, action) {
        console.log('📋 showConfirmDialog called with:', { icon, title, message, action });
        console.log('Dialog elements:', {
            dialogIcon: this.dialogIcon,
            dialogTitle: this.dialogTitle,
            dialogMessage: this.dialogMessage,
            confirmDialog: this.confirmDialog
        });
        
        if (this.dialogIcon) this.dialogIcon.textContent = icon;
        if (this.dialogTitle) this.dialogTitle.textContent = title;
        if (this.dialogMessage) this.dialogMessage.innerHTML = message;
        if (this.confirmDialog) {
            this.confirmDialog.style.display = 'flex';
            this.confirmDialog.dataset.action = action;
            console.log('✅ Dialog should be visible now');
        } else {
            console.error('❌ confirmDialog element not found!');
        }
    }

    /**
     * 確認ダイアログの非表示
     */
    hideConfirmDialog() {
        this.confirmDialog.style.display = 'none';
        delete this.confirmDialog.dataset.action;
    }

    /**
     * 確認されたアクションの実行
     */
    async executeConfirmedAction() {
        const action = this.confirmDialog.dataset.action;
        this.hideConfirmDialog();

        switch (action) {
            case 'reset':
                await this.resetSystem();
                break;
            case 'cleanup':
                await this.cleanupExpired();
                break;
        }
    }

    /**
     * システムリセット
     */
    async resetSystem() {
        try {
            this.showLoading(true);
            
            const response = await fetch('/api/admin/reset', {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'システムリセットに失敗しました');
            }

            this.showNotification('リセット完了', 'システムが正常にリセットされました', 'success');
            await this.loadAllData();

        } catch (error) {
            console.error('❌ Error resetting system:', error);
            this.showNotification('リセットエラー', error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 期限切れチケットの整理
     */
    async cleanupExpired() {
        try {
            this.showLoading(true);
            
            const response = await fetch('/api/admin/cleanup', {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || '期限切れ整理に失敗しました');
            }

            const cleanedCount = data.data?.cleanedCount || 0;
            this.showNotification('整理完了', `${cleanedCount}件の期限切れ番号を削除しました`, 'success');
            await this.loadAllData();

        } catch (error) {
            console.error('❌ Error cleaning up expired tickets:', error);
            this.showNotification('整理エラー', error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 自動更新の切り替え
     */
    toggleAutoRefresh() {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        
        if (this.autoRefreshEnabled) {
            this.autoRefreshToggle.classList.add('active');
            this.startAutoRefresh();
            this.showNotification('自動更新', '自動更新が有効になりました', 'success');
        } else {
            this.autoRefreshToggle.classList.remove('active');
            this.stopAutoRefresh();
            this.showNotification('自動更新', '自動更新が無効になりました', 'warning');
        }
    }

    /**
     * 自動更新の開始
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        
        if (this.autoRefreshEnabled) {
            this.updateInterval = setInterval(() => {
                this.loadAllData();
            }, 10000); // 10秒間隔
            
            console.log('🔄 Auto-refresh started (10s interval)');
        }
    }

    /**
     * 自動更新の停止
     */
    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Auto-refresh stopped');
        }
    }

    /**
     * 通知の表示
     */
    showNotification(title, message, type = 'info') {
        const notificationId = `notification-${Date.now()}`;
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = notificationId;
        notification.innerHTML = `
            <div class="notification-icon">${iconMap[type]}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="adminApp.closeNotification('${notificationId}')">
                ×
            </button>
        `;

        this.notificationContainer.appendChild(notification);

        // 5秒後に自動削除
        setTimeout(() => {
            this.closeNotification(notificationId);
        }, 5000);
    }

    /**
     * 通知を閉じる
     */
    closeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    /**
     * ローディング表示の切り替え
     */
    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// CSS アニメーション追加
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationSlideOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Happy Chicken Admin System - DOM Loaded');
    window.adminApp = new HappyChickenAdminApp();
});

// ページを離れる前の確認
window.addEventListener('beforeunload', (e) => {
    // 特別な確認は不要（管理者画面のため）
});