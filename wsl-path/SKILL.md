---
name: wsl-path
description: >
  WSL2 環境で Windows パスが渡された時に自動でマウントパスに変換する。
  C:\Users\... や c:/Users/... のようなパスが会話に出た時に使用する。
---

## 目的

Windows パスを WSL2 のマウントパスに変換してファイルにアクセスする。

## ルール

Windows パスが渡されたら、以下の変換を自動で行う:

| Windows パス | WSL2 パス |
|-------------|-----------|
| `C:\Users\...` | `/mnt/c/Users/...` |
| `c:/Users/...` | `/mnt/c/Users/...` |
| `D:\path\...` | `/mnt/d/path/...` |

- ドライブレター（C, D など）は小文字に変換
- バックスラッシュ `\` はスラッシュ `/` に変換
- ユーザーに確認せず自動で変換して Read する
- ユーザーの Windows ユーザー名: `hikari`

### 変換例

```
c:/Users/hikari/Desktop/screenshot.png
→ /mnt/c/Users/hikari/Desktop/screenshot.png

C:\Users\hikari\Documents\file.pdf
→ /mnt/c/Users/hikari/Documents/file.pdf
```

## アンチパターン

- ❌ Windows パスをそのまま Read に渡す（存在しないエラーになる）
- ❌ ユーザーに「WSL パスを教えてください」と聞く
