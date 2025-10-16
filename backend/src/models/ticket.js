const { query, queryOne, transaction } = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Happy Chicken Ticket Model
 * チケットの作成、取得、更新、削除機能とビジネスロジックを提供
 */
class Ticket {
    /**
     * 新しい整理番号を発行
     * @param {string} sessionId - セッションID
     * @returns {Object} 発行されたチケット情報
     */
    static async create(sessionId = null) {
        try {
            // セッションIDが指定されていない場合は新規生成
            if (!sessionId) {
                sessionId = uuidv4();
            }

            // 既存のセッションでまだ有効なチケットがあるかチェック
            const existingTicket = await this.findBySessionId(sessionId);
            if (existingTicket && existingTicket.status === 'pending') {
                return existingTicket;
            }

            // 新しい番号を生成
            const ticketNumber = await this.generateNextNumber();
            
            // 有効期限を設定（15分後）
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + (process.env.TICKET_EXPIRY_MINUTES || 15));

            // チケットを作成
            const insertSql = `
                INSERT INTO tickets (ticket_number, session_id, expires_at, status)
                VALUES (?, ?, ?, 'pending')
            `;
            
            const result = await query(insertSql, [
                ticketNumber,
                sessionId,
                expiresAt.toISOString()
            ]);

            // 作成されたチケットを取得
            const newTicket = await this.findBySessionId(sessionId);
            
            console.log(`🎫 New ticket created: #${String(ticketNumber).padStart(3, '0')} (Session: ${sessionId.substring(0, 8)}...)`);
            
            return {
                id: newTicket.id,
                ticketNumber: String(ticketNumber).padStart(3, '0'),
                sessionId: sessionId,
                status: 'pending',
                createdAt: newTicket.created_at,
                expiresAt: expiresAt.toISOString(),
                timeRemaining: this.calculateTimeRemaining(expiresAt)
            };

        } catch (error) {
            console.error('❌ Error creating ticket:', error);
            throw error;
        }
    }

    /**
     * セッションIDでチケットを検索
     * @param {string} sessionId - セッションID
     * @returns {Object|null} チケット情報
     */
    static async findBySessionId(sessionId) {
        try {
            const sql = `
                SELECT * FROM tickets 
                WHERE session_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            
            const ticket = await queryOne(sql, [sessionId]);
            
            if (!ticket) {
                return null;
            }

            // 有効期限チェック
            const now = new Date();
            const expiresAt = new Date(ticket.expires_at);
            
            if (now > expiresAt && ticket.status === 'pending') {
                // 期限切れの場合はステータスを更新
                await this.markAsExpired(ticket.id);
                ticket.status = 'expired';
            }

            return {
                id: ticket.id,
                ticketNumber: String(ticket.ticket_number).padStart(3, '0'),
                sessionId: ticket.session_id,
                status: ticket.status,
                createdAt: ticket.created_at,
                expiresAt: ticket.expires_at,
                timeRemaining: this.calculateTimeRemaining(expiresAt)
            };

        } catch (error) {
            console.error('❌ Error finding ticket by session ID:', error);
            throw error;
        }
    }

    /**
     * チケットIDでチケットを検索
     * @param {number} id - チケットID
     * @returns {Object|null} チケット情報
     */
    static async findById(id) {
        try {
            const sql = 'SELECT * FROM tickets WHERE id = ?';
            const ticket = await queryOne(sql, [id]);
            
            if (!ticket) {
                return null;
            }

            return {
                id: ticket.id,
                ticketNumber: String(ticket.ticket_number).padStart(3, '0'),
                sessionId: ticket.session_id,
                status: ticket.status,
                createdAt: ticket.created_at,
                expiresAt: ticket.expires_at,
                timeRemaining: this.calculateTimeRemaining(new Date(ticket.expires_at))
            };

        } catch (error) {
            console.error('❌ Error finding ticket by ID:', error);
            throw error;
        }
    }

    /**
     * 有効なチケット一覧を取得（管理画面用）
     * @returns {Array} 有効なチケットのリスト
     */
    static async findActive() {
        try {
            const sql = `
                SELECT * FROM tickets 
                WHERE status = 'pending' 
                AND expires_at > datetime('now')
                ORDER BY ticket_number ASC
            `;
            
            const tickets = await query(sql);
            
            return tickets.map(ticket => ({
                id: ticket.id,
                ticketNumber: String(ticket.ticket_number).padStart(3, '0'),
                sessionId: ticket.session_id,
                status: ticket.status,
                createdAt: ticket.created_at,
                expiresAt: ticket.expires_at,
                timeRemaining: this.calculateTimeRemaining(new Date(ticket.expires_at))
            }));

        } catch (error) {
            console.error('❌ Error finding active tickets:', error);
            throw error;
        }
    }

    /**
     * チケットを完了状態に更新
     * @param {number} id - チケットID
     * @returns {boolean} 更新成功フラグ
     */
    static async markAsCompleted(id) {
        try {
            const sql = 'UPDATE tickets SET status = ? WHERE id = ? AND status = ?';
            const result = await query(sql, ['completed', id, 'pending']);
            
            if (result.affectedRows > 0) {
                console.log(`✅ Ticket #${id} marked as completed`);
                return true;
            }
            
            return false;

        } catch (error) {
            console.error('❌ Error marking ticket as completed:', error);
            throw error;
        }
    }

    /**
     * チケットを期限切れ状態に更新
     * @param {number} id - チケットID
     * @returns {boolean} 更新成功フラグ
     */
    static async markAsExpired(id) {
        try {
            const sql = 'UPDATE tickets SET status = ? WHERE id = ?';
            const result = await query(sql, ['expired', id]);
            
            if (result.affectedRows > 0) {
                console.log(`⏰ Ticket #${id} marked as expired`);
                return true;
            }
            
            return false;

        } catch (error) {
            console.error('❌ Error marking ticket as expired:', error);
            throw error;
        }
    }

    /**
     * 全チケットをリセット（管理者機能）
     * @returns {boolean} リセット成功フラグ
     */
    static async resetAll() {
        try {
            // 全チケットを削除
            await query('DELETE FROM tickets');
            
            // カウンターをリセット
            await query('UPDATE ticket_counter SET current_number = 0 WHERE id = 1');

            console.log('🔄 All tickets have been reset');
            return true;

        } catch (error) {
            console.error('❌ Error resetting tickets:', error);
            throw error;
        }
    }

    /**
     * 次の番号を生成
     * @returns {number} 次の番号
     */
    static async generateNextNumber() {
        try {
            // カウンターを1増やして新しい番号を取得
            const updateSql = `
                UPDATE ticket_counter 
                SET current_number = current_number + 1, 
                    updated_at = datetime('now') 
                WHERE id = 1
            `;
            
            await query(updateSql);
            
            // 更新された番号を取得
            const selectSql = 'SELECT current_number FROM ticket_counter WHERE id = 1';
            const result = await queryOne(selectSql);
            
            return result.current_number;

        } catch (error) {
            console.error('❌ Error generating next number:', error);
            throw error;
        }
    }

    /**
     * 残り時間を計算（秒単位）
     * @param {Date} expiresAt - 有効期限
     * @returns {number} 残り時間（秒）
     */
    static calculateTimeRemaining(expiresAt) {
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        return Math.max(0, Math.floor(diff / 1000));
    }

    /**
     * 期限切れチケットのクリーンアップ
     * @returns {number} 削除されたチケット数
     */
    static async cleanupExpired() {
        try {
            // 24時間以上古いチケットを削除
            const sql = `
                DELETE FROM tickets 
                WHERE created_at < datetime('now', '-24 hours')
            `;
            
            const result = await query(sql);
            const deletedCount = result.affectedRows || 0;
            
            if (deletedCount > 0) {
                console.log(`🧹 Cleaned up ${deletedCount} expired tickets`);
            }
            
            return deletedCount;

        } catch (error) {
            console.error('❌ Error cleaning up expired tickets:', error);
            throw error;
        }
    }

    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    static async getStats() {
        try {
            const totalSql = 'SELECT COUNT(*) as total FROM tickets';
            const pendingSql = 'SELECT COUNT(*) as pending FROM tickets WHERE status = ?';
            const completedSql = 'SELECT COUNT(*) as completed FROM tickets WHERE status = ?';
            const expiredSql = 'SELECT COUNT(*) as expired FROM tickets WHERE status = ?';

            const [total, pending, completed, expired] = await Promise.all([
                queryOne(totalSql),
                queryOne(pendingSql, ['pending']),
                queryOne(completedSql, ['completed']),
                queryOne(expiredSql, ['expired'])
            ]);

            return {
                total: total.total,
                pending: pending.pending,
                completed: completed.completed,
                expired: expired.expired
            };

        } catch (error) {
            console.error('❌ Error getting ticket stats:', error);
            throw error;
        }
    }
}

module.exports = Ticket;