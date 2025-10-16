# Webアプリ「Happy Chicken 整理番号システム」要件定義書（改訂版）

## 1. 概要 📝

本システムは、屋台「Happy Chicken」における注文受付・商品受け渡しのプロセスを効率化するためのWebアプリケーションです。顧客は店舗に設置されたQRコードを読み取るだけで、自身のスマートフォンに一意の整理番号を表示できます。店舗側は専用の管理画面からリアルタイムで番号の状況を更新し、商品の受け渡しをスムーズに行うことを目的とします。

**対象店舗**: Happy Chicken（屋台）  
**ブランドカラー**: 黄色（#fbd205）、オレンジ（#fe8700）、黒（#040404）

## 2. プロジェクトの目的とゴール 🎯

### 目的
- 紙の整理券を撤廃し、**コスト削減**と**環境負荷の軽減**を実現する。
- 顧客の待ち時間を可視化し、**行列や混雑によるストレスを緩和**する。
- 店舗スタッフの**口頭での呼び出し業務を削減**し、オペレーションを効率化する。

### ゴール
- 顧客がQRコードをスキャンしてから **5秒以内** に整理番号を取得できる。
- 店舗スタッフが **2クリック以内** で番号のステータスを「提供済み」に変更できる。
- Render.comの無料プランの範囲内で安定して稼働する。

## 3. システム構成案 ⚙️

### フロントエンド
- **技術スタック:** HTML, CSS, JavaScript (フレームワークは不要、または軽量なVue.js/Reactも可)
- **役割:** 顧客向けの番号表示画面と、店舗向けの管理画面のUIを構築。

### バックエンド
- **技術スタック:** Node.js (Express), Python (Flask / FastAPI) など軽量なフレームワークを推奨。
- **役割:** 番号の発行、ステータス管理、有効期限の処理などを行うAPIサーバー。

### データベース
- **技術スタック:** Render.comの無料プランで利用可能な **PostgreSQL**。
- **役割:** 発行した整理番号、ステータス、発行時刻などの情報を永続的に保存。

### デプロイ環境
- **プラットフォーム:** **Render.com**
- **構成:** フロントエンドを「Static Site」、バックエンドを「Web Service」、データベースを「PostgreSQL」としてデプロイする。

## 4. 機能要件

### 4.1. 利用者（顧客）側機能

| 機能名 | 詳細 |
|--------|-------|
| **整理番号の取得** | ・店舗に掲示されたQRコードをスマートフォンで読み込むと、専用のURLにアクセスする。<br>・初回アクセス時に、システムは**一意で連続した整理番号**（例: 001, 002, ...）を自動で発行する。<br>・番号はセッション情報やCookieに保存し、ユーザーがページをリロードしても同じ番号が表示されるようにする。 |
| **整理番号の表示** | ・画面中央に取得した整理番号を**大きく、見やすいフォント**で表示する。 |
| **番号の有効期限** | ・整理番号は発行から**15分**で自動的に無効（破棄）となる。<br>・無効になった場合、画面に「有効期限が切れました。再度QRコードを読み込んでください」といったメッセージを表示する。 |

### 4.2. 管理者（店舗）側機能

| 機能名 | 詳細 |
|--------|-------|
| **管理画面へのアクセス** | ・`/admin` など、**特定のURL**にアクセスすることで管理画面を開くことができる。<br>・（初期実装では）パスワード認証は不要とし、URLを知っている人だけがアクセスできる仕様とする。 |
| **整理番号一覧の表示** | ・現在有効な（提供済み・有効期限切れでない）整理番号を一覧で表示する。<br>・番号は発行された順（昇順）に並べる。<br>・各番号の横にステータスを変更するためのボタンを設置する。 |
| **ステータスの更新** | ・一覧に表示された各番号の横に**「済」ボタン**を設置する。<br>・「済」ボタンを押すと、その番号のステータスが「提供済み (Completed)」に更新される。<br>・「提供済み」になった番号は、自動的に一覧から非表示になるか、グレーアウトされる。 |
| **番号のリセット** | ・（任意機能）営業開始時などを想定し、発行番号を「001」にリセットできる**「リセットボタン」**を管理画面に設置する。 |

## 5. 非機能要件

| 項目 | 要件 |
|------|------|
| **パフォーマンス** | ・ユーザーのアクセスから番号表示まで、**3秒以内**を目標とする。<br>・管理画面のステータス更新が**1秒以内**に反映されること。 |
| **ユーザビリティ** | ・誰でも直感的に操作できるシンプルなUIとする。<br>・屋外の明るい場所でも視認しやすいよう、高いコントラストの配色を採用する。 |
| **セキュリティ** | ・管理画面のURLは、容易に推測できない文字列にすること（例: `/admin_abcdef123`）。<br>・個人情報は一切収集しない。 |
| **可用性** | ・Render.comの無料プランの仕様（スリープなど）を考慮し、初回アクセス時に多少の遅延が発生する可能性があることを許容する。 |

## 6. 開発スコープ

### 6.1. 今回の開発範囲（In Scope）
- 上記「4. 機能要件」に記載された全ての機能。
- Render.comへのデプロイ手順の確立。

### 6.2. 今回の開発範囲外（Out Scope）
- プッシュ通知による呼び出し機能。
- 複数店舗に対応する機能。
- 売上や来客数を集計・分析する機能。
- 厳密な管理者ログイン認証機能。

## 7. 今後の拡張案 🚀

- **呼び出し通知機能:** 管理画面で番号を「準備完了」にすると、利用者のスマートフォンに音やバイブレーションで通知を送る。
- **待ち時間表示:** Happy Chickenの平均的な調理時間（チキン料理）から、おおよその待ち時間を計算して表示する。
- **多言語対応:** インバウンド顧客向けに、英語などの表示切り替え機能を追加する。
- **メニュー連携:** Happy Chickenのメニュー（フライドチキン、チキン南蛮など）を番号と紐づけて管理画面に表示する。
- **顧客満足度調査:** 商品受け取り後の簡単な評価機能（星評価）を追加。
- **売上分析:** Happy Chickenの日別・時間別の来客数と売上の簡単な分析機能。

## 8. データベース設計案

### tickets テーブル
| 列名 | データ型 | 制約 | 説明 |
|------|----------|-------|------|
| id | INTEGER | PRIMARY KEY | システム内部ID |
| ticket_number | INTEGER | NOT NULL, UNIQUE | 表示される整理番号 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | ステータス（pending/completed/expired） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 発行日時 |
| session_id | VARCHAR(255) | NOT NULL | セッション識別子 |

## 9. API設計案

### エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/` | 顧客向け番号表示画面 |
| POST | `/api/tickets` | 新規整理番号発行 |
| GET | `/api/tickets/:sessionId` | セッションIDに基づく番号取得 |
| GET | `/admin` | 管理画面 |
| GET | `/api/admin/tickets` | 有効な番号一覧取得 |
| PUT | `/api/admin/tickets/:id/complete` | 番号のステータスを完了に更新 |
| POST | `/api/admin/reset` | 番号のリセット |

## 10. UI/UX設計方針

### 顧客向け画面
- **ブランディング**: Happy Chickenロゴ・店舗名を上部に表示
- **カラースキーム**: 
  - 背景色: 白（#ffffff）
  - メインアクセント: 黄色（#fbd205）
  - サブアクセント: オレンジ（#fe8700）
  - テキスト: 黒（#040404）
- **レイアウト**: 整理番号を画面中央に大きく表示（フォントサイズ: 64px以上）
- **UI要素**: 有効期限までの残り時間をプログレスバーで視覚化
- **レスポンシブデザイン**: スマートフォンに最適化（320px-768px対応）

### 管理画面
- **ブランディング**: Happy Chickenの管理画面であることを明示
- **カラースキーム**: 
  - ヘッダー背景: 黄色（#fbd205）
  - アクションボタン: オレンジ（#fe8700）
  - テキスト: 黒（#040404）
  - テーブル背景: 白ベース
- **レイアウト**: 整理番号を一覧表示（カード形式またはテーブル形式）
- **UI要素**: 
  - 各番号に対して「完了」ボタンを配置（オレンジ色）
  - リセットボタンは警告色として赤系を使用
  - 操作しやすいボタンサイズ（最小44px×44px）
- **機能**: リアルタイムで更新される情報表示

## 11. 画面遷移図・シーケンス図

### 11.1. 画面遷移図

```mermaid
flowchart TD
    A[QRコード読み取り] --> B{初回アクセス?}
    B -->|Yes| C[新規整理番号発行]
    B -->|No| D[既存番号表示]
    C --> E[整理番号表示画面]
    D --> E
    E --> F{有効期限チェック}
    F -->|有効| G[番号表示継続]
    F -->|期限切れ| H[期限切れメッセージ]
    H --> I[再取得を促す]
    I --> A
    G --> J{ページリロード}
    J -->|Yes| F
    J -->|No| G
    
    K[管理画面URL直接アクセス] --> L[管理画面ログイン]
    L --> M[整理番号一覧表示]
    M --> N{操作選択}
    N -->|完了ボタン押下| O[番号ステータス更新]
    N -->|リセットボタン押下| P[全番号リセット確認]
    N -->|画面更新| Q[最新一覧取得]
    O --> M
    P --> R{確認}
    R -->|Yes| S[番号カウンターリセット]
    R -->|No| M
    S --> M
    Q --> M
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style M fill:#fff3e0
    style H fill:#ffebee
```

### 11.2. 顧客側シーケンス図

```mermaid
sequenceDiagram
    participant U as 顧客 (スマートフォン)
    participant F as フロントエンド
    participant B as バックエンドAPI
    participant D as データベース
    
    Note over U,D: 整理番号取得フロー
    
    U->>F: QRコード読み取り (GET /)
    F->>F: セッション情報確認
    
    alt 初回アクセス (セッション情報なし)
        F->>B: 新規番号発行 (POST /api/tickets)
        B->>D: 新規レコード作成
        D-->>B: ticket_id, ticket_number返却
        B-->>F: 整理番号データ返却
        F->>F: セッション情報保存
        F-->>U: 整理番号表示 (001)
    else 既存セッション
        F->>B: 既存番号取得 (GET /api/tickets/:sessionId)
        B->>D: セッションIDで検索
        
        alt 有効な番号が存在
            D-->>B: 番号データ返却
            B-->>F: 整理番号データ返却
            F-->>U: 既存番号表示
        else 番号が期限切れまたは完了済み
            B-->>F: エラー応答 (期限切れ)
            F->>F: セッション情報クリア
            F-->>U: 期限切れメッセージ表示
        end
    end
    
    Note over U,D: 有効期限チェック (15分間隔)
    
    loop 定期チェック
        F->>B: 番号有効性確認 (GET /api/tickets/:sessionId)
        B->>D: ステータス・有効期限確認
        
        alt 番号が有効
            D-->>B: 有効データ返却
            B-->>F: 正常応答
            F-->>U: 番号表示継続
        else 番号が無効
            D-->>B: 無効データ返却
            B-->>F: 無効応答
            F->>F: セッション情報クリア
            F-->>U: 期限切れメッセージ表示
        end
    end
```

### 11.3. 管理者側シーケンス図

```mermaid
sequenceDiagram
    participant A as 管理者 (PC/タブレット)
    participant F as フロントエンド (管理画面)
    participant B as バックエンドAPI
    participant D as データベース
    
    Note over A,D: 管理画面アクセス・一覧表示
    
    A->>F: 管理画面アクセス (GET /admin)
    F->>B: 有効番号一覧取得 (GET /api/admin/tickets)
    B->>D: 有効な番号を検索 (status='pending' AND created_at > 15分前)
    D-->>B: 番号リスト返却
    B-->>F: 整理番号一覧データ返却
    F-->>A: 管理画面表示 (番号一覧)
    
    Note over A,D: 番号完了処理
    
    A->>F: 「済」ボタンクリック
    F->>B: 番号完了更新 (PUT /api/admin/tickets/:id/complete)
    B->>D: ステータス更新 (status='completed')
    D-->>B: 更新完了通知
    B-->>F: 更新成功応答
    F->>B: 最新一覧取得 (GET /api/admin/tickets)
    B->>D: 有効な番号を再検索
    D-->>B: 更新された番号リスト返却
    B-->>F: 最新データ返却
    F-->>A: 画面更新 (完了した番号を非表示)
    
    Note over A,D: 番号リセット処理
    
    A->>F: 「リセット」ボタンクリック
    F-->>A: 確認ダイアログ表示
    A->>F: リセット確認
    F->>B: 全番号リセット (POST /api/admin/reset)
    B->>D: 全レコード削除 OR ステータス一括更新
    B->>D: カウンター初期化
    D-->>B: リセット完了通知
    B-->>F: リセット成功応答
    F->>B: 一覧再取得 (GET /api/admin/tickets)
    B->>D: 番号検索 (結果: 空)
    D-->>B: 空のリスト返却
    B-->>F: 空のデータ返却
    F-->>A: 空の管理画面表示
    
    Note over A,D: リアルタイム更新 (ポーリング)
    
    loop 5秒間隔
        F->>B: 一覧更新確認 (GET /api/admin/tickets)
        B->>D: 有効な番号を検索
        D-->>B: 最新の番号リスト返却
        B-->>F: データ返却
        F->>F: 前回データと比較
        
        alt データに変更あり
            F-->>A: 画面自動更新
        else 変更なし
            Note over F: 画面更新なし
        end
    end
```

### 11.4. システム全体のデータフロー図

```mermaid
flowchart LR
    subgraph "顧客側"
        QR[QRコード] --> SP[スマートフォン]
        SP --> CU[顧客用画面]
    end
    
    subgraph "管理者側"
        PC[PC/タブレット] --> AU[管理画面]
    end
    
    subgraph "システム基盤"
        direction TB
        FE[フロントエンド<br/>HTML/CSS/JS]
        BE[バックエンドAPI<br/>Node.js/Express]
        DB[(PostgreSQL<br/>Database)]
        
        FE <--> BE
        BE <--> DB
    end
    
    subgraph "Render.com"
        direction TB
        SS[Static Site<br/>フロントエンド]
        WS[Web Service<br/>バックエンド]
        PG[(PostgreSQL<br/>データベース)]
        
        SS <--> WS
        WS <--> PG
    end
    
    CU <--> FE
    AU <--> FE
    FE -.-> SS
    BE -.-> WS
    DB -.-> PG
    
    style QR fill:#e8f5e8
    style CU fill:#f3e5f5
    style AU fill:#fff3e0
    style DB fill:#e3f2fd
    style PG fill:#e3f2fd
```

### 11.5. エラーハンドリングフロー図

```mermaid
flowchart TD
    A[ユーザーアクション] --> B{API呼び出し}
    B --> C{レスポンス確認}
    
    C -->|200 OK| D[正常処理]
    C -->|404 Not Found| E[番号不存在エラー]
    C -->|400 Bad Request| F[リクエストエラー]
    C -->|500 Server Error| G[サーバーエラー]
    C -->|タイムアウト| H[接続エラー]
    
    E --> I[期限切れメッセージ表示]
    F --> J[入力内容確認を促す]
    G --> K[サーバー障害メッセージ]
    H --> L[接続再試行ボタン]
    
    I --> M[QRコード再読み取りを促す]
    J --> N[操作やり直しを促す]
    K --> O[しばらく待って再試行]
    L --> P[再接続処理]
    
    D --> Q[成功画面表示]
    M --> A
    N --> A
    O --> A
    P --> B
    
    style E fill:#ffebee
    style F fill:#fff3e0
    style G fill:#ffebee
    style H fill:#fff3e0
    style D fill:#e8f5e8
```

## 12. 開発工程

### フェーズ1: 基本機能実装
1. データベース設計・構築
2. バックエンドAPI開発
3. 顧客向けフロントエンド開発
4. 管理画面フロントエンド開発

### フェーズ2: デプロイ・テスト
1. Render.comへのデプロイ設定
2. 統合テスト・動作確認
3. パフォーマンス調整

### フェーズ3: 運用準備
1. QRコード生成・印刷用テンプレート作成
2. 運用マニュアル作成
3. 本番環境での最終確認

## 13. 詳細実装計画

### 13.1. 開発環境・ツール構成

#### 必要なツール・ライブラリ
- **Node.js** (v18以上推奨)
- **npm** または **yarn**
- **PostgreSQL** (ローカル開発用)
- **Git** (バージョン管理)
- **VS Code** (推奨エディタ)

#### バックエンド依存関係
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.8.0",
    "cors": "^2.8.5",
    "express-session": "^1.17.3",
    "uuid": "^9.0.0",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

#### フロントエンド構成
- **HTML5** (セマンティックマークアップ)
- **CSS3** (Flexbox, Grid, メディアクエリ、CSS変数でHappy Chickenカラー管理)
- **Vanilla JavaScript** (ES6+)
- **Fetch API** (Ajax通信)
- **カスタムCSS変数**:
  ```css
  :root {
    --happy-yellow: #fbd205;
    --happy-orange: #fe8700;
    --happy-black: #040404;
    --happy-white: #ffffff;
  }
  ```

### 13.2. プロジェクト構造

```
happy-chicken-ticket-system/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── tickets.js
│   │   │   └── admin.js
│   │   ├── models/
│   │   │   └── ticket.js
│   │   ├── middleware/
│   │   │   ├── session.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   └── database.js
│   │   └── app.js
│   ├── migrations/
│   │   └── 001_create_tickets_table.sql
│   ├── package.json
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── admin.html
│   │   ├── styles/
│   │   │   ├── variables.css (Happy Chickenカラー定義)
│   │   │   ├── main.css
│   │   │   └── admin.css
│   │   └── scripts/
│   │       ├── main.js
│   │       └── admin.js
│   └── assets/
│       ├── images/
│       │   ├── happy-chicken-logo.svg
│       │   └── chicken-icon.svg
│       └── fonts/ (必要に応じて)
├── docs/
│   ├── api.md
│   ├── deployment.md
│   └── user-manual.md
└── README.md
```

### 13.3. 実装優先順位とマイルストーン

#### マイルストーン1: 基盤構築 (Week 1)
1. **プロジェクト初期設定** (Day 1)
   - Git リポジトリ作成
   - フォルダ構造作成
   - package.json 設定
   - 開発環境構築

2. **データベース設計・構築** (Day 2)
   - PostgreSQL テーブル設計
   - マイグレーションスクリプト作成
   - 開発用データベース初期化

3. **バックエンドAPI基盤構築** (Day 3-4)
   - Express サーバー設定
   - データベース接続設定
   - 基本ルーティング設定
   - ミドルウェア設定

#### マイルストーン2: コア機能実装 (Week 2)
4. **整理番号発行API実装** (Day 5-6)
   - POST /api/tickets エンドポイント
   - セッション管理機能
   - 番号生成ロジック

5. **番号取得・状態確認API実装** (Day 7-8)
   - GET /api/tickets/:sessionId エンドポイント
   - 有効期限チェック機能
   - ステータス管理

6. **管理者向けAPI実装** (Day 9-10)
   - 番号一覧取得API
   - ステータス更新API
   - リセット機能API

#### マイルストーン3: UI実装 (Week 3)
7. **顧客向けフロントエンド実装** (Day 11-13)
   - レスポンシブな番号表示画面
   - セッション管理
   - 自動更新機能

8. **管理画面フロントエンド実装** (Day 14-16)
   - 番号一覧表示
   - 操作ボタン実装
   - リアルタイム更新

#### マイルストーン4: テスト・デプロイ (Week 4)
9. **ローカル統合テスト** (Day 17-18)
   - 全機能テスト
   - エラーハンドリング確認
   - パフォーマンステスト

10. **Render.com環境準備** (Day 19)
    - アカウント設定
    - PostgreSQL インスタンス作成
    - 環境変数設定

11. **本番デプロイ・動作確認** (Day 20-21)
    - デプロイ実行
    - 全機能動作確認
    - パフォーマンス調整

### 13.4. 技術仕様詳細

#### データベーススキーマ詳細
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number INTEGER NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_tickets_session_id ON tickets(session_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_expires_at ON tickets(expires_at);

-- 番号カウンター管理テーブル
CREATE TABLE ticket_counter (
    id INTEGER PRIMARY KEY DEFAULT 1,
    current_number INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO ticket_counter (current_number) VALUES (0);
```

#### API仕様詳細

**POST /api/tickets**
```javascript
// Request
{
  // Body は空
}

// Response (Success)
{
  "success": true,
  "data": {
    "id": 123,
    "ticketNumber": "001",
    "sessionId": "uuid-string",
    "expiresAt": "2024-10-16T15:30:00Z",
    "status": "pending"
  }
}

// Response (Error)
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**GET /api/tickets/:sessionId**
```javascript
// Response (Success)
{
  "success": true,
  "data": {
    "ticketNumber": "001",
    "status": "pending",
    "expiresAt": "2024-10-16T15:30:00Z",
    "timeRemaining": 847 // seconds
  }
}

// Response (Expired/Not Found)
{
  "success": false,
  "error": "Ticket expired or not found",
  "code": "TICKET_EXPIRED"
}
```

#### フロントエンド仕様詳細

**顧客向け画面 (index.html)**
- **ブランディング**: Happy Chickenロゴ・名称を上部に配置
- **レスポンシブデザイン**: 320px-768px対応
- **フォントサイズ**: 番号表示 72px、店舗名 24px、サブテキスト 16px
- **Happy Chickenカラースキーム**: 
  - 背景: #ffffff
  - ヘッダー背景: #fbd205（黄色）
  - 番号表示背景: #fe8700（オレンジ）のグラデーション
  - メインテキスト: #040404（黒）
  - 残り時間バー: #fbd205 → #fe8700のグラデーション
  - エラー表示: #dc3545
- **アニメーション**: 番号表示時のフェードイン効果、残り時間の滑らかな減少アニメーション
- **アイコン**: 鶏肉モチーフのシンプルなアイコンを配置

**管理画面 (admin.html)**
- **ブランディング**: Happy Chicken管理画面として明確に識別
- **レイアウト**: カード形式またはモダンなテーブルデザイン
- **Happy Chickenカラースキーム**:
  - ヘッダー: #fbd205（黄色）背景に#040404（黒）テキスト
  - 完了ボタン: #fe8700（オレンジ）背景に白テキスト
  - リセットボタン: #dc3545（赤）背景に白テキスト
  - カード背景: 白ベース、#fbd205のボーダー
- **ボタンサイズ**: 最小44px×44px（タッチ操作対応）
- **自動更新**: 5秒間隔でポーリング
- **確認ダイアログ**: Happy Chickenブランドカラーを使用した二段階確認
- **アイコン**: 状態表示用のシンプルなアイコン（チェックマーク、時計など）

### 13.5. エラーハンドリング戦略

#### クライアントサイドエラー処理
```javascript
// 共通エラーハンドリング関数
function handleApiError(error, context) {
    console.error(`API Error in ${context}:`, error);
    
    if (error.code === 'TICKET_EXPIRED') {
        showExpiredMessage();
        clearSession();
    } else if (error.code === 'NETWORK_ERROR') {
        showRetryButton();
    } else {
        showGenericError(error.message);
    }
}
```

#### サーバーサイドエラー処理
```javascript
// グローバルエラーハンドラー
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
        res.status(503).json({
            success: false,
            error: 'Database connection failed',
            code: 'DB_CONNECTION_ERROR'
        });
    } else {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    }
});
```

### 13.6. パフォーマンス最適化計画

#### データベース最適化
- **インデックス**: セッションID、ステータス、有効期限にインデックス作成
- **クリーンアップ**: 期限切れレコードの定期削除（cron job）
- **コネクションプール**: 最大10接続での効率的なDB接続管理

#### フロントエンド最適化
- **キャッシュ戦略**: 静的リソースに適切なCache-Controlヘッダー設定
- **圧縮**: gzip圧縮によるファイルサイズ削減
- **遅延読み込み**: 必要に応じた非同期リソース読み込み

### 13.7. セキュリティ対策

#### 認証・認可
- **管理画面**: URLベース認証（推測困難なパス使用）
- **セッション管理**: HTTPOnly、Secure、SameSite属性設定
- **CSRF対策**: トークンベースの防御機能

#### データ保護
- **個人情報**: 一切収集しない設計
- **セッションデータ**: 最小限の情報のみ保存
- **ログ管理**: 個人識別情報を含まないログ出力

### 13.8. テスト戦略

#### 単体テスト (Jest)
```javascript
// API エンドポイントテスト例
describe('POST /api/tickets', () => {
    test('should create new ticket', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.ticketNumber).toMatch(/^\d{3}$/);
    });
});
```

#### 統合テスト
- **API連携テスト**: フロントエンド↔バックエンド通信確認
- **データベーステスト**: CRUD操作の正常動作確認
- **セッション管理テスト**: セッション有効期限管理確認

#### E2Eテスト（手動）
1. QRコード読み取り → 番号表示フロー
2. 管理画面での番号完了処理フロー
3. 有効期限切れ処理フロー
4. リセット機能フロー

### 13.9. デプロイ自動化

#### GitHub Actions設定例
```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Render webhook trigger
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

#### 環境変数管理
```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/happy_chicken_tickets
SESSION_SECRET=your-secret-key-here
NODE_ENV=production
PORT=3000
ADMIN_PATH_SECRET=happychicken123
BRAND_NAME=Happy Chicken
BRAND_COLORS_PRIMARY=#fbd205
BRAND_COLORS_SECONDARY=#fe8700
BRAND_COLORS_TEXT=#040404
```