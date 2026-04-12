import db from './db';

const count = db.prepare('SELECT COUNT(*) AS c FROM domains').get() as { c: number };
if (count.c > 0) {
  console.log('既にシード済みです。スキップします。');
  process.exit(0);
}

/* ------------------------------------------------------------------ */
/*  型定義                                                               */
/* ------------------------------------------------------------------ */
interface SeedChoice {
  text: string;
  correct: boolean;
}
interface SeedQuestion {
  text: string;
  difficulty: number;
  choices: SeedChoice[];
  explanation: string;
}
interface SeedDomain {
  name: string;
  description: string;
  questions: SeedQuestion[];
}

/* ------------------------------------------------------------------ */
/*  シードデータ（ダミー問題 — 各分野3問 × 7分野 = 21問）               */
/* ------------------------------------------------------------------ */
const SEED: SeedDomain[] = [
  {
    name: 'テストプロセス',
    description: 'テストの計画・監視・制御・分析・設計・実装・実行・評価・クロージャなどのテストプロセス全体',
    questions: [
      {
        text: '（ダミー）テスト計画の主要な構成要素として最も適切なものはどれか？',
        difficulty: 2,
        choices: [
          { text: 'テストのスコープ、アプローチ、リソース、スケジュール', correct: true },
          { text: '詳細なテストケースの実行手順リスト', correct: false },
          { text: 'テスト実行中に検出した欠陥の記録', correct: false },
          { text: '開発チームの技術的な設計仕様', correct: false },
        ],
        explanation:
          'テスト計画書には、テストのスコープ（何をテストするか）、アプローチ（どのようにテストするか）、必要なリソース（人員・環境・ツール）、スケジュールを定義します。詳細なテストケースはテスト設計フェーズで作成されます。（ダミー解説）',
      },
      {
        text: '（ダミー）テストモニタリングとコントロールの説明として正しいものはどれか？',
        difficulty: 2,
        choices: [
          { text: 'モニタリングは計画との差異を検出し、コントロールは差異を是正する行動を取る', correct: true },
          { text: 'モニタリングはテスト完了後に行い、コントロールはテスト開始前に行う', correct: false },
          { text: 'モニタリングとコントロールはテストマネージャのみが担当する', correct: false },
          { text: 'モニタリングは欠陥を修正し、コントロールは欠陥を発見する', correct: false },
        ],
        explanation:
          'テストモニタリングはテスト進捗を継続的に追跡してテスト計画との差異を把握する活動です。テストコントロールはその差異に基づいて是正行動を取る活動です。両者は継続的に行われます。（ダミー解説）',
      },
      {
        text: '（ダミー）リグレッションテストを実施する主な目的はどれか？',
        difficulty: 1,
        choices: [
          { text: '新しい機能が正しく実装されていることを確認するため', correct: false },
          { text: '変更によって既存機能に悪影響が出ていないことを確認するため', correct: true },
          { text: 'システムのパフォーマンスが向上していることを確認するため', correct: false },
          { text: 'セキュリティ上の脆弱性がないことを確認するため', correct: false },
        ],
        explanation:
          'リグレッションテスト（回帰テスト）は、コードの変更（バグ修正・機能追加・リファクタリングなど）により、以前は正常に動作していた機能が影響を受けていないことを確認するテストです。（ダミー解説）',
      },
    ],
  },
  {
    name: 'テスト管理',
    description: 'テスト管理全般、リスクベーステスト、見積もり、メトリクス、アウトソーシング',
    questions: [
      {
        text: '（ダミー）リスクベーステストにおいてテスト優先度を決定する際の主な要素はどれか？',
        difficulty: 2,
        choices: [
          { text: 'テスト実行時間とテストコスト', correct: false },
          { text: '欠陥の発生可能性と欠陥が発生した場合の影響度', correct: true },
          { text: 'テストケース数とテスト担当者数', correct: false },
          { text: 'テストカバレッジとテストツールの性能', correct: false },
        ],
        explanation:
          'リスクベーステストでは、リスクレベル＝発生可能性×影響度として評価します。発生可能性が高く影響度も大きいリスクから先にテストすることで、限られたリソースを効果的に配分できます。（ダミー解説）',
      },
      {
        text: '（ダミー）テスト見積もりに使用されるワイドバンドデルファイ法の特徴として正しいものはどれか？',
        difficulty: 2,
        choices: [
          { text: '過去プロジェクトの実績データのみを使用する', correct: false },
          { text: '複数の専門家が独立して見積もりを行い、議論を通じて合意に達する', correct: true },
          { text: '一人の専門家がすべての見積もりを行う', correct: false },
          { text: '自動化ツールが見積もりを計算する', correct: false },
        ],
        explanation:
          'ワイドバンドデルファイ法では、複数の専門家が各自独立して見積もりを行い、見積もり結果を共有した後にディスカッションを重ねて合意に達します。多様な視点を取り入れることで精度が向上します。（ダミー解説）',
      },
      {
        text: '（ダミー）テストの独立性レベルが最も高いものはどれか？',
        difficulty: 1,
        choices: [
          { text: '開発者が自分のコードをテストする', correct: false },
          { text: '同じ開発チームの別の開発者がテストする', correct: false },
          { text: '組織内の独立したテストチームがテストする', correct: false },
          { text: '外部の独立したテスト機関がテストする', correct: true },
        ],
        explanation:
          'テストの独立性は「開発者本人 < 別の開発者 < 組織内の独立したテストチーム < 外部の独立したテスト機関」の順に高くなります。独立性が高いほど先入観なく欠陥を発見しやすい反面、コストも増加します。（ダミー解説）',
      },
    ],
  },
  {
    name: 'レビュー',
    description: 'マネジメントレビュー、フォーマルレビュー、インスペクション、レビューメトリクス',
    questions: [
      {
        text: '（ダミー）フォーマルレビュー（インスペクション）の実施ステップとして正しい順序はどれか？',
        difficulty: 2,
        choices: [
          { text: '計画 → キックオフ → 個人レビュー → レビューミーティング → 修正・フォローアップ', correct: true },
          { text: 'キックオフ → 計画 → レビューミーティング → 個人レビュー → 修正', correct: false },
          { text: '個人レビュー → 計画 → キックオフ → レビューミーティング → 修正', correct: false },
          { text: '計画 → 個人レビュー → キックオフ → 修正 → レビューミーティング', correct: false },
        ],
        explanation:
          'インスペクションのプロセスは「計画 → キックオフ（任意）→ 個人レビュー（準備）→ レビューミーティング → 修正 → フォローアップ」の順で実施されます。（ダミー解説）',
      },
      {
        text: '（ダミー）レビューにおけるモデレーターの主な役割として正しいものはどれか？',
        difficulty: 2,
        choices: [
          { text: '欠陥の修正を自ら実施する', correct: false },
          { text: 'レビューの計画、進行管理、フォローアップを担当する', correct: true },
          { text: 'テストケースを作成する', correct: false },
          { text: 'すべての欠陥の優先度を最終決定する', correct: false },
        ],
        explanation:
          'モデレーターはレビューのファシリテーターとして、計画立案・参加者調整・ミーティング進行・フォローアップを担当します。欠陥修正は作成者（著者）が行います。（ダミー解説）',
      },
      {
        text: '（ダミー）レビューの主なメリットとして最も適切なものはどれか？',
        difficulty: 1,
        choices: [
          { text: 'テスト自動化のコストを削減できる', correct: false },
          { text: '開発の上流工程で欠陥を早期発見することでコスト削減できる', correct: true },
          { text: 'コーディング速度が向上する', correct: false },
          { text: 'テストフェーズを省略できる', correct: false },
        ],
        explanation:
          'レビューの最大メリットは早期欠陥発見です。欠陥修正コストは後工程になるほど増大するため、要件・設計段階でのレビューによる欠陥除去は非常に費用対効果が高いです。（ダミー解説）',
      },
    ],
  },
  {
    name: '欠陥管理',
    description: '欠陥ライフサイクル、欠陥レポート、プロセス能力評価',
    questions: [
      {
        text: '（ダミー）欠陥の「重大度」と「優先度」の関係を正しく説明しているものはどれか？',
        difficulty: 2,
        choices: [
          { text: '重大度が高い欠陥は常に優先度も高い', correct: false },
          { text: '重大度はシステムへの技術的影響を示し、優先度はビジネス上の修正緊急度を示す', correct: true },
          { text: '優先度はテスターが決定し、重大度は開発者が決定する', correct: false },
          { text: '重大度と優先度は同じ概念であり、区別する必要はない', correct: false },
        ],
        explanation:
          '重大度（Severity）はシステムへの技術的影響の大きさ、優先度（Priority）はビジネス観点からの修正の緊急度を示します。両者は必ずしも一致しません。（ダミー解説）',
      },
      {
        text: '（ダミー）欠陥トリアージミーティングの主な目的として正しいものはどれか？',
        difficulty: 2,
        choices: [
          { text: '欠陥の根本原因を詳細に分析する', correct: false },
          { text: '報告された欠陥の優先度と対応方針を関係者間で合意する', correct: true },
          { text: 'テストケースの妥当性を評価する', correct: false },
          { text: 'テスト環境の問題を解決する', correct: false },
        ],
        explanation:
          '欠陥トリアージは、欠陥の優先度付け・対応方針・担当者アサインを関係者が協力して決定するミーティングです。限られたリソースを重要な欠陥修正に集中させます。（ダミー解説）',
      },
      {
        text: '（ダミー）欠陥データを活用したプロセス改善の手法として最も適切なものはどれか？',
        difficulty: 3,
        choices: [
          { text: '欠陥数が多い開発者を特定して評価に反映する', correct: false },
          { text: '欠陥の分類・傾向分析と根本原因分析によりプロセスの弱点を特定する', correct: true },
          { text: '欠陥数が一定数以下になるまでテストを継続する', correct: false },
          { text: '欠陥密度が業界平均を下回れば問題ないと判断する', correct: false },
        ],
        explanation:
          '欠陥の分類・傾向分析と根本原因分析（RCA）により、プロセスの問題点を特定して将来の欠陥混入を防ぐ改善策を講じることができます。（ダミー解説）',
      },
    ],
  },
  {
    name: 'テストプロセスの改善',
    description: 'TMMi、TPI Next、CTP、STEPなどのテストプロセス改善モデル',
    questions: [
      {
        text: '（ダミー）TMMi（Test Maturity Model integration）のレベルを正しい順序で示しているものはどれか？',
        difficulty: 2,
        choices: [
          { text: '初期 → 管理された → 定義された → 測定された → 最適化', correct: true },
          { text: '初期 → 定義された → 管理された → 最適化 → 測定された', correct: false },
          { text: '管理された → 初期 → 定義された → 測定された → 最適化', correct: false },
          { text: '初期 → 管理された → 定義された → 最適化 → 測定された', correct: false },
        ],
        explanation:
          'TMMiは5段階：レベル1「初期」→レベル2「管理された」→レベル3「定義された」→レベル4「測定された」→レベル5「最適化」の順です。（ダミー解説）',
      },
      {
        text: '（ダミー）TPI Nextフレームワークの特徴として正しいものはどれか？',
        difficulty: 3,
        choices: [
          { text: 'テスト成熟度を3段階で評価する', correct: false },
          { text: '16のキーエリアと3つの成熟度レベルでテストプロセスを評価・改善する', correct: true },
          { text: 'テスト自動化のみに特化したフレームワークである', correct: false },
          { text: '日本のソフトウェア業界専用のモデルである', correct: false },
        ],
        explanation:
          'TPI Next（Test Process Improvement Next）は16のキーエリアを定義し、各キーエリアを3段階で評価するフレームワークです。個々のキーエリアを独立して改善できる柔軟性があります。（ダミー解説）',
      },
      {
        text: '（ダミー）テストプロセス改善においてGAP分析を実施する主な目的はどれか？',
        difficulty: 2,
        choices: [
          { text: 'テストコストの詳細な内訳を明らかにする', correct: false },
          { text: '現在の状態と目標状態の差異を特定する', correct: true },
          { text: '競合他社のテストプロセスと比較する', correct: false },
          { text: '欠陥の根本原因を分析する', correct: false },
        ],
        explanation:
          'GAP分析では現在のテストプロセスの状態（As-Is）と目標状態（To-Be）の差異（ギャップ）を特定します。このギャップが具体的な改善施策立案のインプットになります。（ダミー解説）',
      },
    ],
  },
  {
    name: 'テストツールと自動化',
    description: 'テストツールの選択・ライフサイクル・ROI、テスト自動化',
    questions: [
      {
        text: '（ダミー）テストツールを選定する際の最も重要な評価基準はどれか？',
        difficulty: 2,
        choices: [
          { text: 'ツールの価格が最も安価であること', correct: false },
          { text: '組織のニーズと既存環境への適合性、および総所有コスト（TCO）の評価', correct: true },
          { text: '市場シェアが最も大きいツールであること', correct: false },
          { text: 'ベンダーのサポート期間が最も長いこと', correct: false },
        ],
        explanation:
          'ツール選定では、組織の課題解決への適合性、既存環境との統合可能性、ライセンス・導入・維持コストを含む総所有コスト（TCO）の評価が最重要です。（ダミー解説）',
      },
      {
        text: '（ダミー）テスト自動化導入を成功させる最も重要な要因として適切なものはどれか？',
        difficulty: 2,
        choices: [
          { text: 'すべてのテストケースを自動化する', correct: false },
          { text: '自動化の目的と期待値を明確にし、自動化に適したテストを選択する', correct: true },
          { text: '最新バージョンのツールを常に使用する', correct: false },
          { text: '自動化開始後に詳細な計画を立てる', correct: false },
        ],
        explanation:
          '自動化すべきテストと手動で行うべきテストを見極め、自動化の目的と期待値を明確にすることが成功の鍵です。すべてのテストを自動化しようとすると維持コストが膨大になります。（ダミー解説）',
      },
      {
        text: '（ダミー）CI/CD環境でのテスト自動化の主なメリットとして正しいものはどれか？',
        difficulty: 1,
        choices: [
          { text: '手動テストが完全に不要になる', correct: false },
          { text: 'コード変更のたびに自動テストが実行され、問題を早期に検出できる', correct: true },
          { text: 'テスト設計が不要になる', correct: false },
          { text: 'テスト環境の管理が不要になる', correct: false },
        ],
        explanation:
          'CI/CD環境ではコードコミットのたびに自動でビルドとテストが実行されます。問題を早期発見でき修正コストを削減できます。ただし探索的テストなどの手動テストは依然として必要です。（ダミー解説）',
      },
    ],
  },
  {
    name: '人的スキル・チーム構成',
    description: '個人スキル、チームダイナミクス、モチベーション、コミュニケーション',
    questions: [
      {
        text: '（ダミー）テストチームの独立性がもたらす主なメリットとして正しいものはどれか？',
        difficulty: 1,
        choices: [
          { text: 'テストコストを常に削減できる', correct: false },
          { text: 'テスターが先入観なく欠陥を発見しやすい', correct: true },
          { text: '開発者との連携が不要になる', correct: false },
          { text: 'テスト計画の作成が不要になる', correct: false },
        ],
        explanation:
          'テスト独立性の最大メリットは、テスターが確証バイアスを持たずに客観的な視点で欠陥を発見できる点です。ただし独立性が高すぎるとコミュニケーションコストが増加するトレードオフがあります。（ダミー解説）',
      },
      {
        text: '（ダミー）マズローの欲求階層説において、安全の欲求が満たされた後に現れる欲求はどれか？',
        difficulty: 2,
        choices: [
          { text: '自己実現の欲求', correct: false },
          { text: '承認の欲求', correct: false },
          { text: '社会的欲求（所属と愛情の欲求）', correct: true },
          { text: '生理的欲求', correct: false },
        ],
        explanation:
          'マズローの欲求階層説は「生理的欲求→安全の欲求→社会的欲求（所属と愛情）→承認（尊重）の欲求→自己実現の欲求」の5段階です。安全の欲求が満たされると社会的欲求が現れます。（ダミー解説）',
      },
      {
        text: '（ダミー）アジャイル開発環境におけるテスターの役割として最も適切なものはどれか？',
        difficulty: 2,
        choices: [
          { text: 'テストはリリース前の独立したフェーズとして実施する', correct: false },
          { text: 'スプリント内でチームと協力し、継続的にテスト活動を実施する', correct: true },
          { text: 'テスターはスプリント計画ミーティングには参加しない', correct: false },
          { text: 'アジャイルではテスト専任者は不要である', correct: false },
        ],
        explanation:
          'アジャイル開発ではテスターはスプリント内でチームと協力し継続的にテストを実施します。テスト活動はスプリントに組み込まれており、チーム全員でソフトウェアの品質に責任を持ちます。（ダミー解説）',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  INSERT                                                               */
/* ------------------------------------------------------------------ */
const insertDomain      = db.prepare('INSERT INTO domains (name, description) VALUES (?, ?)');
const insertQuestion    = db.prepare('INSERT INTO questions (domain_id, text, difficulty) VALUES (?, ?, ?)');
const insertChoice      = db.prepare('INSERT INTO choices (question_id, text, is_correct, order_num) VALUES (?, ?, ?, ?)');
const insertExplanation = db.prepare('INSERT INTO explanations (question_id, text) VALUES (?, ?)');

db.exec('BEGIN');
try {
  for (const domain of SEED) {
    const dr = insertDomain.run(domain.name, domain.description);
    const domainId = Number(dr.lastInsertRowid);

    for (const q of domain.questions) {
      const qr = insertQuestion.run(domainId, q.text, q.difficulty);
      const questionId = Number(qr.lastInsertRowid);

      q.choices.forEach((c, i) => {
        insertChoice.run(questionId, c.text, c.correct ? 1 : 0, i + 1);
      });

      insertExplanation.run(questionId, q.explanation);
    }
  }
  db.exec('COMMIT');
} catch (e) {
  db.exec('ROLLBACK');
  throw e;
}

console.log(`✅  シード完了: ${SEED.length}分野 / ${SEED.reduce((s, d) => s + d.questions.length, 0)}問`);
