// Netlify Scheduled Function: 毎日1回ビルドを起動する
// prebuild（scripts/generate-sitemap.js）が走り、sitemap.xml が
// Supabaseの最新の公開記事で再生成される
// スケジュールは netlify.toml の [functions."rebuild-sitemap"] を参照

exports.handler = async () => {
  const hookUrl = process.env.BUILD_HOOK_URL;

  if (!hookUrl) {
    console.error("[rebuild] ❌ BUILD_HOOK_URL が未設定");
    return { statusCode: 500 };
  }

  try {
    const res = await fetch(hookUrl, { method: "POST", body: "{}" });

    if (!res.ok) {
      console.error(`[rebuild] ❌ Build hook 失敗: HTTP ${res.status}`);
      return { statusCode: 500 };
    }

    console.log("[rebuild] ✅ ビルドを起動しました");
    return { statusCode: 200 };
  } catch (err) {
    console.error(`[rebuild] ❌ Build hook リクエストエラー: ${err.message}`);
    return { statusCode: 500 };
  }
};
