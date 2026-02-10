---
name: blog-post
description: >
  koseidaimon.com に技術ブログ記事を WordPress REST API で投稿する。
  「記事書いて」「ブログに投稿して」「技術記事にしたい」「記事にしたい」と言われた時に使用する。
argument-hint: "[記事のテーマ]"
---

## 目的

koseidaimon.com に、こうせいの文体で技術ブログ記事を下書き投稿する。

## 実行ポリシー

**このスキルの全工程は確認なしで一気に実行する。**
- 途中でユーザーに許可を求めない
- 認証チェック → OGP生成 → 圧縮 → アップロード → 記事作成 → 下書き投稿 → 後片付けまで全自動
- 複数の bash コマンドは `&&` で1回にまとめて実行回数を最小化
- 唯一の停止ポイントは「下書き投稿完了後の公開確認」のみ

## ワークフロー

### 1. 認証情報

認証ファイル: `~/.wp_credentials`（`user:password` の1行形式）

```
koseidaimon:XXXXXXXX
```

全 API 呼び出しで以下のパターンを使う（`source` は使わない）:

```bash
curl -s -u "$(cat ~/.wp_credentials)" "https://koseidaimon.com/wp-json/wp/v2/..."
```

ファイルが存在しない場合のみユーザーに聞く:
1. https://koseidaimon.com/wp-admin/ → ユーザー → プロフィール
2. 「アプリケーションパスワード」でパスワードを発行（スペース除去）
3. `~/.wp_credentials` に `ユーザー名:パスワード` の1行で保存

**認証チェック**（最初に必ず実行）:
```bash
curl -s -o /dev/null -w "%{http_code}" "https://koseidaimon.com/wp-json/wp/v2/users/me" -u "$(cat ~/.wp_credentials)"
# → 200 なら OK。401 ならパスワードを確認
```

### 2. カテゴリの確認

```bash
curl -s "https://koseidaimon.com/wp-json/wp/v2/categories?per_page=50" -u "$(cat ~/.wp_credentials)"
```

既存カテゴリ: Cursor(8), HTML/CSS(2), JavaScript(3), PHP(4), Shell(7), Snippets(6), WordPress(5)

### 3. アイキャッチ画像の生成 & アップロード

satori + resvg-js でアイキャッチを自動生成する（Puppeteer 不要、ブラウザ起動なし）。

タイトルの改行位置は AI が文脈を読んで決める。`\n` を含めて渡すと改行される。

改行ルール:
- 助詞（で、が、に、を、は等）の後で切る
- 「」【】のペアは中で切らない（開き括弧の前 or 閉じ括弧の後で改行）
- 各行が均等な長さになるよう調整
- 例: `"【WordPress】スマイルサーバーで\n「チェックサムが一致しません」\nエラーが出た時の対処法"`

```bash
# 画像生成（1200x630 Retina 2x PNG）
node ~/.claude/skills/blog-post/generate-ogp.mjs "タイトル1行目\n2行目\n3行目" "カテゴリ名" "/tmp/ogp.png"

# WebP に圧縮（PNG → WebP ~70KB）
python3 -c "from PIL import Image; img=Image.open('/tmp/ogp.png'); img.save('/tmp/ogp.webp','WEBP',quality=90)"

# WordPress メディアライブラリにアップロード（レスポンスはファイルに保存）
curl -s -X POST "https://koseidaimon.com/wp-json/wp/v2/media" \
  -u "$(cat ~/.wp_credentials)" \
  -H "Content-Disposition: attachment; filename=ogp-SLUG.webp" \
  -H "Content-Type: image/webp" \
  --data-binary @/tmp/ogp.webp \
  -o /tmp/media-resp.json
```

レスポンスは `/tmp/media-resp.json` からパースし、`id` を記事の `featured_media` に設定する。

### 4. 記事の作成

下記の文体ルールに従って記事コンテンツを作成し、WordPress ブロック形式（`<!-- wp:xxx -->` コメント付き）で組み立てる。

### 5. REST API で下書き投稿

```bash
curl -s -X POST "https://koseidaimon.com/wp-json/wp/v2/posts" \
  -u "$(cat ~/.wp_credentials)" \
  -H "Content-Type: application/json" \
  -d @post.json
```

- **status は必ず `draft`** にする（いきなり公開しない）
- **slug は英語のケバブケースで設定する**（例: `ios-modal-scroll-lock-fix`）
- `featured_media` にステップ3でアップロードした画像の ID を設定
- 投稿後、編集画面の URL を返す

### 6. 公開確認

下書き投稿後、ユーザーに確認する:

> 「下書き投稿しました！ → [編集画面URL]
> 確認して問題なければ公開しますか？」

**ユーザーが公開を承認した場合のみ**、ステップ7・8に進む。

### 7. 公開

```bash
curl -s -X POST "https://koseidaimon.com/wp-json/wp/v2/posts/POST_ID" \
  -u "$(cat ~/.wp_credentials)" \
  -H "Content-Type: application/json" \
  -d '{"status":"publish"}'
```

### 8. X（Twitter）シェア

公開後、ツイート用の compose URL を生成してユーザーに提示する。

```
https://x.com/intent/tweet?text=エンコード済みテキスト&url=エンコード済み記事URL
```

ツイート文テンプレート:
```
記事タイトル（短縮可）
記事URL
#関連ハッシュタグ
```

- text と url はそれぞれ `encodeURIComponent` でエンコード
- ハッシュタグはカテゴリに応じて自動付与（例: JavaScript → #JavaScript #Web開発）
- ユーザーがクリックするだけで投稿画面が開く

### 9. 後片付け

- 一時ファイル（post.json, /tmp/ogp.png, /tmp/ogp.webp, /tmp/media-resp.json）を削除

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

## API 呼び出しルール

- 認証は必ず `-u "$(cat ~/.wp_credentials)"` を使う（`source` や環境変数は使わない）
- **最初の API 呼び出し前に認証チェック**（`users/me` で 200 確認）を行う
- レスポンスは必ずエラーチェックしてからパースする:
  ```python
  # ❌ Bad: KeyError で落ちる
  d['id']
  # ✅ Good: エラーレスポンスを先にチェック
  if 'code' in d: print(f"Error: {d['message']}")
  else: print(d['id'])
  ```
- エラー時はレスポンス本文を確認して原因を特定してからリトライ

## アンチパターン

- ❌ status を `publish` にする → 必ず `draft`
- ❌ `source ~/.wp_credentials` で環境変数経由の認証 → `$(cat ~/.wp_credentials)` を使う
- ❌ AI っぽいフォーマルな文体で書く
- ❌ カテゴリを確認せずに投稿する
- ❌ ブロックコメント（`<!-- wp:xxx -->`）なしの生 HTML で投稿する
- ❌ API レスポンスを `d['key']` でパース → `d.get('key')` またはエラーチェック後にアクセス
