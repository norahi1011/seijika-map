#!/usr/bin/env node
"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");

// ローカル開発時に .env を読み込む（Netlifyビルド時はenv varが既に設定されている）
try {
  require("dotenv").config();
} catch (_) {}

const SITE_URL = "https://seijika-map.netlify.app";
const OUTPUT_PATH = path.join(__dirname, "..", "public", "sitemap.xml");

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
];

function fetchArticleSlugs() {
  return new Promise((resolve, reject) => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      reject(new Error("REACT_APP_SUPABASE_URL または REACT_APP_SUPABASE_ANON_KEY が未設定"));
      return;
    }

    const apiUrl = new URL(
      `/rest/v1/articles?is_published=eq.true&select=slug,published_at&order=published_at.desc`,
      supabaseUrl
    );

    const options = {
      hostname: apiUrl.hostname,
      path: apiUrl.pathname + apiUrl.search,
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Supabase APIエラー: HTTP ${res.statusCode} - ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSONパース失敗: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error("Supabase APIタイムアウト（10秒）"));
    });
    req.end();
  });
}

function buildXml(articles) {
  const urlEntries = [];

  for (const page of STATIC_PAGES) {
    urlEntries.push(`  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  for (const article of articles) {
    const lastmod = article.published_at
      ? article.published_at.slice(0, 10)
      : "";
    urlEntries.push(`  <url>
    <loc>${SITE_URL}/articles/${article.slug}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;
}

async function main() {
  let articles = [];

  try {
    articles = await fetchArticleSlugs();
    console.log(`[sitemap] Supabaseから ${articles.length} 件の公開記事を取得`);
  } catch (err) {
    console.warn(`[sitemap] ⚠️  Supabase取得失敗（静的ページのみでsitemap生成）: ${err.message}`);
    articles = [];
  }

  const xml = buildXml(articles);
  fs.writeFileSync(OUTPUT_PATH, xml, "utf8");

  const total = STATIC_PAGES.length + articles.length;
  console.log(`[sitemap] ✅ public/sitemap.xml 生成完了 (合計 ${total} URL: 固定${STATIC_PAGES.length} + 記事${articles.length})`);
}

main().catch((err) => {
  console.error(`[sitemap] ❌ 予期しないエラー: ${err.message}`);
  process.exit(1);
});
