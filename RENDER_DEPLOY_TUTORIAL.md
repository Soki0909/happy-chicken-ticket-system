# 🚀 Happy Chicken整理番号システム - Render.comデプロイチュートリアル

## 📋 目次
1. [事前準備](#事前準備)
2. [Render.comアカウント設定](#rendercomアカウント設定)
3. [GitHubリポジトリ連携](#githubリポジトリ連携)
4. [Web Service作成](#web-service作成)
5. [環境変数設定](#環境変数設定)
6. [デプロイ実行](#デプロイ実行)
7. [動作確認](#動作確認)
8. [トラブルシューティング](#トラブルシューティング)
9. [カスタムドメイン設定](#カスタムドメイン設定)
10. [メンテナンス](#メンテナンス)

---

## 📝 事前準備

### ✅ 必要な環境
- GitHubアカウント
- Render.comアカウント（無料プランで十分）
- プロジェクトがGitHubにプッシュ済み

### 📊 現在のプロジェクト状況確認
```bash
# 最新の変更をプッシュ
git status
git add .
git commit -m "デプロイ前最終確認"
git push origin master
```

---

## 🔐 Render.comアカウント設定

### Step 1: アカウント作成
1. [Render.com](https://render.com)にアクセス
2. **「Get Started for Free」**をクリック
3. GitHubアカウントでサインアップ（推奨）
4. アカウント認証を完了

### Step 2: ダッシュボード確認
- Render.comダッシュボードにアクセス
- 左サイドバーで各種サービスを確認
- **「Web Services」**を選択

---

## 🔗 GitHubリポジトリ連携

### Step 1: リポジトリ接続
1. Render.comダッシュボードで**「+ New」**をクリック
2. **「Web Service」**を選択
3. **「Connect a repository」**セクションで以下を設定：
   - **Repository**: `Soki0909/happy-chicken-ticket-system`
   - **Branch**: `master`

### Step 2: 権限確認
- GitHubで必要な権限を付与
- プライベートリポジトリの場合は追加設定が必要

---

## ⚙️ Web Service作成

### Step 1: 基本設定

| 設定項目 | 設定値 | 説明 |
|---------|--------|------|
| **Name** | `happy-chicken-ticket-system` | サービス名（一意である必要） |
| **Environment** | `Node` | Node.js環境を選択 |
| **Region** | `Singapore` | アジア太平洋地域で最適 |
| **Branch** | `master` | デプロイ対象ブランチ |
| **Root Directory** | *空白* | プロジェクトルートから実行 |

### Step 2: Build & Start設定

#### 🔨 Build Command
```bash
npm install && chmod +x build.sh && ./build.sh
```

**解説**:
- `npm install`: 依存関係のインストール
- `chmod +x build.sh`: ビルドスクリプトに実行権限付与
- `./build.sh`: カスタムビルドプロセス実行

#### 🚀 Start Command
```bash
npm start
```

**解説**:
- package.jsonの`"start": "cd backend && node server.js"`を実行
- 正しいディレクトリ移動とサーバー起動

### Step 3: プラン選択
- **Free Plan**を選択（月750時間利用可能）
- 必要に応じて後からアップグレード可能

---

## 🔧 環境変数設定

### Step 1: 環境変数画面アクセス
1. Web Service詳細画面で**「Environment」**タブをクリック
2. **「Add Environment Variable」**をクリック

### Step 2: 必須環境変数設定

#### 基本設定
```bash
# Node.js環境設定
NODE_ENV=production
PORT=3000

# データベース設定（SQLite使用 - Render.com対応）
DATABASE_URL=sqlite:///tmp/tickets.db

# セッション設定
SESSION_SECRET=happychicken-super-secret-key-change-this-in-production-2024

# アプリケーション設定
TICKET_EXPIRY_MINUTES=15
BRAND_NAME=Happy Chicken

# CORS設定（デプロイ後URLに変更）
CORS_ORIGIN=https://your-app-name.onrender.com
```

#### Happy Chickenブランディング
```bash
BRAND_COLORS_PRIMARY=#fbd205
BRAND_COLORS_SECONDARY=#fe8700
BRAND_COLORS_TEXT=#040404
```

### Step 3: セキュリティ設定
```bash
# セッション有効期限（24時間）
SESSION_MAX_AGE=86400000

# レート制限（SQLite対応）
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30
```

### ⚠️ 重要な注意事項
- **SESSION_SECRET**は必ず変更してください
- **CORS_ORIGIN**はデプロイ後の実際のURLに変更
- 機密情報は絶対にGitHubにコミットしない

### 📊 SQLite運用に関する重要な考慮事項

#### データ永続化の制限
```bash
# 注意: Render.com無料プランでは以下の制約があります
# - サービススリープ時にSQLiteファイルがリセットされる可能性
# - /tmpディレクトリは一時的なストレージ
# - 重要なデータの長期保存には不向き
```

#### 整理番号システムでの影響
- **影響範囲**: スリープ後に番号カウンターがリセット
- **対応策**: 毎日の営業開始時にシステムリセットで運用
- **メリット**: 毎日001から開始で運用が分かりやすい

#### 本格運用時の推奨構成
```bash
# PostgreSQL使用（データ永続化）
DATABASE_URL=postgresql://username:password@hostname:port/database

# または外部SQLiteサービス
DATABASE_URL=sqlite://external-service-url/tickets.db
```

#### 🚨 GitHub Pages対応に関する重要な注意
**GitHub Pagesは静的サイトホスティングのため、Node.jsサーバーは実行できません**
- ❌ サーバーサイド処理不可（Express.js、データベース操作等）
- ❌ API エンドポイント提供不可
- ❌ リアルタイム整理番号発行システムとして機能しない
- ✅ フロントエンド（HTML/CSS/JS）のみホスティング可能

#### GitHub Pages代替案検討
1. **フロントエンドのみデプロイ + 外部API**
   - GitHub Pages: フロントエンド
   - Render.com/Vercel: バックエンドAPI
   - 2つのサービス連携が必要

2. **完全静的版への改造**
   - LocalStorageベースの番号管理
   - サーバー不要だが多端末同期不可
   - 本格的な店舗運用には不適切

---

## 🚀 デプロイ実行

### Step 1: 設定確認
最終確認チェックリスト：
- [ ] Build Command: `npm install && chmod +x build.sh && ./build.sh`
- [ ] Start Command: `npm start`
- [ ] Root Directory: 空白
- [ ] 環境変数: 全て設定済み
- [ ] Branch: master

### Step 2: デプロイ開始
1. **「Create Web Service」**をクリック
2. 自動的にビルドプロセスが開始
3. ログをリアルタイムで確認

### Step 3: ビルドログ監視
```
==> Cloning from https://github.com/Soki0909/happy-chicken-ticket-system
==> Checking out commit in branch master
==> Using Node.js version 25.0.0
==> Running build command...
🐔 Happy Chicken Ticket System - Build Starting...
📦 Installing dependencies...
🗄️ Setting up database...
✅ Database initialized successfully
✅ Build completed successfully!
🚀 Ready for deployment!
==> Build successful 🎉
==> Deploying...
==> Deploy successful 🎉
```

### Step 4: デプロイ完了確認
- **Status**: Live
- **URL**: `https://your-app-name.onrender.com`
- **Last Deploy**: 現在時刻

---

## 🧪 動作確認

### Step 1: ヘルスチェック
```bash
curl https://your-app-name.onrender.com/health
```

**期待される応答**:
```json
{
  "status": "OK",
  "timestamp": "2025-10-16T06:00:00.000Z",
  "service": "Happy Chicken Ticket System",
  "database": {
    "status": "healthy",
    "database": "SQLite"
  }
}
```

### Step 2: 顧客向け機能テスト

#### 🎫 チケット作成テスト
```bash
curl -X POST https://your-app-name.onrender.com/api/tickets \
  -H "Content-Type: application/json"
```

**期待される応答**:
```json
{
  "success": true,
  "message": "整理番号を発行しました",
  "data": {
    "id": 1,
    "ticketNumber": "001",
    "sessionId": "uuid-string",
    "status": "pending",
    "expiresAt": "2025-10-16T06:15:00.000Z",
    "timeRemaining": 900
  }
}
```

#### 🌐 フロントエンド確認
1. ブラウザで`https://your-app-name.onrender.com`にアクセス
2. Happy Chickenロゴと黄色・オレンジのブランディング確認
3. **「整理番号を取得」**ボタンをクリック
4. 番号が表示され、15分のカウントダウン開始を確認

### Step 3: 管理者機能テスト

#### 👨‍💼 管理画面アクセス
1. `https://your-app-name.onrender.com/admin.html`にアクセス
2. 統計情報の表示確認
3. アクティブチケット一覧の表示確認

#### 📊 API動作確認
```bash
# 統計情報取得
curl https://your-app-name.onrender.com/api/admin/stats

# アクティブチケット一覧
curl https://your-app-name.onrender.com/api/admin/tickets
```

---

## 🛠️ トラブルシューティング

### 🔴 よくある問題と解決方法

#### Problem 1: ビルドエラー - モジュールが見つからない
```
Error: Cannot find module 'pg'
```

**解決方法**:
1. package.jsonに必要な依存関係が含まれているか確認
2. 現在のバージョンでは`pg`と`better-sqlite3`両方が必要

#### Problem 2: データベース初期化エラー
```
Database initialization failed
```

**解決方法**:
1. 環境変数`DATABASE_URL`が正しく設定されているか確認
2. SQLite: `sqlite://./data/tickets.db` （推奨）
3. PostgreSQL: `postgresql://username:password@hostname:port/database`
4. SQLiteファイルの書き込み権限確認
5. `/data`ディレクトリが存在することを確認

#### Problem 3: CORS エラー
```
Access-Control-Allow-Origin error
```

**解決方法**:
1. 環境変数`CORS_ORIGIN`を実際のURLに更新
2. `https://your-app-name.onrender.com`

#### Problem 4: セッション管理エラー
```
Session secret required
```

**解決方法**:
1. `SESSION_SECRET`環境変数を設定
2. ランダムで長い文字列を使用

#### Problem 5: SQLite書き込み権限エラー
```
SQLITE_READONLY: attempt to write a readonly database
```

**解決方法**:
1. データベースファイルの書き込み権限確認
2. `/tmp`ディレクトリ使用に変更: `DATABASE_URL=sqlite:///tmp/tickets.db`
3. Render.comで永続化が必要な場合はPostgreSQLを検討

### 🔍 デバッグ方法

#### ログ確認
1. Render.comダッシュボードで**「Logs」**タブをクリック
2. リアルタイムログを監視
3. エラーメッセージを特定

#### 環境変数確認
```bash
# デプロイ後に確認（ログで出力）
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
```

---

## 🌐 カスタムドメイン設定（オプション）

### Step 1: ドメイン準備
- 独自ドメインを取得（例: `happychicken.com`）
- DNS管理画面にアクセス可能

### Step 2: Render.com設定
1. Web Service詳細画面で**「Settings」**タブ
2. **「Custom Domains」**セクション
3. **「+ Add Custom Domain」**をクリック
4. ドメイン名を入力（例: `ticket.happychicken.com`）

### Step 3: DNS設定
```
Type: CNAME
Name: ticket
Value: your-app-name.onrender.com
```

### Step 4: SSL証明書
- Render.comが自動的にLet's Encrypt証明書を発行
- 数分で有効化

### Step 5: 環境変数更新
```bash
CORS_ORIGIN=https://ticket.happychicken.com
```

---

## 🔄 メンテナンス

### 日常メンテナンス

#### 📊 モニタリング
- **Render.comダッシュボード**で以下を定期確認：
  - CPU使用率
  - メモリ使用量
  - レスポンス時間
  - エラー率

#### 🔄 アップデート手順
1. **ローカル開発**
   ```bash
   # 機能追加・修正
   git add .
   git commit -m "機能改善: 新機能追加"
   git push origin master
   ```

2. **自動デプロイ**
   - GitHubプッシュで自動的にデプロイ開始
   - ログを監視して正常完了を確認

3. **動作確認**
   - ヘルスチェック実行
   - 主要機能の動作確認

### 🚨 緊急時対応

#### サービス停止時
1. **Render.comステータス確認**
   - [Render Status Page](https://status.render.com/)を確認
   - プラットフォーム障害の可能性

2. **ログ確認**
   - エラーログを詳細に調査
   - 問題の特定と対応

3. **ロールバック**
   ```
   # 以前のコミットに戻す
   git revert HEAD
   git push origin master
   ```

### 📈 スケーリング

#### 無料プランの制限
- **月間時間**: 750時間（約31日）
- **スリープ**: 15分無活動でスリープ
- **起動時間**: スリープから30秒で復帰
- **SQLite制約**: データは一時的（スリープ時にリセット）

#### SQLiteの制約事項
- **データ永続化**: Render.com無料プランではファイルシステムが一時的
- **推奨対応**: 重要なデータはPostgreSQLの使用を検討
- **代替案**: 外部データベース（PlanetScale、Supabase等）の活用

#### 有料プラン検討タイミング
- 月間アクセス数が増加
- 24時間稼働が必要
- データの永続化が必要
- より高いパフォーマンスが必要

### 🔄 他プラットフォーム比較

#### GitHub Pages vs Render.com
| 項目 | GitHub Pages | Render.com |
|------|-------------|------------|
| **コスト** | 完全無料 | 無料プラン有 |
| **Node.js** | ❌ 不対応 | ✅ 対応 |
| **データベース** | ❌ 不可 | ✅ 可能 |
| **API提供** | ❌ 不可 | ✅ 可能 |
| **整理番号システム** | ⚠️ 制限付き | ✅ 完全対応 |
| **カスタムドメイン** | ✅ 対応 | ✅ 対応 |

#### GitHub Pages適用シナリオ
**現在のシステムをGitHub Pagesで運用するには大幅な改造が必要**
```
🏗️ 必要な改造内容:
1. フロントエンドのみに分離
2. LocalStorage/SessionStorageでの状態管理
3. 外部API連携（Firebase、Supabase等）
4. リアルタイム同期機能の削除
5. 管理画面の簡素化
```

#### 推奨デプロイ戦略
**Happy Chickenシステムの特性上、Render.comが最適**
- ✅ サーバーサイド処理が必要
- ✅ リアルタイム番号発行
- ✅ 管理画面での一元管理
- ✅ 15分有効期限の自動処理

---

## 📞 サポート情報

### 公式リソース
- **Render.com Documentation**: https://render.com/docs
- **Node.js on Render**: https://render.com/docs/node-version
- **Environment Variables**: https://render.com/docs/environment-variables

### Happy Chickenシステム固有
- **GitHub Issues**: https://github.com/Soki0909/happy-chicken-ticket-system/issues
- **技術仕様**: `PROJECT_COMPLETION_REPORT.md`参照
- **API仕様**: 管理画面の「API情報」参照

### 緊急連絡先
- **システム管理者**: GitHub Issues経由
- **店舗運営**: 管理画面の統計情報で状況確認

---

## 🎉 デプロイ完了チェックリスト

### ✅ 最終確認項目
- [ ] ヘルスチェックAPI正常応答
- [ ] 顧客向けページ正常表示
- [ ] 整理番号発行機能動作
- [ ] 15分有効期限機能動作
- [ ] 管理画面アクセス可能
- [ ] チケット完了機能動作
- [ ] システムリセット機能動作
- [ ] ブランディング（黄色・オレンジ）正常表示
- [ ] レスポンシブデザイン動作
- [ ] エラーハンドリング適切

### 🗄️ SQLite運用のベストプラクティス

#### 日次運用フロー
1. **営業開始時**: 管理画面でシステムリセット実行
2. **営業中**: 通常の整理番号発行・管理
3. **営業終了時**: 特別な操作は不要（自動的にクリーンアップ）

#### データバックアップ（オプション）
```bash
# 統計情報の定期取得（手動バックアップ）
curl https://your-app-name.onrender.com/api/admin/stats > daily-stats.json
```

#### システム監視のポイント
- スリープ復帰後の動作確認
- 番号カウンターの正常性
- データベース接続状態

### 🎯 運用開始
Happy Chicken整理番号システムのデプロイが完了しました！

**🔗 顧客向けURL**: `https://your-app-name.onrender.com`
**🔗 管理者向けURL**: `https://your-app-name.onrender.com/admin.html`

QRコードを生成して店舗に設置し、運用を開始してください。

---

**📝 作成日**: 2025年10月16日  
**👨‍💻 作成者**: Happy Chicken Development Team  
**📋 バージョン**: 1.0.0
