# Happy Chicken 整理番号システム 🐔

屋台「Happy Chicken」のための整理番号管理システムです。顧客はQRコードをスキャンして整理番号を取得し、店舗スタッフは管理画面から番号の状態を管理できます。

## 🎯 特徴

- **QRコード対応**: 顧客がスマートフォンで簡単に整理番号を取得
- **リアルタイム管理**: 店舗スタッフが番号の状態をリアルタイムで更新
- **Happy Chickenブランド**: 黄色とオレンジのブランドカラーを活用した親しみやすいUI
- **レスポンシブデザイン**: スマートフォン・タブレット・PCに対応
- **自動期限切れ**: 15分で自動的に番号が無効化

## 🏗️ システム構成

- **フロントエンド**: HTML, CSS, JavaScript (Vanilla)
- **バックエンド**: Node.js + Express
- **データベース**: PostgreSQL
- **デプロイ**: Render.com

## 🚀 セットアップ

### 前提条件

- Node.js (v18以上)
- PostgreSQL
- Git

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd happy_chicken
```

2. バックエンドの依存関係をインストール
```bash
cd backend
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

4. データベースを初期化
```bash
# PostgreSQLでデータベースを作成
createdb happy_chicken_tickets

# マイグレーションを実行
npm run migrate
```

5. 開発サーバーを起動
```bash
npm run dev
```

## 📁 プロジェクト構造

```
happy_chicken/
├── backend/                 # バックエンドAPI
│   ├── src/
│   │   ├── routes/          # APIルート
│   │   ├── models/          # データモデル
│   │   ├── middleware/      # ミドルウェア
│   │   └── utils/          # ユーティリティ
│   ├── migrations/         # データベースマイグレーション
│   └── package.json
├── frontend/               # フロントエンド
│   ├── public/
│   │   ├── styles/         # CSSファイル
│   │   └── scripts/        # JavaScriptファイル
│   └── assets/            # 画像・フォント
├── docs/                  # ドキュメント
└── requirements.md        # 要件定義書
```

## 🎨 ブランドカラー

- **メインイエロー**: #fbd205
- **アクセントオレンジ**: #fe8700  
- **テキストブラック**: #040404

## 📱 使用方法

### 顧客側
1. 店舗に掲示されたQRコードをスキャン
2. 自動的に整理番号が表示される
3. 番号が呼ばれるまで待機

### 店舗側
1. 管理画面にアクセス (`/admin_happychicken123`)
2. 整理番号一覧を確認
3. 商品準備完了時に「済」ボタンをクリック

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# 本番ビルド
npm start
```

## 📄 ライセンス

MIT License

## 🤝 貢献

プルリクエストやイシューの作成を歓迎します。

---

Made with ❤️ for Happy Chicken 🐔