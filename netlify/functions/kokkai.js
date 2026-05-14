// Netlify Function: 国会APIの中継サーバー
// ブラウザからのCORSを回避してサーバーサイドで国会APIにアクセス

exports.handler = async (event) => {
  const { type, limit = 10, from } = event.queryStringParameters || {};
  
  const fromDate = from || (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().slice(0, 10);
  })();

  try {
    let url;
    if (type === "meeting") {
      url = `https://kokkai.ndl.go.jp/api/meeting?maximumRecords=${limit}&recordPacking=json&from=${fromDate}`;
    } else {
      url = `https://kokkai.ndl.go.jp/api/speech?maximumRecords=${limit}&recordPacking=json&from=${fromDate}`;
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "seijika-review/1.0 (https://seijika-review.netlify.app)" }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `API error: ${res.status}` }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300", // 5分キャッシュ
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
