# 外部仕様書

**プロジェクト名:** JSTQB AL-TM 学習支援アプリ  
**バージョン:** 1.0.0  
**作成日:** 2026-04-12  
**最終更新日:** 2026-04-12

---

## 1. システム概要

### 1.1 システム構成

```
[ブラウザ (React + Vite)]
        ↕ HTTP (REST API)
[バックエンド (Node.js + Express)]
        ↕
[データベース (SQLite)]
```

| レイヤー | 技術スタック |
|----------|-------------|
| フロントエンド | React 18 / TypeScript / Vite / Tailwind CSS / React Router v6 |
| バックエンド | Node.js / Express / TypeScript / ts-node |
| データベース | SQLite (better-sqlite3) |

### 1.2 動作環境

- OS: Windows 11
- Node.js: v24 以上
- ブラウザ: Chrome / Edge 最新版
- フロントエンド開発サーバーポート: 5173
- バックエンドポート: 3001

---

## 2. 画面一覧

| 画面ID | 画面名 | URL | 説明 |
|--------|--------|-----|------|
| SCR-01 | ホーム | `/` | 分野選択・学習開始 |
| SCR-02 | クイズ | `/quiz` | 問題出題・回答 |
| SCR-03 | セッション結果 | `/results` | セッションの採点結果 |
| SCR-04 | 統計 | `/stats` | 学習進捗・正答率ダッシュボード |

---

## 3. 画面仕様

### 3.1 SCR-01 ホーム画面

**概要:** 学習する分野・モードを選択してクイズを開始する。

**表示要素:**
- アプリタイトル・説明
- 「全分野ランダム」開始ボタン
- 分野カード一覧（7分野）
  - 分野名
  - 登録問題数
  - 正答率（回答履歴がない場合は「未挑戦」）
- 統計ページへのリンク

**操作フロー:**
1. 分野カードをクリック → クイズ画面（その分野の問題）へ遷移
2. 「全分野ランダム」をクリック → クイズ画面（全問題）へ遷移

**クイズ開始時のオプション（将来拡張）:**
- 出題数の選択
- 難易度フィルター
- 未回答のみ / 間違えた問題のみ

---

### 3.2 SCR-02 クイズ画面

**概要:** 問題を1問ずつ表示し、回答・フィードバック・解説を行う。

**表示要素（回答前）:**
- 進捗バー（例: 3 / 10）
- 問題番号・分野名
- 難易度バッジ（易 / 普通 / 難）
- 問題文
- 選択肢ボタン × 4（A〜D）
- 「回答する」ボタン（選択前は非活性）

**表示要素（回答後）:**
- 正解 / 不正解バナー
- 正解の選択肢をハイライト（緑）
- 選択した誤答をハイライト（赤）※不正解の場合のみ
- 解説テキスト
- 「次の問題へ」ボタン（最終問題では「結果を見る」）

**操作フロー:**
1. 選択肢を1つクリックして選択状態にする
2. 「回答する」をクリックすると採点・フィードバック表示
3. 「次の問題へ」をクリックして次の問題に進む
4. 全問題終了後、セッション結果画面へ遷移

---

### 3.3 SCR-03 セッション結果画面

**概要:** クイズセッションの採点結果をまとめて表示する。

**表示要素:**
- 正解数 / 総問題数（例: 7 / 10）
- 正答率（%）と評価コメント
- 問題ごとの正誤一覧
  - 問題番号・問題文（先頭30文字）
  - 正解 / 不正解アイコン
- 「もう一度（同じ条件）」ボタン
- 「ホームへ戻る」ボタン

---

### 3.4 SCR-04 統計画面

**概要:** これまでの学習進捗を分野別・全体で可視化する。

**表示要素:**
- サマリーカード
  - 総回答数
  - 全体正答率
  - 挑戦済み分野数
- 分野別正答率バー
  - 分野名
  - 正答率（%）とプログレスバー
  - 回答数 / 問題数
- 最近の回答履歴（最新20件）
  - 日時・問題文・正誤

**操作フロー:**
- 「ホームへ戻る」ボタンでホーム画面へ遷移

---

## 4. API仕様

ベースURL: `http://localhost:3001/api`

### 4.1 分野

#### GET `/api/domains`
分野一覧を取得する。

**レスポンス:**
```json
[
  {
    "id": 1,
    "name": "テストプロセス",
    "description": "テストの計画・監視...",
    "question_count": 6,
    "answered_count": 4,
    "correct_count": 3
  }
]
```

---

### 4.2 問題

#### GET `/api/questions`
問題一覧を取得する。

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| domain_id | number | - | 分野IDで絞り込み |
| difficulty | number | - | 難易度で絞り込み（1/2/3） |
| limit | number | - | 取得件数（デフォルト: 10） |
| filter | string | - | `unanswered` / `wrong` で絞り込み |

**レスポンス:**
```json
[
  {
    "id": 1,
    "domain_id": 1,
    "domain_name": "テストプロセス",
    "text": "テスト計画で定義すべき内容として...",
    "difficulty": 2
  }
]
```

#### GET `/api/questions/:id`
問題詳細（選択肢・解説付き）を取得する。

**レスポンス:**
```json
{
  "id": 1,
  "domain_id": 1,
  "domain_name": "テストプロセス",
  "text": "テスト計画で定義すべき内容として...",
  "difficulty": 2,
  "choices": [
    { "id": 1, "text": "テストのスコープ、アプローチ...", "order_num": 1 },
    { "id": 2, "text": "詳細なテストケースの手順", "order_num": 2 },
    { "id": 3, "text": "すべての欠陥の修正計画", "order_num": 3 },
    { "id": 4, "text": "開発チームの作業計画", "order_num": 4 }
  ],
  "explanation": "テスト計画では、テストのスコープ..."
}
```

> 注意: `is_correct` はレスポンスに含めない（カンニング防止）

---

### 4.3 回答

#### POST `/api/answers`
回答を送信し、正誤判定結果を取得する。

**リクエストボディ:**
```json
{
  "question_id": 1,
  "choice_id": 2
}
```

**レスポンス:**
```json
{
  "is_correct": false,
  "correct_choice_id": 1,
  "explanation": "テスト計画では、テストのスコープ..."
}
```

---

### 4.4 統計

#### GET `/api/stats`
全体の学習統計を取得する。

**レスポンス:**
```json
{
  "total_answered": 42,
  "total_correct": 30,
  "accuracy_rate": 71.4,
  "domain_stats": [
    {
      "domain_id": 1,
      "domain_name": "テストプロセス",
      "answered": 8,
      "correct": 6,
      "accuracy_rate": 75.0
    }
  ]
}
```

#### GET `/api/stats/history`
最近の回答履歴を取得する。

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| limit | number | - | 取得件数（デフォルト: 20） |

**レスポンス:**
```json
[
  {
    "id": 101,
    "question_id": 5,
    "question_text": "リスクベーステストにおいて...",
    "domain_name": "テスト管理",
    "is_correct": true,
    "answered_at": "2026-04-12 14:30:00"
  }
]
```

---

## 5. データベース設計

### 5.1 テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| domains | 試験分野（シラバス章） |
| questions | 問題 |
| choices | 選択肢 |
| explanations | 解説 |
| answer_history | 回答履歴 |

### 5.2 テーブル定義

#### domains
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PK, AUTOINCREMENT | 分野ID |
| name | TEXT | NOT NULL, UNIQUE | 分野名 |
| description | TEXT | | 分野説明 |

#### questions
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PK, AUTOINCREMENT | 問題ID |
| domain_id | INTEGER | NOT NULL, FK | 分野ID |
| text | TEXT | NOT NULL | 問題文 |
| difficulty | INTEGER | NOT NULL, DEFAULT 2 | 難易度（1:易 / 2:普通 / 3:難） |

#### choices
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PK, AUTOINCREMENT | 選択肢ID |
| question_id | INTEGER | NOT NULL, FK | 問題ID |
| text | TEXT | NOT NULL | 選択肢テキスト |
| is_correct | INTEGER | NOT NULL, DEFAULT 0 | 正解フラグ（0:不正解 / 1:正解） |
| order_num | INTEGER | NOT NULL | 表示順 |

#### explanations
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PK, AUTOINCREMENT | 解説ID |
| question_id | INTEGER | NOT NULL, UNIQUE, FK | 問題ID |
| text | TEXT | NOT NULL | 解説テキスト |

#### answer_history
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PK, AUTOINCREMENT | 履歴ID |
| question_id | INTEGER | NOT NULL, FK | 問題ID |
| selected_choice_id | INTEGER | NOT NULL, FK | 選択した選択肢ID |
| is_correct | INTEGER | NOT NULL | 正誤（0:不正解 / 1:正解） |
| answered_at | TEXT | NOT NULL, DEFAULT now | 回答日時 |

---

## 6. エラー仕様

| HTTPステータス | 状況 | レスポンス例 |
|--------------|------|-------------|
| 400 | リクエストパラメータ不正 | `{ "error": "question_id is required" }` |
| 404 | リソースが存在しない | `{ "error": "Question not found" }` |
| 500 | サーバー内部エラー | `{ "error": "Internal server error" }` |

---

## 7. ディレクトリ構成（予定）

```
iori_project/
├── docs/
│   ├── requirements.md      # 要件定義書
│   └── external_spec.md     # 外部仕様書（本ドキュメント）
├── backend/
│   ├── src/
│   │   ├── index.ts         # Expressアプリ エントリーポイント
│   │   ├── db.ts            # SQLite接続・テーブル初期化
│   │   ├── seed.ts          # 初期データ投入スクリプト
│   │   └── routes/
│   │       ├── domains.ts
│   │       ├── questions.ts
│   │       ├── answers.ts
│   │       └── stats.ts
│   ├── data/
│   │   └── jstqb.db         # SQLiteデータベースファイル
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── types/
│   │   │   └── index.ts     # 共通型定義
│   │   ├── api/
│   │   │   └── client.ts    # Axiosラッパー
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Quiz.tsx
│   │   │   ├── Results.tsx
│   │   │   └── Stats.tsx
│   │   └── components/
│   │       ├── ProgressBar.tsx
│   │       ├── DomainCard.tsx
│   │       ├── QuestionCard.tsx
│   │       └── ChoiceButton.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
└── .gitignore
```
