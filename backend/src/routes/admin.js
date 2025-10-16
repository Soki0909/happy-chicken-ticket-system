const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');

/**
 * GET /api/admin/tickets
 * 有効な番号一覧取得（管理画面用）
 */
router.get('/tickets', async (req, res) => {
    try {
        console.log('📋 Admin: Active tickets list requested');
        
        // 有効なチケット一覧を取得
        const activeTickets = await Ticket.findActive();
        
        console.log(`📊 Found ${activeTickets.length} active tickets`);
        
        res.json({
            success: true,
            message: '有効な整理番号一覧を取得しました',
            data: activeTickets,
            count: activeTickets.length
        });

    } catch (error) {
        console.error('❌ Admin: Error fetching active tickets:', error);
        res.status(500).json({
            success: false,
            error: '整理番号一覧の取得に失敗しました',
            code: 'ADMIN_TICKETS_FETCH_FAILED'
        });
    }
});

/**
 * PUT /api/admin/tickets/:id/complete
 * 番号のステータスを完了に更新
 */
router.put('/tickets/:id/complete', async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        console.log(`✅ Admin: Completing ticket ID: ${ticketId}`);

        // チケットの存在確認
        const ticket = await Ticket.findById(ticketId);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: '指定された整理番号が見つかりません',
                code: 'TICKET_NOT_FOUND'
            });
        }

        if (ticket.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: '完了できない状態です',
                code: 'CANNOT_COMPLETE'
            });
        }

        // チケットを完了状態に更新
        const success = await Ticket.markAsCompleted(ticketId);
        
        if (!success) {
            return res.status(500).json({
                success: false,
                error: 'ステータスの更新に失敗しました',
                code: 'UPDATE_FAILED'
            });
        }

        console.log(`✅ Admin: Ticket #${ticket.ticketNumber} marked as completed`);
        
        res.json({
            success: true,
            message: `整理番号 #${ticket.ticketNumber} を完了しました`,
            data: {
                id: ticketId,
                ticketNumber: ticket.ticketNumber,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('❌ Admin: Error completing ticket:', error);
        res.status(500).json({
            success: false,
            error: '整理番号の完了処理に失敗しました',
            code: 'ADMIN_COMPLETE_FAILED'
        });
    }
});

/**
 * POST /api/admin/reset
 * 番号のリセット（全チケット削除・カウンターリセット）
 */
router.post('/reset', async (req, res) => {
    try {
        console.log('🔄 Admin: System reset requested');
        
        // 統計情報を取得（リセット前）
        const statsBefore = await Ticket.getStats();
        console.log('📊 Pre-reset stats:', statsBefore);

        // 全チケットをリセット
        const success = await Ticket.resetAll();
        
        if (!success) {
            return res.status(500).json({
                success: false,
                error: 'リセット処理に失敗しました',
                code: 'RESET_FAILED'
            });
        }

        // 統計情報を取得（リセット後）
        const statsAfter = await Ticket.getStats();
        console.log('📊 Post-reset stats:', statsAfter);

        console.log('✅ Admin: System reset completed successfully');
        
        res.json({
            success: true,
            message: 'システムをリセットしました。次の番号は 001 から開始されます。',
            data: {
                resetTimestamp: new Date().toISOString(),
                ticketsCleared: statsBefore.total,
                nextNumber: '001'
            }
        });

    } catch (error) {
        console.error('❌ Admin: Error resetting system:', error);
        res.status(500).json({
            success: false,
            error: 'システムのリセットに失敗しました',
            code: 'ADMIN_RESET_FAILED'
        });
    }
});

/**
 * GET /api/admin/stats
 * システム統計情報取得
 */
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 Admin: Statistics requested');
        
        const stats = await Ticket.getStats();
        
        res.json({
            success: true,
            message: 'システム統計情報を取得しました',
            data: {
                ...stats,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Admin: Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: '統計情報の取得に失敗しました',
            code: 'ADMIN_STATS_FAILED'
        });
    }
});

/**
 * POST /api/admin/cleanup
 * 期限切れチケットのクリーンアップ
 */
router.post('/cleanup', async (req, res) => {
    try {
        console.log('🧹 Admin: Cleanup requested');
        
        const deletedCount = await Ticket.cleanupExpired();
        
        res.json({
            success: true,
            message: `${deletedCount} 件の期限切れチケットをクリーンアップしました`,
            data: {
                deletedCount,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Admin: Error during cleanup:', error);
        res.status(500).json({
            success: false,
            error: 'クリーンアップ処理に失敗しました',
            code: 'ADMIN_CLEANUP_FAILED'
        });
    }
});

module.exports = router;