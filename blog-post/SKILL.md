---
name: blog-post
description: >
  koseidaimon.com に技術ブログ記事を WordPress REST API で投稿する。
  「記事書いて」「ブログに投稿して」「技術記事にしたい」「記事にしたい」と言われた時に使用する。
argument-hint: "[記事のテーマ]"
---

## 目的

koseidaimon.com に、こうせいの文体で技術ブログ記事を下書き投稿する。

## ワークフロー

### 1. 認証情報の取得

アプリケーションパスワードをユーザーに聞く。

```
サイト: https://koseidaimon.com
認証: WordPress アプリケーションパスワード（Basic Auth）
```

手順の案内:
1. https://koseidaimon.com/wp-admin/ → ユーザー → プロフィール
2. 「アプリケーションパスワード」でパスワードを発行
3. ユーザー名とパスワードを受け取る

### 2. カテゴリの確認

```bash
curl -s "https://koseidaimon.com/wp-json/wp/v2/categories?per_page=50" -u "USER:PASS"
```

既存カテゴリ: Cursor(8), HTML/CSS(2), JavaScript(3), PHP(4), Shell(7), Snippets(6), WordPress(5)

### 3. アイキャッチ画像の生成 & アップロード

スキルディレクトリの `generate-ogp.mjs` でアイキャッチを自動生成する。

```bash
# 画像生成（1200x630 PNG）
node ~/.claude/skills/blog-post/generate-ogp.mjs "記事タイトル" "カテゴリ名" "/tmp/ogp.png"

# WordPress メディアライブラリにアップロード
curl -s -X POST "https://koseidaimon.com/wp-json/wp/v2/media" \
  -u "USER:PASS" \
  -H "Content-Disposition: attachment; filename=ogp-SLUG.png" \
  -H "Content-Type: image/png" \
  --data-binary @/tmp/ogp.png
```

レスポンスの `id` を記事の `featured_media` に設定する。

### 4. 記事の作成

下記の文体ルールに従って記事コンテンツを作成し、WordPress ブロック形式（`<!-- wp:xxx -->` コメント付き）で組み立てる。

### 5. REST API で下書き投稿

```bash
curl -s -X POST "https://koseidaimon.com/wp-json/wp/v2/posts" \
  -u "USER:PASS" \
  -H "Content-Type: application/json" \
  -d @post.json
```

- **status は必ず `draft`** にする（いきなり公開しない）
- `featured_media` にステップ3でアップロードした画像の ID を設定
- 投稿後、編集画面の URL を返す

### 6. 後片付け

- 一時ファイルを削除
- 「アプリケーションパスワードを取り消してください」と案内

## 文体ルール（MUST）

こうせいの文体で書く。AI っぽい文章は NG。

### トーン
- カジュアルで元気、体験ベース
- 実際にハマった経験として語る
- 失敗もオープンに晒す

### 表記
- `！！` は盛り上がりポイント（結論・驚き・締め）で使う。全文二重にしない
- 普通の文では `！` 単体で OK。ここぞという時だけ `！！`
- ❌ `〜です。〜ます。` の連続 → ✅ 体言止め・口語を混ぜる
- ✅ `...！！`（三点リーダー+二重感嘆符）も盛り上がり時に
- ✅ `🐧` を冒頭と締めに使う
- ✅ `✅` `❌` でポイント整理
- ✅ 「〜しちゃう」「〜やっとけばよかった」等のくだけた表現
- ✅ 「〜やっていきましょー！！」の勢い

### 構成テンプレート

```
導入（何の話か + 実体験で掴む + 🐧）
## まず結論（コード or 結論を先に）
## 何が起きたか（体験ベースで問題を説明）
## 原因（技術的に正確に）
## 解決策の解説（なぜ動くか）
## やりがちなNG（テーブルで整理）
## まとめ（箇条書き）
## 参考（リンク集）
締め: 「以上！！\n誰かのお役に立てれば嬉しいです🐧」
```

### NG表現（AI っぽくなるので禁止）
- ❌ 「〜について解説します」
- ❌ 「本記事では〜を紹介します」
- ❌ 「〜することが重要です」
- ❌ 「〜と言えるでしょう」
- ❌ 過剰な丁寧語の連続

## アンチパターン

- ❌ status を `publish` にする → 必ず `draft`
- ❌ 認証情報をファイルに残す → 一時ファイルは即削除
- ❌ AI っぽいフォーマルな文体で書く
- ❌ カテゴリを確認せずに投稿する
- ❌ ブロックコメント（`<!-- wp:xxx -->`）なしの生 HTML で投稿する
