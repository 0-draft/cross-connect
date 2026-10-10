# cross-connect

図解 AWS Direct Connect。コロケーション施設のクロスコネクトから、BGP の経路選択、冗長化モデル、MACsec、月額料金までを、触って動かせる図で解説するバイリンガル (English / 日本語) サイトです。「Direct Connect はなぜわかりにくいのか」を調べた結果 ([調査](docs/13-why-dx-is-hard.md)) をもとに構成し、ファイバーに住む光の粒「ヒカリ」が案内します。

**サイト:** <https://0-draft.github.io/cross-connect/?lang=ja>

[English README](README.md)

Direct Connect は AWS への道のひとつです。それ以外の道 (インターネット、Site-to-Site VPN、SD-WAN、VGW / Transit Gateway / Cloud WAN のハブ、DX と VPN の経路選択、PrivateLink、ハイブリッド DNS) は姉妹サイト [On-ramp](https://0-draft.github.io/on-ramp/?lang=ja) ([リポジトリ](https://github.com/0-draft/on-ramp)) で解説しています。

## 内容

| セクション | インタラクティブ要素 |
| --- | --- |
| なぜ難しい? | 4 つの根本原因、用語をタップで解説できるレイヤー図、だれが何を持っているか、つまずきポイントと解説先へのリンク |
| 概要 | ルーター、キャリア回線、ケージ、クロスコネクト、DX ルーター、VIF、ゲートウェイをクリックで解説 |
| 接続 | 帯域ラダー、専用 vs ホスト型、LOA-CFA 発注フローのステップ表示 |
| LAG・MACsec | LAG メンバーを切断して最小リンク数の挙動を確認、`should_encrypt` と `must_encrypt` の違い |
| VIF | プライベート / パブリック / トランジットを切り替えて到達先を表示 |
| DX ゲートウェイ | VGW / TGW / Cloud WAN モード、許可プレフィックスラボ、SiteLink の切り替え |
| BGP | 経路選択ラボ: プレフィックス長、`7224:7x00` コミュニティ、AS_PATH プリペンド、ホームリージョン、VPN バックアップ、行きと帰りが食い違うときの非対称ルーティング警告 |
| 冗長性 | Maximum / High / Dev-Test / Classic モデルの障害シミュレーター |
| セキュリティ | MACsec・IPsec・TLS がそれぞれ守る区間 |
| 運用 | はい / いいえで進むトラブルシューティング、アラームを設定すべきメトリクス |
| 料金 | 定価ベースの月額シミュレーター、定額料金の損益分岐 |
| 設計 | 7 つの質問でトポロジーを提案、アンチパターン |
| クイズ | よくある思い込み 10 問の「ほんと? うそ?」 |
| 年表 | 2011〜2026 年のリリース |
| 用語集 | 各用語の英語・日本語の正式名と、混同しやすい用語 |

数値の根拠は出典付きで [`docs/`](docs/README.md) にまとめています (英語)。2026-09-30 時点の AWS 公式ドキュメントで確認済みです。

## 開発

Node.js 24 が必要です。

```bash
npm ci
npm run dev        # http://localhost:5173/cross-connect/
npm run check      # 型チェック、lint、フォーマット、markdownlint、テスト、ビルド
npm run test:e2e   # 実ブラウザでのレイアウト検査 (事前に npx playwright install chromium)
```

シミュレーター (`src/lib/`) は純粋関数で、ユニットテスト付きです。BGP 経路選択、冗長化モデル、LAG と MACsec のルール、許可プレフィックスの挙動、料金計算 (AWS 公式の計算例と一致することを検証)、トポロジー提案を含みます。

## 免責

AWS とは無関係の非公式解説です。料金やクォータは変わるので、設計・購入前に必ず AWS 公式ドキュメントを確認してください。

## ライセンス

[MIT](LICENSE)
