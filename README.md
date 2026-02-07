# P&ID バルブ操作シミュレーター

化学プラントのP&ID（配管計装図）を再現し、バルブの開閉操作によって液体がどこまで到達するかをシミュレーションするツール。

## 特徴
- DCS画面のような操作感でバルブを開閉
- BFSアルゴリズムによるリアルタイム液体到達判定
- SVGベースのP&ID図描画
- 教育・訓練モード（フェーズ/ステップ/安全ルール）

## 技術スタック
- React + TypeScript + Vite
- Vitest + @testing-library/react

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev       # 開発サーバー起動
npm test          # テスト実行
npm run build     # プロダクションビルド
```

## ドキュメント
- 仕様書: `pid-simulator-specification.md`
- 要件定義: `docs/requirements/REQUIREMENTS.md`
- 開発計画: `docs/process/PLAN.md`
- アーキテクチャ: `docs/architecture/ARCHITECTURE.md`
- 開発プロセス: `docs/process/DEVELOPMENT_PROCESS.md`
