const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');

/**
 * POST /api/tickets
 * 新規整理番号発行エンドポイント
 * セッション管理、一意番号生成、有効期限設定機能を提供
 */
router.post('/', async (req, res) => {
    try {
        console.log('📝 Ticket creation request received');
        
        // セッションIDを確認（既存セッションがあれば使用）
        let sessionId = req.session.ticketSessionId;
        
        // 既存セッションのチケットをチェック
        if (sessionId) {
            const existingTicket = await Ticket.findBySessionId(sessionId);
            if (existingTicket && existingTicket.status === 'pending') {
                console.log(`♻️ Returning existing ticket for session: ${sessionId.substring(0, 8)}...`);
                return res.json({
                    success: true,
                    message: '既存の整理番号が見つかりました',
                    data: existingTicket
                });
            }
        }

        // 新しいチケットを作成
        const ticket = await Ticket.create(sessionId);
        
        // セッションにチケット情報を保存
        req.session.ticketSessionId = ticket.sessionId;
        req.session.ticketId = ticket.id;
        
        console.log(`✅ New ticket created successfully: #${ticket.ticketNumber}`);
        
        res.json({
            success: true,
            message: '整理番号を発行しました',
            data: ticket
        });

    } catch (error) {
        console.error('❌ Error creating ticket:', error);
        res.status(500).json({
            success: false,
            error: 'チケットの作成に失敗しました',
            code: 'TICKET_CREATION_FAILED'
        });
    }
});

/**
 * GET /api/tickets/:sessionId
 * セッションIDに基づく番号取得エンドポイント
 * 有効期限チェックとステータス確認機能を提供
 */
router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log(`🔍 Ticket lookup request for session: ${sessionId.substring(0, 8)}...`);

        // チケットを検索
        const ticket = await Ticket.findBySessionId(sessionId);
        
        if (!ticket) {
            console.log(`❌ Ticket not found for session: ${sessionId.substring(0, 8)}...`);
            return res.status(404).json({
                success: false,
                error: '整理番号が見つかりません',
                code: 'TICKET_NOT_FOUND'
            });
        }

        // 期限切れまたは完了済みの場合
        if (ticket.status === 'expired') {
            console.log(`⏰ Ticket expired for session: ${sessionId.substring(0, 8)}...`);
            return res.status(410).json({
                success: false,
                error: '整理番号の有効期限が切れました。新しい番号を取得してください。',
                code: 'TICKET_EXPIRED'
            });
        }

        if (ticket.status === 'completed') {
            console.log(`✅ Ticket completed for session: ${sessionId.substring(0, 8)}...`);
            return res.status(410).json({
                success: false,
                error: 'この整理番号は既に完了しています。',
                code: 'TICKET_COMPLETED'
            });
        }

        console.log(`✅ Ticket found: #${ticket.ticketNumber} (${ticket.timeRemaining}s remaining)`);
        
        res.json({
            success: true,
            message: '整理番号の情報を取得しました',
            data: ticket
        });

    } catch (error) {
        console.error('❌ Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            error: 'チケット情報の取得に失敗しました',
            code: 'TICKET_FETCH_FAILED'
        });
    }
});

/**
 * GET /api/tickets
 * 現在のセッションのチケット情報を取得
 */
router.get('/', async (req, res) => {
    try {
        const sessionId = req.session.ticketSessionId;
        
        if (!sessionId) {
            return res.status(404).json({
                success: false,
                error: 'セッションに整理番号が見つかりません',
                code: 'NO_SESSION_TICKET'
            });
        }

        // セッションIDを使って再帰的にチケット取得
        req.params.sessionId = sessionId;
        return router.handle(req, res);

    } catch (error) {
        console.error('❌ Error fetching session ticket:', error);
        res.status(500).json({
            success: false,
            error: 'セッションチケットの取得に失敗しました',
            code: 'SESSION_TICKET_FETCH_FAILED'
        });
    }
});

/**
 * DELETE /api/tickets/:sessionId
 * チケットをキャンセル（期限切れ状態に設定）
 */
router.delete('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log(`🗑️ Ticket cancellation request for session: ${sessionId.substring(0, 8)}...`);

        const ticket = await Ticket.findBySessionId(sessionId);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: '整理番号が見つかりません',
                code: 'TICKET_NOT_FOUND'
            });
        }

        if (ticket.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'キャンセルできない状態です',
                code: 'CANNOT_CANCEL'
            });
        }

        // チケットを期限切れ状態に設定
        await Ticket.markAsExpired(ticket.id);
        
        // セッションをクリア
        req.session.ticketSessionId = null;
        req.session.ticketId = null;

        console.log(`✅ Ticket cancelled: #${ticket.ticketNumber}`);
        
        res.json({
            success: true,
            message: '整理番号をキャンセルしました'
        });

    } catch (error) {
        console.error('❌ Error cancelling ticket:', error);
        res.status(500).json({
            success: false,
            error: 'チケットのキャンセルに失敗しました',
            code: 'TICKET_CANCEL_FAILED'
        });
    }
});

module.exports = router;