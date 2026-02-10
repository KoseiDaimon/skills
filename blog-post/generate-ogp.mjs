/**
 * アイキャッチ画像（OGP）生成スクリプト — Puppeteer 版
 * koseidaimon.com のブログ記事用
 *
 * Usage:
 *   node generate-ogp.mjs "記事タイトル" [カテゴリ名] [出力パス]
 */

import puppeteer from "puppeteer";
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

const templatePath = join(__dirname, "ogp-template.html");
const url = `file://${templatePath}?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`;

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--font-render-hinting=none",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: outputPath, type: "png" });
await browser.close();

console.log(outputPath);
