---
name: ios-scroll-lock
description: >
  モーダル・オーバーレイ表示時のスクロールロックを iOS Safari 対応で実装する。
  overflow:hidden だけでは iOS でスクロールが止まらない問題の解決策。
  「モーダルのスクロールロック」「iOS でスクロールできてしまう」「背景スクロール防止」と言われた時に使用する。
---

## 目的

モーダル表示中の背景スクロールを iOS Safari を含む全ブラウザで確実に防止する。

## 背景

iOS Safari は `overflow: hidden` をタッチスクロールに適用しない（WebKit Bug #153852）。
`position: fixed` で body を固定し、物理的にスクロール対象をなくす方式が必要。

## 実装パターン

### JS（vanilla）

```javascript
let savedScrollY = 0;

function lockScroll() {
  savedScrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.width = '100%';
}

function unlockScroll() {
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('position');
  document.body.style.removeProperty('top');
  document.body.style.removeProperty('width');
  window.scrollTo(0, savedScrollY);
}
```

### 動作原理

1. **ロック時**: `position: fixed` で body をビューポートに固定。`top: -Npx` で見た目の位置を維持
2. **解除時**: プロパティを全除去し `scrollTo()` で元の位置に復帰

### CSS 補強（任意）

`overscroll-behavior` を併用すると iOS 16+ でより堅牢になる：

```css
body.is-scroll-locked {
  overscroll-behavior: none;
}
```

## アンチパターン

- ❌ `overflow: hidden` だけで済ませる → iOS Safari で効かない
- ❌ `html { overflow: hidden }` だけで済ませる → 同様に iOS で効かない
- ❌ `touch-action: none` のみ → 一部ブラウザで効かない
- ❌ `width: 100%` を忘れる → body の幅が潰れてレイアウト崩れ
- ❌ `scrollTo()` を忘れる → 解除時にページトップに飛ぶ
