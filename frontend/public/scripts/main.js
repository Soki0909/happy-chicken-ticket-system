/**
 * Happy Chicken Ticket System - Main JavaScript
 * 顧客向けフロントエンド機能
 */

class HappyChickenTicketApp {
    constructor() {
        this.sessionId = null;
        this.ticketData = null;
        this.updateInterval = null;
        this.timeUpdateInterval = null;
        
        // DOM要素
        this.loadingScreen = document.getElementById('loading-screen');
        this.ticketScreen = document.getElementById('ticket-screen');
        this.errorScreen = document.getElementById('error-screen');
        this.expiredScreen = document.getElementById('expired-screen');
        
        // チケット表示要素
        this.ticketNumber = document.getElementById('ticket-number');
        this.ticketStatus = document.getElementById('ticket-status');
        this.timeRemaining = document.getElementById('time-remaining');
        this.progressFill = document.getElementById('progress-fill');
        
        // エラー表示要素
        this.errorTitle = document.getElementById('error-title');
        this.errorMessage = document.getElementById('error-message');
        
        // ボタン要素
        this.refreshBtn = document.getElementById('refresh-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.retryBtn = document.getElementById('retry-btn');
        this.newTicketBtn = document.getElementById('new-ticket-btn');
        this.getNewTicketBtn = document.getElementById('get-new-ticket-btn');
        
        this.initializeApp();
    }

    /**
     * アプリケーション初期化
     */
    async initializeApp() {
        console.log('🐔 Happy Chicken Ticket System - Initializing...');
        
        this.setupEventListeners();
        this.loadSessionData();
        
        // 既存のセッションがあるかチェック
        if (this.sessionId) {
            console.log(`📋 Existing session found: ${this.sessionId.substring(0, 8)}...`);
            await this.fetchTicketData();
        } else {
            console.log('🎫 No existing session, creating new ticket...');
            await this.createNewTicket();
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        this.refreshBtn?.addEventListener('click', () => this.refreshTicket());
        this.cancelBtn?.addEventListener('click', () => this.cancelTicket());
        this.retryBtn?.addEventListener('click', () => this.retryLastAction());
        this.newTicketBtn?.addEventListener('click', () => this.createNewTicket());
        this.getNewTicketBtn?.addEventListener('click', () => this.createNewTicket());
        
        // ページが隠れた時とフォーカスを取り戻した時の処理
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.ticketData) {
                this.refreshTicket();
            }
        });
        
        // ページを離れる前の確認
        window.addEventListener('beforeunload', (e) => {
            if (this.ticketData && this.ticketData.status === 'pending') {
                e.preventDefault();
                e.returnValue = '整理番号が取得されています。本当にページを離れますか？';
            }
        });
    }

    /**
     * セッションデータの読み込み
     */
    loadSessionData() {
        try {
            const savedSessionId = localStorage.getItem('happyChicken_sessionId');
            const savedTicketData = localStorage.getItem('happyChicken_ticketData');
            
            if (savedSessionId && savedTicketData) {
                this.sessionId = savedSessionId;
                this.ticketData = JSON.parse(savedTicketData);
                console.log('💾 Session data loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Error loading session data:', error);
            this.clearSessionData();
        }
    }

    /**
     * セッションデータの保存
     */
    saveSessionData() {
        try {
            if (this.sessionId) {
                localStorage.setItem('happyChicken_sessionId', this.sessionId);
            }
            if (this.ticketData) {
                localStorage.setItem('happyChicken_ticketData', JSON.stringify(this.ticketData));
            }
        } catch (error) {
            console.error('❌ Error saving session data:', error);
        }
    }

    /**
     * セッションデータのクリア
     */
    clearSessionData() {
        this.sessionId = null;
        this.ticketData = null;
        localStorage.removeItem('happyChicken_sessionId');
        localStorage.removeItem('happyChicken_ticketData');
        console.log('🗑️ Session data cleared');
    }

    /**
     * 新しいチケットを作成
     */
    async createNewTicket() {
        try {
            this.showScreen('loading');
            this.clearSessionData();
            
            console.log('🎫 Creating new ticket...');
            
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'チケットの作成に失敗しました');
            }

            this.ticketData = data.data;
            this.sessionId = data.data.sessionId;
            this.saveSessionData();

            console.log(`✅ New ticket created: #${this.ticketData.ticketNumber}`);
            
            this.displayTicket();
            this.startAutoUpdate();

        } catch (error) {
            console.error('❌ Error creating ticket:', error);
            this.showError('チケット作成エラー', error.message);
        }
    }

    /**
     * チケットデータの取得
     */
    async fetchTicketData() {
        try {
            if (!this.sessionId) {
                throw new Error('セッションIDがありません');
            }

            console.log(`🔍 Fetching ticket data for session: ${this.sessionId.substring(0, 8)}...`);

            const response = await fetch(`/api/tickets/${this.sessionId}`);
            const data = await response.json();

            if (response.status === 404 || response.status === 410) {
                // チケットが見つからない、または期限切れ
                this.handleExpiredTicket(data.error);
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'チケット情報の取得に失敗しました');
            }

            this.ticketData = data.data;
            this.saveSessionData();

            console.log(`✅ Ticket data updated: #${this.ticketData.ticketNumber} (${this.ticketData.timeRemaining}s remaining)`);
            
            this.displayTicket();
            this.startAutoUpdate();

        } catch (error) {
            console.error('❌ Error fetching ticket data:', error);
            this.showError('データ取得エラー', error.message);
        }
    }

    /**
     * チケット情報の表示
     */
    displayTicket() {
        if (!this.ticketData) return;

        // チケット番号の表示
        this.ticketNumber.textContent = this.ticketData.ticketNumber;
        
        // ステータスの表示
        let statusText = '';
        switch (this.ticketData.status) {
            case 'pending':
                statusText = 'お待ちください';
                break;
            case 'completed':
                statusText = '完了しました';
                break;
            default:
                statusText = this.ticketData.status;
        }
        this.ticketStatus.textContent = statusText;

        // 時間とプログレスバーの更新
        this.updateTimeDisplay();
        
        this.showScreen('ticket');
        
        // フェードイン効果
        this.ticketScreen.classList.add('fade-in');
        setTimeout(() => {
            this.ticketScreen.classList.remove('fade-in');
        }, 500);
    }

    /**
     * 時間表示の更新
     */
    updateTimeDisplay() {
        if (!this.ticketData) return;

        const now = Date.now();
        const expiresAt = new Date(this.ticketData.expiresAt).getTime();
        const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        // 時間表示の更新
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        this.timeRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // プログレスバーの更新（15分 = 900秒）
        const totalSeconds = 15 * 60;
        const progressPercent = Math.max(0, (timeRemaining / totalSeconds) * 100);
        this.progressFill.style.width = `${progressPercent}%`;
        
        // 残り時間が少ない場合の色変更
        if (timeRemaining <= 300) { // 5分以下
            this.timeRemaining.style.color = 'var(--danger-red)';
            this.progressFill.style.background = 'linear-gradient(90deg, #dc3545 0%, #c53030 100%)';
        } else if (timeRemaining <= 600) { // 10分以下
            this.timeRemaining.style.color = 'var(--warning-yellow)';
            this.progressFill.style.background = 'linear-gradient(90deg, #ffc107 0%, #e0a800 100%)';
        } else {
            this.timeRemaining.style.color = 'var(--happy-orange)';
            this.progressFill.style.background = 'linear-gradient(90deg, var(--happy-yellow) 0%, var(--happy-orange) 100%)';
        }
        
        // 期限切れチェック
        if (timeRemaining <= 0) {
            this.handleExpiredTicket('整理番号の有効期限が切れました');
        }
    }

    /**
     * 自動更新の開始
     */
    startAutoUpdate() {
        this.stopAutoUpdate();
        
        // チケットデータの更新（30秒間隔）
        this.updateInterval = setInterval(() => {
            if (this.sessionId) {
                this.fetchTicketData();
            }
        }, 30000);
        
        // 時間表示の更新（1秒間隔）
        this.timeUpdateInterval = setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
        
        console.log('🔄 Auto-update started');
    }

    /**
     * 自動更新の停止
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }
        
        console.log('⏹️ Auto-update stopped');
    }

    /**
     * チケットの手動更新
     */
    async refreshTicket() {
        if (!this.sessionId) return;
        
        console.log('🔄 Manual refresh requested');
        await this.fetchTicketData();
    }

    /**
     * チケットのキャンセル
     */
    async cancelTicket() {
        if (!this.sessionId || !confirm('整理番号をキャンセルしますか？')) return;
        
        try {
            console.log('❌ Cancelling ticket...');
            
            const response = await fetch(`/api/tickets/${this.sessionId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'キャンセルに失敗しました');
            }

            console.log('✅ Ticket cancelled successfully');
            
            this.stopAutoUpdate();
            this.clearSessionData();
            this.showCancelledMessage();

        } catch (error) {
            console.error('❌ Error cancelling ticket:', error);
            this.showError('キャンセルエラー', error.message);
        }
    }

    /**
     * 期限切れの処理
     */
    handleExpiredTicket(message) {
        console.log('⏰ Ticket expired');
        this.stopAutoUpdate();
        this.clearSessionData();
        this.showScreen('expired');
        
        // カスタムメッセージがあれば表示
        if (message && this.expiredScreen.querySelector('.expired-message')) {
            this.expiredScreen.querySelector('.expired-message').innerHTML = message;
        }
    }

    /**
     * キャンセル完了メッセージの表示
     */
    showCancelledMessage() {
        this.showError('キャンセル完了', '整理番号がキャンセルされました。<br>新しい番号が必要な場合は、再度取得してください。', false);
    }

    /**
     * エラー表示
     */
    showError(title, message, isError = true) {
        this.errorTitle.textContent = title;
        this.errorMessage.innerHTML = message;
        
        if (!isError) {
            this.errorTitle.style.color = 'var(--happy-orange)';
            this.errorScreen.querySelector('.error-icon').textContent = '✅';
        } else {
            this.errorTitle.style.color = 'var(--danger-red)';
            this.errorScreen.querySelector('.error-icon').textContent = '⚠️';
        }
        
        this.showScreen('error');
        this.stopAutoUpdate();
    }

    /**
     * 画面の切り替え
     */
    showScreen(screenName) {
        // 全画面を非表示
        [this.loadingScreen, this.ticketScreen, this.errorScreen, this.expiredScreen].forEach(screen => {
            if (screen) screen.style.display = 'none';
        });
        
        // 指定された画面を表示
        switch (screenName) {
            case 'loading':
                this.loadingScreen.style.display = 'flex';
                break;
            case 'ticket':
                this.ticketScreen.style.display = 'flex';
                break;
            case 'error':
                this.errorScreen.style.display = 'flex';
                break;
            case 'expired':
                this.expiredScreen.style.display = 'flex';
                break;
        }
        
        console.log(`📺 Screen switched to: ${screenName}`);
    }

    /**
     * 最後のアクションのリトライ
     */
    async retryLastAction() {
        if (this.sessionId) {
            await this.fetchTicketData();
        } else {
            await this.createNewTicket();
        }
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Happy Chicken Ticket System - DOM Loaded');
    window.happyChickenApp = new HappyChickenTicketApp();
});

// Service Worker の登録（PWA対応）
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error);
    });
}