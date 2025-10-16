# Happy Chicken Ticket System - Render.com Deployment Guide

## 🚀 デプロイ手順

### 1. Render.comアカウント設定
1. [Render.com](https://render.com)でアカウント作成
2. GitHubリポジトリと接続

### 2. Web Service作成

#### 基本設定
- **Name**: `happy-chicken-ticket-system`
- **Environment**: `Node`
- **Region**: `Singapore` (アジア太平洋地域で最適)
- **Branch**: `master`
- **Build Command**: `chmod +x build.sh && ./build.sh`
- **Start Command**: `cd backend && npm start`

#### 環境変数設定
```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-super-secret-key-here
TICKET_EXPIRY_MINUTES=15
BRAND_NAME=Happy Chicken
CORS_ORIGIN=https://your-app-name.onrender.com
```

### 3. データベース設定（オプション）

#### SQLite（推奨 - 小規模運用）
- デフォルト設定で動作
- ファイルベースDB（`data/tickets.db`）
- 追加設定不要

#### PostgreSQL（大規模運用時）
1. Render.comでPostgreSQLインスタンス作成
2. DATABASE_URLを環境変数に設定
3. `backend/src/utils/database.js`でPostgreSQL設定有効化

### 4. カスタムドメイン設定（オプション）
1. Render.comダッシュボードでCustom Domainを追加
2. DNSレコードを設定
3. SSL証明書自動取得

### 5. デプロイ実行
1. GitHubにプッシュ
2. Render.comで自動デプロイ開始
3. ビルドログを確認
4. デプロイ完了後、動作確認

## 🔧 設定チェックリスト

- [ ] GitHubリポジトリ接続
- [ ] ビルドコマンド設定
- [ ] 開始コマンド設定
- [ ] 環境変数設定
- [ ] CORS設定確認
- [ ] セッションシークレット変更
- [ ] カスタムドメイン設定（任意）

## 📱 動作確認項目

### 顧客向け機能
- [ ] `/` アクセスで番号取得画面表示
- [ ] チケット作成（POST /api/tickets）
- [ ] 番号表示とカウントダウン
- [ ] 15分後の自動期限切れ

### 管理者向け機能
- [ ] `/admin.html` アクセスで管理画面表示
- [ ] アクティブチケット一覧表示
- [ ] チケット完了機能
- [ ] システムリセット機能
- [ ] 統計情報表示

### API動作確認
```bash
# ヘルスチェック
curl https://your-app.onrender.com/health

# チケット作成
curl -X POST https://your-app.onrender.com/api/tickets

# 管理者統計
curl https://your-app.onrender.com/api/admin/stats
```

## ⚠️ 注意事項

### Render.com無料プランの制限
- **スリープ機能**: 15分間アクセスがないとスリープ
- **初回アクセス遅延**: スリープからの復帰に30秒程度
- **月間制限**: 750時間/月（約31日分）
- **同時接続**: 制限あり

### 対応策
- 定期的なヘルスチェック（cron job）の設置
- ユーザーへの初回アクセス遅延説明
- 営業時間のみの運用検討

## 🌐 QRコード生成

デプロイ完了後、以下のURLでQRコードを生成：

**顧客向けQRコード**
```
https://your-app-name.onrender.com/
```

**管理者向けQRコード（店舗スタッフ用）**
```
https://your-app-name.onrender.com/admin.html
```

## 📊 モニタリング

### Render.comダッシュボード
- ビルド状況
- デプロイ履歴
- エラーログ
- パフォーマンス指標

### カスタムモニタリング
- ヘルスチェックエンドポイント監視
- レスポンス時間測定
- エラー率追跡

## 🔄 アップデート手順

1. ローカルで変更・テスト
2. `git add .`
3. `git commit -m "変更内容"`
4. `git push origin master`
5. Render.comで自動デプロイ実行
6. デプロイ完了確認

---

### サポート情報
- **開発者**: Happy Chicken Development Team
- **技術サポート**: GitHub Issues
- **緊急時連絡**: 店舗管理者経由