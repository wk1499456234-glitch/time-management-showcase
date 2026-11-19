# 検証記録 / 验证记录

## 2026-11-19 · TimeWeave 正式HTTPS検証

現在の四画面版の機能コミットは `e581c0b6f90fe90d28fc90ed8b16988800ffb26e`。以下の古い日付の記録は、その時点の機能と検証範囲です。現在の機能はREADMEを参照してください。

- [Pages build/deploy](https://github.com/wk1499456234-glitch/time-management-showcase/actions/runs/44485615577) 成功。型検査、17件の保存・架空例・ルート試験、build、公開リストとハッシュ検査が成功。正式HTTPSのJS/CSSはローカル検証済み成果物とバイト単位で一致しました。
- 正式サイトのボタンで開始、Output保存、一時停止、再読み込み、再開、終了、原文編集を実行。改行・前後空白を保持。既存の試用記録も残っています。検証中に保存した新規記録は有効948ms、停止111323ms、経過112271msで合計一致し、整数秒表示は0秒です。
- JSONを実際にダウンロードし、保存ファイルを確認。同じファイルをファイル選択からプレビュー・追加し、2件の同一記録が重複しないことを確認。固定例30件は訪問者の保存・バックアップ対象に混ざりません。
- 四画面、直接リンク、再読み込み、戻る・進む、`#backup`の設定/バックアップ展開、`#/records/sample`の読み取り専用例を確認。タブを閉じて開き直しても試用記録と保存済み例を読めます。
- 正式サイトを1280px、390px、320pxで操作し、実測したviewportと横overflowなしを確認。日中の表示を切り替え、利用者の原文と保存済み日本語回顧が翻訳で上書きされないことを確認。
- 通常のスクロールで後続区画の一度だけの渐显を観測。ネイティブスクロールを使用し、表示済み区画は上へ戻っても消えません。OSの減少動作設定を変えた実ブラウザー試験は未実施（既存の受控テストを再利用）。
- 保存済み実AI例は以前の公開データから変更なし。公開コードとbuildを検査し、私人サーバー/AIへの接続や秘密を含めていません。CSPは `connect-src 'none'`。パターン検査は万能な秘密検出の保証ではありません。

証拠：[desktop](screenshots/timeweave-review-desktop.jpg) · [390px](screenshots/timeweave-review-390.jpg)。静止画像は動作全体の証明ではありません。実機iPhone/Safari上の公開版、ソフトキーボード、ブラウザー全体の終了・再起動は **NOT RUN**。これらはデスクトップChromiumのviewport試験と区別しています。

実行日：2026-10-01（端末の日本時間）。AI エージェントによる実行結果です。所有者本人が全項目を手操作したという記録ではありません。

## 対象と隔離

固定 desktop release の37ファイルを `95e2c8a47842ee52b129a7b5719436fc3014d850` と照合し、改行以外の差異なし。元の開発 checkout はより古い frontend でした。日常 HTTP サービスは接続不可だったため、稼働中資産の比較は **NOT RUN**。サービスを起動・再起動していません。

検証には日常ブラウザーと別の Codex 内蔵 Chromium と、新規のローカル origin を使用しました。実記録を開いたり移したりせず、すべて検証用の文章です。スクリーンショットは実際のブラウザー画面で、端末写真やモックアップではありません。

## 実行結果

| 検証 | 結果・根拠 |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS。元の依存関係と lockfile を使用。68 packages。製品依存の追加なし。 |
| `npm run typecheck` | PASS、終了コード0。 |
| `npm test` | PASS、14/14。既存12件 + 原文空白保持 + JSONフィールド順の回帰。 |
| `npm run build` | PASS、終了コード0。3つの静的資産を生成。 |
| `npm run check:public` | PASS。静的資産、相対パス、公開リスト、禁止接続先/credential パターンを検査。万能な秘密検出器ではないため公開リストも確認。 |
| 初回表示 | PASS。別の新規 origin の初回訪問は日本語・実績0・完了記録なし・実行中なし。既存 origin の検証記録が混入しない。 |
| 開始→Output→一時停止→再開→終了 | PASS、実際のボタンで実行。終了直後にサマリーと今日の記録を表示。 |
| 再読み込み | PASS。実行中の計時が復元・継続。一時停止は再読み込み後も `0:00:12` のまま。別の検証では `0:00:33` のまま数分を経過。 |
| Output編集 | PASS。実行中と完了後の今日の記録を編集し、再読み込み後の本文を確認。 |
| JSON書き出し | PASS。実際にクリックしてダウンロードされたJSONをディスクで確認。形式/バージョン/2件の記録/原文空白を検査。downloadイベントの待機はタイムアウトしたがファイルは生成された。 |
| JSON読み込み | PASS。上記ファイルを実際のファイル選択で指定し、2件の確認表示から追加。同一記録はスキップされ、重複しなかった。空ストアへの復元・不正データ拒否・競合拒否は回帰テストでも確認。 |
| 時間整合性 | PASS。最初の実測記録は active=270879ms、pause=12054ms、elapsed=282933ms。合計が一致。 |
| 実ブラウザー保存障害 | PASS、7/7。実際のWeb Locks競合、localStorage読取、配額到達、新Outputのメモリー保持、保存済み原文維持、テスト詰め物だけを消した後の再保存、破損原文の保持。終了時のランダム試験キー残数0。 |
| 日本語/中国語 | PASS。切り替え、履歴の開発中表示、保存・読み込み確認・編集文言を操作確認。原文は翻訳されない。 |
| レイアウト | PASS。1280×1000、390×844、320×700の実ブラウザーで横方向のoverflowなし。390pxで開始・停止・編集・ファイル選択を操作。 |
| 子パス | PASS。`/time-management-showcase/` から相対assetを取得して動作。 |
| ネットワーク | PASS。初回と計時操作後のPerformance resource記録は同一originのJS/CSSと検証専用diagnostics.jsのみ。外部通信・API・私人サービス接続なし。診断コードは `dist/` に含めず、検証サーバーのみで追加。 |
| 本体のコンソール | 取得したerror/warnログは0件。診断ページでは出所情報のない inline style のCSP拒否を1件記録。製品ソース/DOMにinline styleはなく、外部通信やアプリ例外は観測されなかった。ブラウザー自動化由来の可能性はあるが断定しない。 |

## 証拠と再現

- [desktop.png](screenshots/desktop.png)：1280×1000、停止中の計時とOutput。
- [mobile.png](screenshots/mobile.png)：390×844、操作部分までスクロールした画面。
- [mobile-overview.png](screenshots/mobile-overview.png)：390×844、ページ先頭と保存説明。
- `tests/persistence.test.ts`：時刻/停止区間、競合、配額失敗、不正データ、原文保持、JSON往復など。
- 実ストレージ試験：`node tests/build-browser-harness.mjs` 後、`.test-output/browser` をテストに指定した loopback ポートで配信し、ボタンを押す。専用origin以外では拒否し、ランダムキーだけを操作する。
- `CHECKPOINT.sha256`：公開候補ファイルのSHA-256一覧（自身を除外）。`PUBLIC-FILES.txt`：その正確な公開候補一覧。

## 未実施と限界

実機iPhone/Safari、Firefoxは **NOT RUN**。公開HTTPS本番URLとGitHub Actionsは下記の公開検証で実施済みです。スマートフォンの結果はChromiumのviewport検証です。OS/ブラウザー全体は終了していません。複数タブ競合は実Web Locksの独立storeと回帰テストで検証し、今回の製品UIを2タブ同時に操作する手動競合試験は未実施です。

保存はブラウザーの容量・権限・時刻に依存し、クラウド同期や完全なバックアップ保証はありません。旧日付の記録はJSONに含まれますが履歴画面は開発中です。製品の4活動・固定8時間・分単位集計などの制限はREADMEに記載しています。

初回ローカル検証時点では公開用Gitは新規初期化のみでした。その後のcommit・push・デプロイ結果は下記に記録しています。元プロジェクトの作業ツリーstatusは検証前後で一致しました。


## 依存パッケージ修正後の再検証（2026-10-01）

Vite 5.4.21 → 6.4.3、esbuild 0.21.5 → 0.25.12、React plugin → 4.7.0。公開前に見つかった開発サーバー関連の既知脆弱性を修正。npm公式registryによる全依存audit・実行依存のみのauditは両方0件。これは既知のadvisoryとの照合であり、安全性全体を保証するものではありません。

型検査、production build、14件の回帰テスト、公開ファイル/成果物スキャンはPASS。追加の非公開ローカル検証では実際のReact描画がHTML風Outputをエスケープし、18種類の不正JSONが保存済みバイト列とメモリー状態を変更せず拒否されました。

更新後の静的成果物を新規loopback originの `/time-management-showcase/` で配信し、初回0件、開始、Output追加、一時停止、再読み込み、再開、終了、終了後再読み込みを実ブラウザーで再検証しました。HTML風文字列は文字として表示され、console error/warnは0件でした。初期のPython検証サーバーは応答中断のため別のNode静的サーバーへ切り替えました。製品サーバーは不要です。

依存修正時点ではGitHubサインイン待ちでしたが、その後に公開検証を完了しました。既存のスマートフォンviewport・JSONファイル選択の検証結果は上記のとおりで、今回の依存更新後はタイマーUIとJSONの回帰テストを再実行しました。

## GitHub Pages 公開検証（2026-10-01）

[公開URL](https://wk1499456234-glitch.github.io/time-management-showcase/)、[Actions成功記録](https://github.com/wk1499456234-glitch/time-management-showcase/actions/runs/36858077377)。`8a1746c` をデプロイ。クラウドのnpm ci、型検査、14件の回帰テスト、build、公開検査、deployはすべて成功。公開日の全依存・実行依存auditも0件。

HTTPSページとJS/CSS取得は200、公開JS/CSSはローカル検証済みdistとバイト単位で一致。公開origin初回は0件。実ボタンで開始→Output追加→一時停止→再読み込み（0:00:07と原文を復元）→再開→実行中再読み込み→終了→再読み込み後の今日の記録とOutput原文を確認。console error/warnは0件。1280pxと390px viewportで横overflowなし。検証入力は架空の文章のみ。

JSONファイル選択・実機モバイルの公開URL上での再検証はNOT RUN。JSONは既述のローカル実ブラウザー試験と回帰テストによる検証。Actionsには依存actionのNode20廃止/Node24移行とubuntu-latest変更予告が出ましたが、build/deployは成功。後続の保守対象です。

## 技術補足 / 技术补充

READMEから分離した実装説明です。今回の文書整理による機能変更や追加試験ではありません。

- `src/state/sessionData.ts`：状態遷移を扱い、開始・終了時刻と一時停止区間から有効時間を計算します。毎秒の再描画回数を計時根拠にしません。今日の集計は端末の現地時刻の午前0時で区切り、重なる一時停止区間を差し引きます。
- `src/state/localSessionStore.ts`：操作時にlocalStorageへ保存。Web Locksで書き込みを直列化し、保存前の原文比較で別タブの更新を検知します。競合時は上書きせず、メモリー内の記録をエクスポートできる状態で保持します。
- JSON読み込み：形式・時刻・重複・競合を検証してから一括適用。同一IDの記録は正規化した内容で比較し、フィールド順だけの違いを競合としません。同一IDで内容が異なる場合や時間重複は全体を拒否します。読み込み上限は5 MB、各リスト10,000件などです。
- `CHECKPOINT.sha256`：公開対象ファイルのハッシュ一覧（自身を除外）。出所コミットとの比較は `PROVENANCE.md`、現在の公開対象は `PUBLIC-FILES.txt` を参照してください。

中文补充：状态转换负责记录开始、暂停、恢复和结束；有效时间按实际时间戳与暂停区间计算。Web Locks 让写入依次执行，保存前比较用于发现其他页面已经修改数据。导入时先验证整份文件，再按规范化后的内容比较同一ID记录，避免字段排列顺序造成误判；异常时不覆盖原数据。源码来源与文件哈希用于核对公开内容，不是产品功能或安全性的绝对保证。


## 機能への移動リンクの検証（2026-10-08）

今回のローカル production build をリポジトリ名の子パスで配信し、Playwright と Chrome 154 の新規・非永続ブラウザー環境で操作しました。各画面幅ごとに別の環境を作り、架空の Output だけを使用しています。日常ブラウザーのデータは使用していません。

| 確認した動作 | 実測結果 |
| --- | --- |
| `#timer`・`#records`・`#backup` の直接アクセスと再読み込み | PASS。目的の領域が表示され、フォーカスが移動。ナビゲーションに隠れない位置を確認。バックアップの説明は展開。 |
| 履歴・分析・設定から各リンクへ移動 | PASS。今日の対応領域へ戻る。同じリンクの再選択でも、閉じたバックアップの説明を再展開。 |
| 計時中の移動 | PASS。時計が進み、追加済み Output と保存データの文字列が変わらない。未追加の入力もページ内移動と開発中画面への往復では保持。未追加の入力の再読み込み保存を提供するものではない。 |
| 一時停止後の移動と再読み込み | PASS。「保存済み」と警告なしを確認してから再読み込み。一時停止状態、有効時間、Output と保存データの文字列を保持。 |
| 一連の操作 | PASS。開始→Output追加→一時停止→保存確認→再読み込み→再開→終了→本日の記録。終了した1件と入力文を確認。 |
| 移動のみの副作用 | PASS。初回は活動未開始・本日の記録は空。保存済みデータも移動や再読み込みだけでは変化なし。ダウンロード・ファイル選択は0件。ブラウザーの戻る・進むでも記録を保持。 |
| 言語とレイアウト | PASS。日中両方の直接アクセス・再読み込み・言語選択の保持を確認。1280×1000、390×844、320×700で横方向のoverflowなし。スクリーンショットも確認。 |
| 資産・通信・例外 | PASS。JS/CSSは取得成功。同一originへのGETのみを観測し、アプリ例外とアプリ資産の読み込みエラーなし。 |

型検査、既存14件の回帰テスト、build、公開内容検査、文書リンク確認、`git diff --check` はPASS。スマートフォン相当の幅はChromeによるシミュレーションです。実機スマートフォン、Safari、Firefox、および製品UIの2タブ同時編集は今回の検証対象外です。

中文补充：本次实际操作了三个定位入口及完整计时流程，对比移动前后的保存数据，确认导航不修改记录。桌面及390/320像素宽度检查均通过；手机宽度模拟不等于真实手机验收。既有历史验证记录保持原样，上述为本次新增验证。

## 2026-11-18 — AI showcase candidate

The earlier sections are historical validation, not evidence for newly added features.

- PASS: TypeScript and Vite production build; 17 tests covering timer persistence, original whitespace, malformed/duplicate/conflicting imports, existing-store compatibility, separate fixture data, routes, and recomputation of every week's effective time and typed quantities.
- PASS: 30 fictional activities, 6 per week, 180 minutes per week; five minutes of pause excluded from the applicable 35-minute intervals. Target week: 60 reviewed words, 20 attempted questions, 12 pages, one qualitative item without quantity.
- PASS: Three real parse requests and one real Japanese review through the isolated product UI. Confirmed types using UI; original text and AI quantities retained. The model input included four complete historical weeks, without the private expected-answer file.
- PASS: Saved review survives refresh, closed/reopened page and backend restart; subsequent reads and language changes made no additional inference requests. Full SQLite backup restored into a new path; original records, quantities and review matched.
- Quality boundary: the model explained mostly the previous-week difference. The separate program table shows all four prior weeks and their mean. A technical time label was replaced by the existing presentation layer. Goal, difficulty and learning-quality limitations are shown separately by the program; the model's suggestions are optional, not assigned targets.
- Browser candidate: real four-page navigation, back navigation, paused timer/draft retention, reload, visitor record separation, historical week without a saved review, Japanese/Chinese labels, desktop 1280px and mobile 390px/320px checked. No document-level horizontal overflow observed at 320px; the statistics table scrolls within its own region.
- Source/build separation: static JSON only; no API client in the public runtime. Production CSP uses `connect-src 'none'`. No source maps or private backend are shipped.
- Limitations: real iPhone/Safari, mobile on-screen keyboard and system reduced-motion setting changes have NOT RUN. The inspected browser reports reduced motion off; the existing fallback behavior is retained. Full browser network waterfall capture is not exposed by the current browser tool; resource/security/source checks are recorded separately, not described as a waterfall inspection.

Public deployment verification is recorded with the released commit and Actions run, separately from these local checks.
