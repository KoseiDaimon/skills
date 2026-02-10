/**
 * アイキャッチ画像（OGP）生成スクリプト
 * koseidaimon.com のブログ記事用
 *
 * Usage:
 *   node generate-ogp.mjs "記事タイトル" [カテゴリ名] [出力パス]
 *
 * Example:
 *   node generate-ogp.mjs "iPhoneでoverflow:hiddenが効かない問題" "JavaScript" "/tmp/ogp.png"
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const title = process.argv[2];
const category = process.argv[3] || "";
const outputPath = process.argv[4] || "/tmp/ogp.png";

if (!title) {
  console.error("Usage: node generate-ogp.mjs <title> [category] [output]");
  process.exit(1);
}

const fontData = readFileSync(join(__dirname, "NotoSansJP-Bold.ttf"));

// タイトルの長さに応じてフォントサイズを調整
function getTitleFontSize(text) {
  if (text.length <= 15) return 52;
  if (text.length <= 25) return 46;
  if (text.length <= 35) return 40;
  if (text.length <= 50) return 34;
  return 28;
}

const fontSize = getTitleFontSize(title);

const markup = {
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #04384c 0%, #065a6e 40%, #0a7e8c 70%, #87e7ff 100%)",
      padding: "60px 80px",
      fontFamily: "NotoSansJP",
      position: "relative",
    },
    children: [
      // 装飾: 左上の円
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: "-40px",
            left: "-40px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(135, 231, 255, 0.15)",
          },
        },
      },
      // 装飾: 右下の円
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(135, 231, 255, 0.1)",
          },
        },
      },
      // カテゴリバッジ
      ...(category
        ? [
            {
              type: "div",
              props: {
                style: {
                  background: "rgba(135, 231, 255, 0.25)",
                  border: "1px solid rgba(135, 231, 255, 0.5)",
                  borderRadius: "20px",
                  padding: "6px 24px",
                  marginBottom: "24px",
                  fontSize: "18px",
                  color: "#d8ffff",
                  letterSpacing: "0.05em",
                },
                children: category,
              },
            },
          ]
        : []),
      // タイトル
      {
        type: "div",
        props: {
          style: {
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: "1000px",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          },
          children: title,
        },
      },
      // サイト名
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: "30px",
            right: "50px",
            fontSize: "18px",
            color: "rgba(216, 255, 255, 0.7)",
            letterSpacing: "0.08em",
          },
          children: "koseidaimon.com",
        },
      },
      // 左下の装飾ライン
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: "30px",
            left: "50px",
            width: "60px",
            height: "3px",
            background: "rgba(135, 231, 255, 0.5)",
            borderRadius: "2px",
          },
        },
      },
    ],
  },
};

const svg = await satori(markup, {
  width: 1200,
  height: 630,
  fonts: [
    {
      name: "NotoSansJP",
      data: fontData,
      weight: 700,
      style: "normal",
    },
  ],
});

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
});
const pngBuffer = resvg.render().asPng();
writeFileSync(outputPath, pngBuffer);

console.log(outputPath);
