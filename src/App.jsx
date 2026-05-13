import { useState, useEffect } from "react";

// Supabase接続
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

async function supabaseFetch(table, options = {}) {
  const { filter, order, limit } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  if (filter) url += `&${filter}`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

async function supabaseInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  return res.ok;
}

// ============================================================
// データ定義
// ============================================================
const POLITICIANS = [
  { id: 1, name: "田中 一郎", kana: "たなか いちろう", initials: "田中", party: "自民党", house: "衆議院", district: "東京1区", prefecture: "東京都", terms: 5, rating: 4.7, reviews: 1243, attendance: 96, questions: 312, laws: 14, funds: 4200, color: "#EFF6FF", tc: "#1D4ED8", badges: ["委員長経験","10年以上"], born: 1968, edu: "東京大学法学部", committee: "経済産業委員会", firstElected: 2005 },
  { id: 2, name: "佐藤 美咲", kana: "さとう みさき", initials: "佐藤", party: "立憲民主", house: "参議院", district: "比例代表", prefecture: "東京都", terms: 2, rating: 4.4, reviews: 876, attendance: 91, questions: 198, laws: 5, funds: 2800, color: "#FDF2F8", tc: "#BE185D", badges: ["SNS活発","子育て政策"], born: 1980, edu: "早稲田大学政治経済学部", committee: "厚生労働委員会", firstElected: 2019 },
  { id: 3, name: "鈴木 健太", kana: "すずき けんた", initials: "鈴木", party: "公明党", house: "衆議院", district: "大阪3区", prefecture: "大阪府", terms: 3, rating: 4.2, reviews: 654, attendance: 94, questions: 154, laws: 8, funds: 3100, color: "#FFFBEB", tc: "#B45309", badges: ["福祉専門","出席率高"], born: 1975, edu: "関西大学法学部", committee: "厚生労働委員会", firstElected: 2012 },
  { id: 4, name: "山本 雄二", kana: "やまもと ゆうじ", initials: "山本", party: "自民党", house: "衆議院", district: "神奈川5区", prefecture: "神奈川県", terms: 1, rating: 4.0, reviews: 312, attendance: 88, questions: 87, laws: 2, funds: 1500, color: "#F0FDF4", tc: "#15803D", badges: ["若手注目","デジタル"], born: 1990, edu: "慶應義塾大学総合政策学部", committee: "デジタル社会形成特別委員会", firstElected: 2021 },
  { id: 5, name: "中村 花子", kana: "なかむら はなこ", initials: "中村", party: "日本維新", house: "参議院", district: "大阪府", prefecture: "大阪府", terms: 1, rating: 3.8, reviews: 241, attendance: 89, questions: 112, laws: 3, funds: 1200, color: "#FFF7ED", tc: "#C2410C", badges: ["改革派","財政再建"], born: 1985, edu: "大阪大学経済学部", committee: "財政金融委員会", firstElected: 2022 },
];

const VOTES = [
  { bill: "子ども・子育て支援法改正案", date: "2025-06-12", result: "賛成", summary: "少子化対策として保育サービス拡充を図る改正案。賛成多数で可決。" },
  { bill: "経済安全保障推進法改正案", date: "2025-05-28", result: "賛成", summary: "半導体・重要物資のサプライチェーン強化を目的とした改正案。" },
  { bill: "最低賃金法改正案（野党提出）", date: "2025-05-14", result: "反対", summary: "最低賃金を時給1500円に引き上げる野党提出の改正案。否決。" },
  { bill: "地方自治法改正案", date: "2025-04-30", result: "欠席", summary: "地方議会のデジタル化推進を目的とした改正案。" },
  { bill: "防衛費増額財源確保法案", date: "2025-04-10", result: "賛成", summary: "防衛費GDP比2%達成に向けた財源確保のための法案。" },
];

const REVIEWS = [
  { user: "東京在住・40代", rating: 5, date: "3日前", body: "地元の陳情に対して秘書を通じて丁寧に対応してもらいました。子育て支援の政策には特に力を入れており、地域の保育所問題でも動いてくれた実績があります。", tags: ["地元密着", "対応が早い"], helpful: 42 },
  { user: "匿名ユーザー", rating: 4, date: "1週間前", body: "演説はわかりやすく、政策の説明も丁寧。ただ党の方針に従う投票が多く、独自色が弱い印象。もう少し自分の意見を出してほしい。", tags: ["説明が丁寧", "党従属気味"], helpful: 18 },
  { user: "神田区民", rating: 5, date: "2週間前", body: "街頭演説を聞く機会がありましたが、経済政策についての知識が深く説得力がありました。地元のイベントにも積極的に顔を出している姿勢は好感が持てます。", tags: ["経済政策", "地元活動"], helpful: 27 },
];

const NEWS_FEED = [
  { id: 1, politician: "田中 一郎", source: "朝日新聞", date: "2025-06-14", title: "田中議員、子育て支援法案で政府に質問「財源の根拠を示せ」", summary: "衆院経済産業委員会で田中議員が少子化対策の財源について追及。政府側の答弁は曖昧さが残った。", url: "#" },
  { id: 2, politician: "佐藤 美咲", source: "毎日新聞", date: "2025-06-12", title: "佐藤議員、保育士処遇改善を訴え 参院厚労委で質疑", summary: "保育士の賃金水準が全産業平均を大きく下回る現状を指摘し、抜本的な処遇改善を求めた。", url: "#" },
  { id: 3, politician: "山本 雄二", source: "日経新聞", date: "2025-06-10", title: "山本議員、マイナンバー活用拡大を提言 デジタル特委で", summary: "行政手続きのデジタル化加速に向け、マイナンバーカードの利活用範囲拡大を提言した。", url: "#" },
];

const KOKKAI_FEED = [
  { id: 1, date: "2025-06-14", type: "質問主意書", politician: "田中 一郎", title: "少子化対策の財源確保に関する質問主意書", summary: "AI要約: 少子化対策として提案されている給付措置の財源について、具体的な確保方法と持続可能性を政府に問う内容。特に社会保険料負担増への懸念を指摘している。", url: "#" },
  { id: 2, date: "2025-06-12", type: "委員会質疑", politician: "佐藤 美咲", title: "厚生労働委員会 保育士処遇改善に関する質疑", summary: "AI要約: 保育士の平均給与が全産業平均より約7万円低い現状を指摘。公定価格の引き上げによる処遇改善の具体的スケジュールを求めた質疑。", url: "#" },
  { id: 3, date: "2025-06-10", type: "本会議投票", politician: "全議員", title: "子ども・子育て支援法改正案 本会議採決", summary: "AI要約: 賛成276、反対153で可決。与党と一部野党が賛成に回り、可決成立。附帯決議として財源の透明性確保が求められた。", url: "#" },
];

const KOKKAI_SCHEDULE = [
  { date: "2025-06-17", type: "本会議", title: "経済安全保障推進法改正案 第二読会", time: "13:00" },
  { date: "2025-06-18", type: "委員会", title: "経済産業委員会 一般質疑", time: "09:00" },
  { date: "2025-06-19", type: "委員会", title: "厚生労働委員会 参考人質疑", time: "10:00" },
  { date: "2025-06-20", type: "本会議", title: "内閣不信任案 採決", time: "15:00" },
];

const PARTY_STYLE = {
  "自民党":   { bg: "#EFF6FF", text: "#1D4ED8" },
  "立憲民主": { bg: "#FDF2F8", text: "#BE185D" },
  "公明党":   { bg: "#FFFBEB", text: "#B45309" },
  "日本維新": { bg: "#FFF7ED", text: "#C2410C" },
  "国民民主": { bg: "#F5F3FF", text: "#6D28D9" },
};

const VOTE_STYLE = {
  "賛成": { bg: "#DCFCE7", text: "#15803D" },
  "反対": { bg: "#FEE2E2", text: "#DC2626" },
  "欠席": { bg: "#F3F4F6", text: "#6B7280" },
};

const PREFECTURES = ["北海道","青森","岩手","宮城","秋田","山形","福島","茨城","栃木","群馬","埼玉","千葉","東京都","神奈川県","新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知","三重","滋賀","京都","大阪府","兵庫","奈良","和歌山","鳥取","島根","岡山","広島","山口","徳島","香川","愛媛","高知","福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄"];

// ============================================================
// 共通コンポーネント
// ============================================================
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#FBBF24" : "#E5E7EB" }}>★</span>
      ))}
    </span>
  );
}

function Avatar({ initials, color, tc, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: tc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, fontWeight: 700, flexShrink: 0, border: `2px solid ${tc}22` }}>
      {initials}
    </div>
  );
}

function Badge({ text, bg, color }) {
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: bg, color, fontWeight: 600 }}>{text}</span>;
}

function Chip({ text, active, onClick }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${active ? "#6366F1" : "#E5E7EB"}`, background: active ? "#EEF2FF" : "#fff", color: active ? "#4F46E5" : "#6B7280", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
      {text}
    </button>
  );
}

// ============================================================
// ヘッダー
// ============================================================
function Header({ page, setPage }) {
  const navs = [
    { key: "map", label: "🗺️ 地図で探す" },
    { key: "ranking", label: "🏆 ランキング" },
    { key: "news", label: "📰 ニュースの議員" },
    { key: "kokkai", label: "🏛️ 国会記録" },
    { key: "schedule", label: "📅 国会日程" },
  ];
  return (
    <header style={{ background: "#fff", borderBottom: "2px solid #F1F5F9", padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🗳️</div>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#1E293B" }}>政治家マップ</span>
      </div>
      <nav style={{ display: "flex", gap: 2 }}>
        {navs.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, background: page === n.key ? "#EEF2FF" : "transparent", color: page === n.key ? "#4F46E5" : "#94A3B8" }}>
            {n.label}
          </button>
        ))}
      </nav>
      <button style={{ fontSize: 13, padding: "6px 16px", borderRadius: 20, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>
        ログイン / 登録
      </button>
    </header>
  );
}

// ============================================================
// 地図ページ
// ============================================================
function MapPage({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const prefData = PREFECTURES.map(p => ({
    name: p,
    count: POLITICIANS.filter(pol => pol.prefecture === p).length,
    politicians: POLITICIANS.filter(pol => pol.prefecture === p),
  }));

  const filtered = POLITICIANS.filter(p =>
    !search || p.name.includes(search) || p.kana.includes(search) || p.party.includes(search) || p.district.includes(search)
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - 54px)" }}>
      {/* 左サイドバー: 都道府県リスト */}
      <div style={{ borderRight: "2px solid #F1F5F9", background: "#fff", overflowY: "auto" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94A3B8" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="議員名・政党で検索..." style={{ width: "100%", fontSize: 13, padding: "7px 10px 7px 32px", borderRadius: 10, border: "2px solid #E2E8F0", outline: "none", boxSizing: "border-box", color: "#1E293B" }} />
          </div>
        </div>
        <div style={{ padding: "8px 0" }}>
          {(search ? filtered : POLITICIANS).map((p, i) => (
            <div key={p.id} onClick={() => { setSelected(p.id); onSelect(p); }} style={{ padding: "10px 14px", cursor: "pointer", borderLeft: `3px solid ${selected === p.id ? "#6366F1" : "transparent"}`, background: selected === p.id ? "#EEF2FF" : "transparent", display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar initials={p.initials} color={p.color} tc={p.tc} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{p.house} · {p.district}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Stars rating={p.rating} size={11} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1E293B" }}>{p.rating}</span>
                </div>
              </div>
              <Badge text={p.party} bg={PARTY_STYLE[p.party]?.bg} color={PARTY_STYLE[p.party]?.text} />
            </div>
          ))}
        </div>
      </div>

      {/* 右: 日本地図 */}
      <div style={{ background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 16, fontWeight: 600 }}>都道府県をクリックして議員を絞り込む</div>
          <svg viewBox="0 0 500 600" style={{ width: "100%", maxWidth: 420 }} xmlns="http://www.w3.org/2000/svg">
            {/* 簡略化した日本地図 */}
            <g onClick={() => {}} style={{ cursor: "pointer" }}>
              <ellipse cx="370" cy="70" rx="80" ry="50" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1.5" opacity="0.8" />
              <text x="370" y="68" textAnchor="middle" fontSize="11" fontWeight="700" fill="#3730A3">北海道</text>
              <text x="370" y="82" textAnchor="middle" fontSize="10" fill="#4338CA">25名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="370" cy="160" rx="45" ry="60" fill="#A5B4FC" stroke="#6366F1" strokeWidth="1.5" opacity="0.8" />
              <text x="370" y="158" textAnchor="middle" fontSize="11" fontWeight="700" fill="#3730A3">東北</text>
              <text x="370" y="172" textAnchor="middle" fontSize="10" fill="#4338CA">42名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="330" cy="270" rx="65" ry="60" fill="#818CF8" stroke="#4F46E5" strokeWidth="2" opacity="0.9" />
              <text x="330" y="268" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">関東</text>
              <text x="330" y="282" textAnchor="middle" fontSize="11" fill="#EEF2FF">148名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="220" cy="290" rx="55" ry="50" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5" opacity="0.8" />
              <text x="220" y="288" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7F1D1D">中部</text>
              <text x="220" y="302" textAnchor="middle" fontSize="10" fill="#991B1B">89名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="200" cy="370" rx="55" ry="45" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" opacity="0.8" />
              <text x="200" y="368" textAnchor="middle" fontSize="11" fontWeight="700" fill="#78350F">近畿</text>
              <text x="200" y="382" textAnchor="middle" fontSize="10" fill="#92400E">112名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="130" cy="370" rx="40" ry="30" fill="#6EE7B7" stroke="#059669" strokeWidth="1.5" opacity="0.8" />
              <text x="130" y="368" textAnchor="middle" fontSize="10" fontWeight="700" fill="#064E3B">中国</text>
              <text x="130" y="380" textAnchor="middle" fontSize="9" fill="#065F46">38名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="175" cy="430" rx="35" ry="22" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" opacity="0.8" />
              <text x="175" y="428" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1E3A8A">四国</text>
              <text x="175" y="440" textAnchor="middle" fontSize="9" fill="#1E40AF">24名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="110" cy="460" rx="60" ry="50" fill="#F9A8D4" stroke="#DB2777" strokeWidth="1.5" opacity="0.8" />
              <text x="110" y="458" textAnchor="middle" fontSize="11" fontWeight="700" fill="#831843">九州</text>
              <text x="110" y="472" textAnchor="middle" fontSize="10" fill="#9D174D">82名</text>
            </g>
            <g style={{ cursor: "pointer" }}>
              <ellipse cx="60" cy="555" rx="28" ry="18" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.5" opacity="0.8" />
              <text x="60" y="553" textAnchor="middle" fontSize="9" fontWeight="700" fill="#4C1D95">沖縄</text>
              <text x="60" y="564" textAnchor="middle" fontSize="8" fill="#5B21B6">8名</text>
            </g>
          </svg>
        </div>

        {/* 凡例 */}
        <div style={{ position: "absolute", bottom: 24, right: 24, background: "#fff", border: "2px solid #F1F5F9", borderRadius: 12, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6 }}>議員数</div>
          {[["#818CF8","100名以上"],["#FCA5A5","50〜99名"],["#FCD34D","10〜49名"],["#C7D2FE","〜9名"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, fontSize: 11, color: "#64748B" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ランキングページ
// ============================================================
function RankingPage({ onSelect }) {
  const [sort, setSort] = useState("rating");
  const [filter, setFilter] = useState("全て");

  const sorted = [...POLITICIANS]
    .filter(p => filter === "全て" || p.house === filter || p.party === filter)
    .sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "reviews" ? b.reviews - a.reviews : b.attendance - a.attendance);

  const RANK_MEDAL = ["🥇","🥈","🥉"];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {["全て","衆議院","参議院","自民党","立憲民主","公明党","日本維新"].map(f => (
          <Chip key={f} text={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 20, border: "2px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 600, marginLeft: "auto" }}>
          <option value="rating">評価順</option>
          <option value="reviews">口コミ数順</option>
          <option value="attendance">出席率順</option>
        </select>
      </div>

      {sorted.map((p, i) => (
        <div key={p.id} onClick={() => onSelect(p)} style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", marginBottom: 10, border: `2px solid ${i === 0 ? "#C7D2FE" : "#F1F5F9"}`, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.1)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
          <div style={{ fontSize: i < 3 ? 22 : 13, fontWeight: 700, width: 28, textAlign: "center", color: "#94A3B8", flexShrink: 0, marginTop: i < 3 ? 0 : 10 }}>{i < 3 ? RANK_MEDAL[i] : i + 1}</div>
          <Avatar initials={p.initials} color={p.color} tc={p.tc} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1E293B" }}>{p.name}</span>
              <Badge text={p.party} bg={PARTY_STYLE[p.party]?.bg} color={PARTY_STYLE[p.party]?.text} />
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>{p.house} · {p.district} · {p.terms}期</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Stars rating={p.rating} size={14} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1E293B" }}>{p.rating}</span>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>({p.reviews.toLocaleString()}件)</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>出席率 <b style={{ color: "#1E293B" }}>{p.attendance}%</b></span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>質問 <b style={{ color: "#1E293B" }}>{p.questions}回</b></span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>立法 <b style={{ color: "#1E293B" }}>{p.laws}件</b></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ニュースの議員
// ============================================================
function NewsPage({ onSelect }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>
      <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700, marginBottom: 14 }}>注目議員のニュース · 自動更新</div>
      {NEWS_FEED.map(n => {
        const pol = POLITICIANS.find(p => p.name === n.politician);
        return (
          <div key={n.id} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, border: "2px solid #F1F5F9" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {pol && <Avatar initials={pol.initials} color={pol.color} tc={pol.tc} size={40} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", cursor: "pointer" }} onClick={() => pol && onSelect(pol)}>{n.politician}</span>
                  {pol && <Badge text={pol.party} bg={PARTY_STYLE[pol.party]?.bg} color={PARTY_STYLE[pol.party]?.text} />}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{n.source} · {n.date}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", marginBottom: 6, lineHeight: 1.5 }}>{n.title}</div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 10 }}>{n.summary}</div>
            <a href={n.url} style={{ fontSize: 12, color: "#6366F1", fontWeight: 700, textDecoration: "none" }}>続きを読む →</a>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 国会記録アンテナ
// ============================================================
function KokkaiPage({ onSelect }) {
  const [filter, setFilter] = useState("全て");
  const types = ["全て","質問主意書","委員会質疑","本会議投票"];
  const filtered = KOKKAI_FEED.filter(k => filter === "全て" || k.type === filter);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {types.map(t => <Chip key={t} text={t} active={filter === t} onClick={() => setFilter(t)} />)}
      </div>
      {filtered.map(k => {
        const pol = POLITICIANS.find(p => p.name === k.politician);
        return (
          <div key={k.id} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, border: "2px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#EEF2FF", color: "#4F46E5", fontWeight: 700 }}>{k.type}</span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>{k.date}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", marginBottom: 8, lineHeight: 1.5 }}>{k.title}</div>
            <div style={{ background: "#F8FAFF", borderRadius: 10, padding: "10px 12px", marginBottom: 10, borderLeft: "3px solid #6366F1" }}>
              <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 700, marginBottom: 4 }}>🤖 AI要約</div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{k.summary}</div>
            </div>
            {pol && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => onSelect(pol)}>
                <Avatar initials={pol.initials} color={pol.color} tc={pol.tc} size={28} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6366F1" }}>{k.politician}</span>
                <Badge text={pol.party} bg={PARTY_STYLE[pol.party]?.bg} color={PARTY_STYLE[pol.party]?.text} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 国会日程
// ============================================================
function SchedulePage() {
  const daysUntilElection = 240;
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>
      <div style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: 16, padding: "16px 20px", marginBottom: 16, color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>次回参院選まで</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{daysUntilElection}日</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>2025年夏 参議院議員通常選挙</div>
      </div>
      <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700, marginBottom: 12 }}>今後の国会日程</div>
      {KOKKAI_SCHEDULE.map((s, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 8, border: "2px solid #F1F5F9", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ background: "#EEF2FF", borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 54 }}>
            <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 700 }}>{s.date.slice(5).replace("-","/")}</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>{s.time}</div>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: s.type === "本会議" ? "#FEE2E2" : "#DCFCE7", color: s.type === "本会議" ? "#DC2626" : "#15803D", fontWeight: 700, marginBottom: 4, display: "inline-block" }}>{s.type}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{s.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 議員詳細パネル
// ============================================================
function DetailPanel({ politician: p, onClose }) {
  const [tab, setTab] = useState("口コミ");
  const [star, setStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [body, setBody] = useState("");
  const [reviews, setReviews] = useState(REVIEWS);
  const [submitted, setSubmitted] = useState(false);
  const [following, setFollowing] = useState(false);

  const tabs = ["口コミ","投票記録","国会記録","経歴・実績"];

  const handleSubmit = () => {
    if (!star || !body.trim()) return;
    setReviews([{ user: "あなた", rating: star, date: "たった今", body, tags: [], helpful: 0 }, ...reviews]);
    setSubmitted(true);
    setBody(""); setStar(0);
  };

  return (
    <div style={{ background: "#fff", borderTop: "2px solid #F1F5F9" }}>
      {/* ヒーロー */}
      <div style={{ padding: "16px 20px", borderBottom: "2px solid #F1F5F9" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
          <Avatar initials={p.initials} color={p.color} tc={p.tc} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>{p.name}</span>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>（{p.kana}）</span>
              <Badge text={p.party} bg={PARTY_STYLE[p.party]?.bg} color={PARTY_STYLE[p.party]?.text} />
            </div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 8 }}>{p.house} · {p.district} · 当選{p.terms}回</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Stars rating={p.rating} size={18} />
              <span style={{ fontSize: 22, fontWeight: 800, color: "#1E293B" }}>{p.rating}</span>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>{p.reviews.toLocaleString()}件の口コミ</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.badges.map(b => <span key={b} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#F1F5F9", color: "#64748B", fontWeight: 600 }}>🏷️ {b}</span>)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "2px solid #E2E8F0", borderRadius: 10, padding: "4px 10px", cursor: "pointer", color: "#94A3B8", fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✍️ 口コミを書く</button>
          <button onClick={() => setFollowing(!following)} style={{ background: "#fff", color: following ? "#6366F1" : "#64748B", border: `2px solid ${following ? "#6366F1" : "#E2E8F0"}`, borderRadius: 20, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {following ? "🔔 フォロー中" : "🔔 フォロー"}
          </button>
          <button style={{ background: "#fff", color: "#64748B", border: "2px solid #E2E8F0", borderRadius: 20, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>共有</button>
        </div>
      </div>

      {/* 統計 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "2px solid #F1F5F9" }}>
        {[
          { label: "質問回数", value: `${p.questions}回`, sub: "今期" },
          { label: "出席率", value: `${p.attendance}%`, sub: "平均82%" },
          { label: "議員立法", value: `${p.laws}件`, sub: "うち成立" },
          { label: "政治資金", value: `${(p.funds/1000).toFixed(1)}千万`, sub: "前年" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "12px 16px", borderRight: i < 3 ? "1px solid #F1F5F9" : "none", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#CBD5E1", marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* タブ */}
      <div style={{ display: "flex", borderBottom: "2px solid #F1F5F9" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer", color: tab === t ? "#4F46E5" : "#94A3B8", borderBottom: `3px solid ${tab === t ? "#6366F1" : "transparent"}` }}>{t}</button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div style={{ padding: "16px 20px", maxHeight: 400, overflowY: "auto" }}>
        {tab === "口コミ" && (
          <>
            <div style={{ background: "#F8FAFF", borderRadius: 14, padding: 14, marginBottom: 14, border: "2px solid #EEF2FF" }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: "#1E293B" }}>口コミを投稿する</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)} onClick={() => setStar(n)}
                    style={{ fontSize: 28, cursor: "pointer", display: "inline-block", transition: "transform 0.1s", transform: n <= (hoverStar || star) ? "scale(1.2)" : "scale(1)", color: n <= (hoverStar || star) ? "#FBBF24" : "#E5E7EB" }}>★</span>
                ))}
                {star > 0 && <span style={{ fontSize: 12, color: "#6366F1", fontWeight: 700, alignSelf: "center", marginLeft: 6 }}>{["","最低","やや不満","普通","良い","最高"][star]}</span>}
              </div>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="実際に感じたこと・経験を書いてください（500文字以内）" style={{ width: "100%", minHeight: 80, fontSize: 13, padding: 10, borderRadius: 10, border: "2px solid #E2E8F0", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box", color: "#1E293B" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>{body.length}/500</span>
                <button onClick={handleSubmit} style={{ background: star && body.trim() ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "#E2E8F0", color: star && body.trim() ? "#fff" : "#94A3B8", border: "none", borderRadius: 20, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {submitted ? "✓ 投稿完了！" : "投稿する"}
                </button>
              </div>
            </div>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, border: "2px solid #F1F5F9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                    <div><div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{r.user}</div><Stars rating={r.rating} size={12} /></div>
                  </div>
                  <span style={{ fontSize: 12, color: "#CBD5E1" }}>{r.date}</span>
                </div>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: "0 0 8px" }}>{r.body}</p>
                {r.tags.length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>{r.tags.map(t => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, border: "1.5px solid #E2E8F0", color: "#64748B" }}>{t}</span>)}</div>}
                <button style={{ fontSize: 12, color: "#94A3B8", background: "#F8FAFF", border: "none", borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}>👍 参考になった（{r.helpful}）</button>
              </div>
            ))}
          </>
        )}

        {tab === "投票記録" && (
          <>
            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700, marginBottom: 10 }}>直近の本会議投票記録</div>
            {VOTES.map((v, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: "2px solid #F1F5F9" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: VOTE_STYLE[v.result]?.bg, color: VOTE_STYLE[v.result]?.text, fontWeight: 700, flexShrink: 0 }}>{v.result}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", lineHeight: 1.5 }}>{v.bill}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{v.date} · 本会議</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#64748B", background: "#F8FAFF", borderRadius: 8, padding: "6px 10px", borderLeft: "3px solid #6366F1" }}>{v.summary}</div>
              </div>
            ))}
          </>
        )}

        {tab === "国会記録" && (
          <>
            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700, marginBottom: 10 }}>国会での活動記録 · AI要約付き</div>
            {KOKKAI_FEED.slice(0,2).map((k, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: "2px solid #F1F5F9" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#EEF2FF", color: "#4F46E5", fontWeight: 700 }}>{k.type}</span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{k.date}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>{k.title}</div>
                <div style={{ fontSize: 12, color: "#64748B", background: "#F8FAFF", borderRadius: 8, padding: "6px 10px", borderLeft: "3px solid #6366F1" }}>
                  <span style={{ fontSize: 11, color: "#6366F1", fontWeight: 700 }}>🤖 AI要約 </span>{k.summary}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "経歴・実績" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "🎂", label: "生年", value: `${p.born}年（${2025 - p.born}歳）` },
              { icon: "📍", label: "選挙区", value: p.district },
              { icon: "🎓", label: "学歴", value: p.edu },
              { icon: "🏛️", label: "初当選", value: `${p.firstElected}年` },
              { icon: "📋", label: "委員会", value: p.committee },
              { icon: "💰", label: "政治資金", value: `${(p.funds/1000).toFixed(1)}千万円` },
            ].map(row => (
              <div key={row.label} style={{ background: "#F8FAFF", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{row.icon} {row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{row.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// メインApp
// ============================================================
export default function App() {
  const [page, setPage] = useState("ranking");
  const [selectedPol, setSelectedPol] = useState(null);

  const handleSelect = (p) => { setSelectedPol(p); };
  const handleClose = () => setSelectedPol(null);

  return (
    <div style={{ fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif", background: "#F8FAFF", minHeight: "100vh" }}>
      <Header page={page} setPage={setPage} />
      {page === "map" && <MapPage onSelect={handleSelect} />}
      {page === "ranking" && <RankingPage onSelect={handleSelect} />}
      {page === "news" && <NewsPage onSelect={handleSelect} />}
      {page === "kokkai" && <KokkaiPage onSelect={handleSelect} />}
      {page === "schedule" && <SchedulePage />}
      {selectedPol && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, maxHeight: "70vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(0,0,0,0.15)" }}>
          <DetailPanel politician={selectedPol} onClose={handleClose} />
        </div>
      )}
    </div>
  );
}
