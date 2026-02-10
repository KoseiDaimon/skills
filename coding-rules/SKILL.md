---
name: coding-rules
description: >
  DaiCSS・HTML・PHP・JS・Git のコーディング規約。
  コードを書く・レビューする・修正する際に常に参照される。
  全案件共通のルール。プロジェクト固有ルールは各案件の AI_CODING_RULES.md を参照。
---

## 基本原則

- **回答・コメント・ドキュメントは日本語**で書く
- **勝手に予想して実装しない**（必要情報は質問する）
- ルールが衝突した場合は「事故を防ぐ」側を優先する

---

## HTML / マークアップ

### 基本原則

- 見た目ではなく**要素の意味**で選ぶ
- アクセシビリティ（キーボード操作・スクリーンリーダー）とSEOを前提にする

### ランドマーク

- `<header>` / `<nav>` / `<main>` / `<footer>` を適切に使う
- `<main>` は **1ページに1つ**

```html
<header class="l-header">
  <nav class="l-nav" aria-label="メインナビゲーション">
    <ul class="l-nav__list">
      <li class="l-nav__item"><a href="/">ホーム</a></li>
    </ul>
  </nav>
</header>
<main id="main" class="l-main">...</main>
<footer class="l-footer">...</footer>
```

### 見出し

- **h1は1ページに1つ**、**階層を飛ばさない**

### リスト

- 必ず `<ul>` / `<ol>` / `<dl>` を使う

### リンクとボタン

- **遷移**: `<a href="...">`
- **アクション**: `<button type="button">`

### フォーム

- `label` と `input` を `for` / `id` で関連付ける

### 画像

- `alt` 必須（装飾は `alt=""`）
- `width` / `height` 必須（CLS対策）
- `loading="lazy"` は基本付ける（ファーストビュー除く）

### ARIA

- セマンティック要素があるなら `role` 不要
- **装飾目的の空タグ**には `aria-hidden="true"`

---

## SCSS/CSS（DaiCSS）

### 命名（接頭辞）

- `m-`: Module（UIコンポーネント）
- `l-`: Layout
- `u-`: Utility
- `js-`: JavaScript連携（**スタイルは当てない**）
- `is-*`: 状態（JSで付け外し）

### クラスの記述順序

`m-` → `l-` → `u-` → `js-`

### 略語・動詞始まり禁止

- `btn` → `button`
- `m-show-modal` → `m-modal-trigger`

### セレクタ・ネスト

- **`&` 使用禁止**（mixin内部のみ例外）
- ネスト禁止（必要最小限のみ）
- IDセレクタ・タグセレクタ原則禁止

```scss
/* ✅ */
.m-card { display: flex; }
.m-card__title { font-size: rem(24); }
.m-card::before { content: ""; }

/* ❌ */
.m-card {
  &__title { }
  &::before { }
}
```

### hover

`:hover` 直書き禁止。**`@include hover { }` を使用**。

### レスポンシブ

`@include mq("md")` を使用（PCファースト、767px以下に適用）。

### 単位

`rem()` を通す。例外: `line-height`, `opacity`, `z-index`, `aspect-ratio`。

### カラー

- **グローバルカスタムプロパティ**を使用
- 透明度: `rgb(from var(--color__main) r g b / 0.3)`
- 許容: `#fff`, `#000`, `transparent`, `rgb(0 0 0 / 0.1)`

### フォント

- **グローバルカスタムプロパティ**を使用
- 命名: `--font-family__フォント名`

### トランジション

`transition: all` 禁止。対象プロパティを明示。

### background

ショートハンド禁止。`background-color` 等で個別指定。

### padding

ショートハンド禁止。`padding-inline` / `padding-block` / `padding-top` / `padding-bottom`。

### 余白（margin禁止方針）

- **`margin` 原則禁止**（例外: `margin-inline: auto`、記事コンテンツ内）
- **下方向マージン禁止**（`margin-bottom` / `margin-block-end`）
- 要素間余白は `padding` または `gap`
- 方向は**上/左を基本**

```scss
/* ✅ */ .m-card__title { padding-top: rem(16); }
/* ✅ */ .m-list { display: flex; flex-direction: column; gap: rem(16); }
/* ❌ */ .m-card__image { margin-bottom: rem(16); }
```

### レイアウト運用

- インナー: `l-inner`
- 背景色: `u-bg--*`
- PC/SP出し分け: `u-only--*`

### CSS変数命名

- グローバル: `--[カテゴリ]__[名前]`
- ローカル: `--_[カテゴリ]__[名前]`

### プロパティ順序

1. ローカル変数 → 2. 配置 → 3. ボックスモデル → 4. 見た目 → 5. テキスト → 6. その他 → 7. メディアクエリ → 8. hover

### SVG（アイコン）

`<symbol>` + `<use>` 方式。

### モジュールの再利用

複数ページで同じUIパーツを使う場合、既存モジュールのクラスをそのまま使わない。共通モジュールとして切り出す。

### AIがやりがちなNG

- `&` 利用、`:hover` 直書き、`transition: all`
- `background` / `padding` ショートハンド
- タイトル下に `margin-bottom`
- 既存モジュールのクラスを別ページで直接再利用

---

## JavaScript

### エクスポート

`export { ... }` を**ファイル末尾にまとめる**。

### コメント

変更が必要な設定値・URLには変更方法を併記する。

---

## PHP / WordPress

### ファイル命名

- 機能ファイル: `kebab-case.php`
- テンプレートパーツ: `m-*.php`
- ページテンプレート: `page-*.php`

### Template Name

**日本語**で書く。

### 命名

関数名は **snake_case**。

### DocBlock

全ての関数に DocBlock を書く。

### ファイル読み込み

`require_once` + テーマディレクトリのパス。

### エスケープ（必須）

- テキスト: `esc_html()`
- 属性: `esc_attr()`
- URL: `esc_url()`（プロジェクト専用ヘルパーがあればそちら優先）

### テンプレートパーツ

`get_template_part()` を使用。

### 画像出力

1. `alt` 必須
2. `width` / `height` 必須（**表示サイズ**を指定）
3. PNG/JPEGは `<picture>` でWebP対応

---

## Git コミットメッセージ

- プレフィックス必須: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- **命令形（〜する）**、**日本語**、**50文字以内**
- 文末に句点を付けない

```text
feat: タグ選択機能を追加し、複数選択を可能にする
fix: OAuthリダイレクト後のトークン取得エラーを修正
```

---

## アンチパターン

- `&` でBEMセレクタを組み立てる
- `:hover` を直書きする
- `transition: all` / `background` ショートハンド / `padding` ショートハンド
- `margin-bottom` で要素間余白を作る
- 既存モジュールのクラスを別ページで直接使い回す
- `alt` / `width` / `height` なしの画像
