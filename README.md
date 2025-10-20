

# Happy Chicken 整理番号システム 🐔

---

![技術スタックバッジ](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express-000000?logo=express&logoColor=white](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![SQLite-003B57?logo=sqlite&logoColor=white](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![HTML5-E34F26?logo=html5&logoColor=white](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3-1572B6?logo=css3&logoColor=white](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript-F7DF1E?logo=javascript&logoColor=black](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![PWA-5A0FC8?logo=pwa&logoColor=white](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)
![Render.com-46A2F1?logo=render&logoColor=white](https://img.shields.io/badge/Render.com-46A2F1?logo=render&logoColor=white)

---

> 本システムは、AIエージェント（GitHub Copilot）を活用し、約半日で設計・実装・デプロイまで完了しました。
> 2025年10月、工大祭屋外企画の現場ニーズに即応した短期開発事例です。

このシステムは「2025年度工大祭」屋外企画（Happy Chicken屋台）用に作成されました。
顧客はQRコードをスキャンして整理番号を取得し、店舗スタッフは管理画面から番号の状態を管理できます。

## 🌐 サイトURL

- 整理番号発券ページ: [https://happy-chicken-ticket-system.onrender.com/](https://happy-chicken-ticket-system.onrender.com/)
- 管理者画面: [https://happy-chicken-ticket-system.onrender.com/admin.html](https://happy-chicken-ticket-system.onrender.com/admin.html)

## 🖼️ 画面イメージ

<img src="docs/images/happy-chicken-ticket-system.onrender.com_(iPhone%2012%20Pro).png" alt="発券画面（スマホ表示例）" height="320" />
<img src="docs/images/happy-chicken-ticket-system.onrender.com_admin.html(iPad%20Air).png" alt="管理者画面（iPad表示例）" height="320" />

## 🎯 特徴

- **QRコード対応**: 顧客がスマートフォンで簡単に整理番号を取得
- **リアルタイム管理**: 店舗スタッフが番号の状態をリアルタイムで更新
- **Happy Chickenブランド**: 黄色とオレンジのブランドカラーを活用した親しみやすいUI
- **レスポンシブデザイン**: スマートフォン・タブレット・PCに対応
- **自動期限切れ**: 15分で自動的に番号が無効化


## 🏗️ システム構成・使用技術

- **フロントエンド**: HTML, CSS, JavaScript (Vanilla)
- **バックエンド**: Node.js + Express
- **データベース**: SQLite（Render.com無料プラン運用時）
- **デプロイ**: Render.com（PaaS）
- **PWA対応**: manifest.jsonによるホーム画面追加・オフライン対応

## 🚀 セットアップ

### 前提条件

- Node.js (v18以上)
- PostgreSQL
- Git


### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd happy-chicken-ticket-system
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

4. データベースを初期化（SQLiteの場合は自動生成、PostgreSQLの場合はcreatedbコマンド）
```bash
# SQLiteはRender.com上で自動生成
# PostgreSQLの場合
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