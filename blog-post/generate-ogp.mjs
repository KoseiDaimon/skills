/**
 * OGP画像生成 — satori + resvg-js 版（Puppeteer不要）
 * Usage: node generate-ogp-satori.mjs "タイトル1行目\n2行目" "カテゴリ" "output.png"
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rawTitle = (process.argv[2] || "テストタイトル").replace(/\\n/g, "\n");
const category = process.argv[3] || "";
const output = process.argv[4] || "/tmp/ogp.png";

const titleLines = rawTitle.split("\n");

// フォント読み込み
const fontData = readFileSync(join(__dirname, "NotoSansJP-Black.otf"));

// タイトル文字数でフォントサイズ決定
const totalLen = rawTitle.replace(/\n/g, "").length;
let titleSize;
if (totalLen <= 15) titleSize = 80;
else if (totalLen <= 20) titleSize = 72;
else if (totalLen <= 28) titleSize = 64;
else if (totalLen <= 38) titleSize = 56;
else titleSize = 48;

// satori用 JSX風オブジェクト
const markup = {
  type: "div",
  props: {
    style: {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #04384c 0%, #065a6e 35%, #0a7e8c 65%, #4dbdcf 100%)",
      fontFamily: "NotoSansJP",
      position: "relative",
      overflow: "hidden",
    },
    children: [
      // 装飾円 c1 (左上)
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(135, 231, 255, 0.12)",
          },
        },
      },
      // 装飾円 c2 (右下)
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: "-60px",
            right: "120px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(135, 231, 255, 0.12)",
          },
        },
      },
      // 装飾円 c3 (右上)
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: "40px",
            right: "-40px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: "rgba(135, 231, 255, 0.08)",
          },
        },
      },
      // 底辺ライン
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: "linear-gradient(90deg, #87e7ff 0%, #4dbdcf 50%, transparent 100%)",
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
                  display: "flex",
                  background: "rgba(135, 231, 255, 0.2)",
                  border: "1.5px solid rgba(135, 231, 255, 0.45)",
                  borderRadius: "6px",
                  padding: "6px 20px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#b8f0ff",
                  letterSpacing: "0.06em",
                  marginBottom: "24px",
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: `${titleSize}px`,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.25)",
          },
          children: titleLines.map((line) => ({
            type: "span",
            props: {
              style: { textAlign: "center" },
              children: line,
            },
          })),
        },
      },
      // 左下アクセントライン
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: "28px",
            left: "40px",
            width: "50px",
            height: "3px",
            background: "rgba(135, 231, 255, 0.4)",
            borderRadius: "2px",
          },
        },
      },
      // サイト名
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            bottom: "24px",
            right: "40px",
            fontSize: "15px",
            fontWeight: 400,
            color: "rgba(184, 240, 255, 0.55)",
            letterSpacing: "0.1em",
          },
          children: "koseidaimon.com",
        },
      },
    ],
  },
};

// SVG生成
const svg = await satori(markup, {
  width: 1200,
  height: 630,
  fonts: [
    {
      name: "NotoSansJP",
      data: fontData,
      weight: 900,
      style: "normal",
    },
  ],
});

// SVG → PNG
const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 2400 }, // Retina 2x
});
const pngData = resvg.render();
const pngBuffer = pngData.asPng();

writeFileSync(output, pngBuffer);
console.log(output);
