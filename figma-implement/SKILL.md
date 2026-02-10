---
name: figma-implement
description: >
  Figma デザインをコードに実装する際のワークフローとルール。
  Figma URL が渡された時、「デザイン実装して」「Figmaから作って」と言われた時に使用する。
  figma:implement-design プラグインスキルと併用する。
argument-hint: "[Figma URL or nodeId]"
---

## 目的

Figma MCP を使ってデザインを正確にコードへ変換するための手順と原則。

---

## ワークフロー（7ステップ）

Figma デザインを実装する際は、以下のステップを**必ず順番に実行**する。

| ステップ | ツール | 目的 |
|---------|--------|------|
| 1 | URLからnodeId抽出 | `?node-id=1-2` → `1:2` |
| 2 | `get_design_context` | レイアウト・色・フォント情報取得 |
| 3 | `get_screenshot` | 視覚的な確認用スクリーンショット取得 |
| 4 | アセットダウンロード | 画像・アイコンをFigmaから取得 |
| 5 | プロジェクト規約に変換 | コーディングルール・既存モジュールに合わせる |
| 6 | 1:1の視覚的一致 | デザイントークン使用、ハードコード回避 |
| 7 | 検証 | スクリーンショットと比較確認 |

**重要:** `get_design_context` と `get_screenshot` の両方を取得してから実装を開始する。

---

## プロジェクト固有マッピングの確認（必須）

実装前に **`.claude/skills/figma-mapping/`** が存在するか確認する。
存在する場合、Figma コンポーネント名と既存モジュールの対応表が定義されている。

**既存モジュールがマッピングされていれば、新規作成せずそれを使う。**

新しいモジュールを作った場合は、マッピングファイルに追記すること。

---

## 認証エラー時の対応

`requires re-authorization (token expired)` エラーが出た場合は**実装を中断してユーザーに通知**する。
既存のコードパターンや推測で実装を進めない。

---

## ツールの使い分け

| ツール | 用途 |
|--------|------|
| `get_design_context` | 構造・スタイル情報（まずこれ） |
| `get_screenshot` | 視覚確認（実装中に何度も参照） |
| `get_metadata` | 出力が大きい場合に構造把握 |
| `get_variable_defs` | デザイントークン取得 |

---

## 画像・アイコンのダウンロード

Figma デザインから画像やアイコンを実装する際は、**自作せずに Figma からダウンロード**する。

```bash
# Figma MCP で取得した画像URLからダウンロード
curl -L "http://localhost:3845/assets/xxxx.png" -o source/images/xxx.png

# SVGアイコンの場合
curl -L "http://localhost:3845/assets/xxxx.svg" -o /tmp/icon.svg
cat /tmp/icon.svg  # 内容を確認してインラインで使用
```

---

## 実装時の原則

- **既存コンポーネント再利用を優先** - 新規作成より既存モジュール活用
- **Figma出力はそのまま使わない** - プロジェクトのコーディング規約に変換する
- **ハードコード禁止** - 色・フォントはカスタムプロパティ使用
- **視覚的一致を優先** - デザイントークンと仕様が矛盾したら、トークン優先しつつ最小限調整

---

## よくある問題と対処

| 問題 | 対処 |
|------|------|
| 出力が切れる | `get_metadata` で構造確認 → 個別ノード取得 |
| デザインと合わない | `get_screenshot` と並べて比較 |
| アセットが読み込めない | URLを直接curlでダウンロード |
| トークン値が違う | プロジェクトのトークン優先、微調整で視覚一致 |

---

## Figma URL の読み方

```
https://figma.com/design/:fileKey/:fileName?node-id=1-2
                         ^^^^^^^^                  ^^^
                         fileKey                   nodeId（1:2 に変換）
```

- `node-id=1-2` → API呼び出し時は `1:2` に変換
- ブランチURL: `/branch/:branchKey/` がある場合は branchKey を fileKey として使用

---

## アンチパターン

- `get_design_context` だけで実装を始める（`get_screenshot` も必ず取る）
- Figma 出力の Tailwind/React コードをそのままコピーする
- アイコンや画像を手書きで再現する（Figma からダウンロードする）
- マッピング表を確認せず新規モジュールを作る
