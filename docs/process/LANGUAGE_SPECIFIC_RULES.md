# 言語別開発ルール

このドキュメントでは、各プログラミング言語における推奨ツール・ベストプラクティスを記載します。

プロジェクトで使用する言語のセクションを参照し、`docs/process/DEVELOPMENT_PROCESS.md` の「検証/運用」セクションに実行コマンドを追記してください。

---

## Python

### パッケージ管理
- **ツール:** `uv`（推奨） または `pip` + `venv`
- **依存管理:** `pyproject.toml` + `uv.lock`

### セットアップ

```bash
# プロジェクト初期化
uv init

# パッケージ追加
uv add requests
uv add --dev pytest  # 開発依存

# 依存関係の同期
uv sync
```

### 実行

```bash
# メインスクリプト実行
uv run python main.py

# モジュールとして実行
uv run python -m mymodule

# テスト実行
uv run python -m unittest discover -s tests
# または pytest使用時
uv run pytest
```

### テスト
- **フレームワーク:** `unittest`（標準ライブラリ） または `pytest`
- **モック:** `unittest.mock`
- **カバレッジ:** `coverage` または `pytest-cov`

### ディレクトリ構造例

```
my_project/
├── pyproject.toml
├── uv.lock
├── README.md
├── main.py
├── mymodule/
│   ├── __init__.py
│   ├── core.py
│   └── utils.py
└── tests/
    ├── __init__.py
    ├── test_core.py
    └── test_utils.py
```

### 参考
- [uv公式ドキュメント](https://github.com/astral-sh/uv)
- [pytest公式ドキュメント](https://docs.pytest.org/)

---

## Node.js / TypeScript

### パッケージ管理
- **ツール:** `npm` / `yarn` / `pnpm`
- **依存管理:** `package.json` + `package-lock.json` (または `yarn.lock` / `pnpm-lock.yaml`)

### セットアップ

```bash
# プロジェクト初期化
npm init -y
# または
yarn init -y
# または
pnpm init

# パッケージインストール
npm install express
npm install --save-dev jest  # 開発依存

# TypeScriptの場合
npm install --save-dev typescript @types/node
npx tsc --init
```

### 実行

```bash
# 開発モード
npm run dev
# または
yarn dev

# ビルド
npm run build

# 本番実行
npm start

# テスト
npm test
# または
yarn test
```

### テスト
- **フレームワーク:** `Jest` / `Vitest` / `Mocha`
- **TypeScript用:** `ts-jest` / `@swc/jest`

### ディレクトリ構造例（TypeScript）

```
my_project/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── app.ts
│   └── utils/
│       └── helper.ts
├── tests/
│   └── app.test.ts
└── dist/  # ビルド出力
```

### 参考
- [npm公式ドキュメント](https://docs.npmjs.com/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Jest公式ドキュメント](https://jestjs.io/docs/getting-started)

---

## Java

### ビルドツール
- **ツール:** `Maven` / `Gradle`
- **依存管理:** `pom.xml`（Maven） または `build.gradle`（Gradle）

### セットアップ（Maven）

```bash
# プロジェクト作成
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app

# 依存関係のインストール
mvn install

# ビルド
mvn clean package
```

### 実行

```bash
# アプリケーション実行
mvn exec:java -Dexec.mainClass="com.example.App"

# テスト
mvn test

# JAR実行
java -jar target/my-app-1.0.jar
```

### テスト
- **フレームワーク:** `JUnit` / `TestNG`
- **モック:** `Mockito`

### ディレクトリ構造例（Maven）

```
my_project/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   └── java/
    │       └── com/
    │           └── example/
    │               └── App.java
    └── test/
        └── java/
            └── com/
                └── example/
                    └── AppTest.java
```

### 参考
- [Maven公式ドキュメント](https://maven.apache.org/guides/)
- [JUnit5公式ドキュメント](https://junit.org/junit5/docs/current/user-guide/)

---

## Go

### パッケージ管理
- **ツール:** `go mod`（標準）
- **依存管理:** `go.mod` + `go.sum`

### セットアップ

```bash
# モジュール初期化
go mod init github.com/username/my-project

# 依存関係追加
go get github.com/gin-gonic/gin

# 依存関係整理
go mod tidy
```

### 実行

```bash
# アプリケーション実行
go run main.go

# ビルド
go build -o my-app

# テスト
go test ./...

# テストカバレッジ
go test -cover ./...
```

### テスト
- **フレームワーク:** `testing`（標準ライブラリ）
- **アサーション:** `testify`（サードパーティ）

### ディレクトリ構造例

```
my_project/
├── go.mod
├── go.sum
├── README.md
├── main.go
├── pkg/
│   └── utils/
│       └── helper.go
└── internal/
    └── app/
        └── app.go
```

### 参考
- [Go公式ドキュメント](https://go.dev/doc/)
- [Go modules公式ガイド](https://go.dev/blog/using-go-modules)

---

## Rust

### パッケージ管理
- **ツール:** `cargo`（標準）
- **依存管理:** `Cargo.toml` + `Cargo.lock`

### セットアップ

```bash
# プロジェクト作成
cargo new my-project
cd my-project

# 依存関係追加（Cargo.tomlを編集）
# [dependencies]
# serde = "1.0"

# ビルド
cargo build
```

### 実行

```bash
# 実行（デバッグモード）
cargo run

# リリースビルド
cargo build --release

# テスト
cargo test

# ドキュメント生成
cargo doc --open
```

### テスト
- **フレームワーク:** 標準のテスト機能
- **ベンチマーク:** `criterion`（サードパーティ）

### ディレクトリ構造例

```
my_project/
├── Cargo.toml
├── Cargo.lock
├── README.md
├── src/
│   ├── main.rs
│   ├── lib.rs
│   └── utils/
│       └── mod.rs
└── tests/
    └── integration_test.rs
```

### 参考
- [Rust公式ドキュメント](https://doc.rust-lang.org/book/)
- [cargo公式ガイド](https://doc.rust-lang.org/cargo/)

---

## その他の言語

プロジェクトで他の言語を使用する場合、以下のフォーマットで追加してください：

### [言語名]

#### パッケージ管理
- **ツール:** [ツール名]
- **依存管理:** [設定ファイル名]

#### セットアップ

```bash
# コマンド例
```

#### 実行

```bash
# コマンド例
```

#### テスト
- **フレームワーク:** [フレームワーク名]

#### 参考
- [公式ドキュメントへのリンク]

---

## まとめ

各言語のセクションを参照し、プロジェクトの `docs/process/DEVELOPMENT_PROCESS.md` に実行コマンドを追記してください。

また、プロジェクト固有のベストプラクティスがある場合は、このドキュメントに追記して、チーム全体で共有してください。
