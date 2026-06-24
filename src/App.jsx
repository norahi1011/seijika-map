import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

// ============================================================
// Supabase接続
// ============================================================
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const SUPA_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function supabaseFetch(table, options = {}) {
  const { select = "*", filter, order, limit } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  if (filter) url += `&${filter}`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  try {
    const res = await fetch(url, { headers: SUPA_HEADERS });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function supabaseCount(table, filter) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=id&limit=0`;
  if (filter) url += `&${filter}`;
  try {
    const res = await fetch(url, {
      headers: { ...SUPA_HEADERS, Prefer: "count=exact" },
    });
    if (!res.ok) return 0;
    const range = res.headers.get("Content-Range"); // 例: "*/57"
    const total = range ? parseInt(range.split("/")[1], 10) : 0;
    return isNaN(total) ? 0 : total;
  } catch { return 0; }
}

async function supabaseInsert(table, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...SUPA_HEADERS, Prefer: "return=minimal" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch { return false; }
}



// ============================================================
// 定数・スタイル
// ============================================================
const PARTY_STYLE = {
  "自由民主党": { bg: "#EFF6FF", text: "#1D4ED8", short: "自民党" },
  "自民党":     { bg: "#EFF6FF", text: "#1D4ED8", short: "自民党" },
  "立憲民主党": { bg: "#FDF2F8", text: "#BE185D", short: "立憲民主" },
  "立憲民主":   { bg: "#FDF2F8", text: "#BE185D", short: "立憲民主" },
  "公明党":     { bg: "#FFFBEB", text: "#B45309", short: "公明党" },
  "日本維新の会": { bg: "#FFF7ED", text: "#C2410C", short: "日本維新" },
  "日本維新":   { bg: "#FFF7ED", text: "#C2410C", short: "日本維新" },
  "国民民主党": { bg: "#F5F3FF", text: "#6D28D9", short: "国民民主" },
  "日本共産党": { bg: "#FEF2F2", text: "#DC2626", short: "共産党" },
  "れいわ新選組": { bg: "#FDF4FF", text: "#9333EA", short: "れいわ" },
  "社会民主党": { bg: "#FFF1F2", text: "#E11D48", short: "社民党" },
};

const VOTE_STYLE = {
  "賛成": { bg: "#DCFCE7", text: "#15803D" },
  "反対": { bg: "#FEE2E2", text: "#DC2626" },
  "欠席": { bg: "#F3F4F6", text: "#6B7280" },
};

const KOKKAI_SCHEDULE = [
  { date: "2025-06-17", type: "本会議", title: "経済安全保障推進法改正案 第二読会", time: "13:00" },
  { date: "2025-06-18", type: "委員会", title: "経済産業委員会 一般質疑", time: "09:00" },
  { date: "2025-06-19", type: "委員会", title: "厚生労働委員会 参考人質疑", time: "10:00" },
  { date: "2025-06-20", type: "本会議", title: "内閣不信任案 採決", time: "15:00" },
];

// ============================================================
// 共通コンポーネント
// ============================================================
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating || 0) ? "#FBBF24" : "#E5E7EB" }}>★</span>
      ))}
    </span>
  );
}

function PoliticianAvatar({ politician, size = 44 }) {
  const name = politician?.name || "";
  const ps = PARTY_STYLE[politician?.party] || { bg: "#F1F5F9", text: "#64748B" };
  const initials = name.slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: ps.bg, color: ps.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, fontWeight: 700, flexShrink: 0, border: `2px solid ${ps.text}22` }}>
      {initials}
    </div>
  );
}

function Badge({ text, bg, color }) {
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: bg || "#F1F5F9", color: color || "#64748B", fontWeight: 600 }}>{text}</span>;
}

function Chip({ text, active, onClick }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${active ? "#6366F1" : "#E5E7EB"}`, background: active ? "#EEF2FF" : "#fff", color: active ? "#4F46E5" : "#6B7280", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
      {text}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #E2E8F0", borderTop: "3px solid #6366F1", animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: 13, color: "#94A3B8" }}>読み込み中...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
// ヘッダー
// ============================================================
function Header({ page, setPage, stats }) {
  const navs = [
    { key: "map", label: "地図で探す" },
    { key: "ranking", label: "ランキング" },
    { key: "news", label: "ニュース" },
    { key: "column", label: "コラム" },
    { key: "kokkai", label: "国会記録" },
    { key: "schedule", label: "国会日程" },
  ];
  const isMobile = useIsMobile();
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("map")}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🗳️</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>政治家レビュー</div>
            <div style={{ fontSize: 11, color: "#94A3B8", display: isMobile ? "none" : "block" }}>議員の活動実績と口コミを共有するプラットフォーム</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ display: isMobile ? "none" : "flex", gap: 16 }}>
            {[
              { num: stats?.total || 84, label: "掲載議員数" },
              { num: stats?.shugiin || 54, label: "衆議院" },
              { num: stats?.sangiin || 30, label: "参議院" },
              { num: stats?.reviews || 0, label: "口コミ件数" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{s.num.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ fontSize: 12, padding: isMobile ? "10px 14px" : "5px 14px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", cursor: "pointer" }}>ログイン</button>
            <button style={{ fontSize: 12, padding: isMobile ? "10px 14px" : "5px 14px", borderRadius: 6, border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600 }}>新規登録</button>
          </div>
        </div>
      </div>
      <nav style={{ display: "flex", padding: isMobile ? "0" : "0 20px", background: "#FAFAFA", overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch" }}>
        {navs.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)} style={{ fontSize: 13, padding: isMobile ? "10px 12px" : "10px 16px", border: "none", background: "none", cursor: "pointer", color: page === n.key ? "#4F46E5" : "#64748B", borderBottom: `2px solid ${page === n.key ? "#4F46E5" : "transparent"}`, fontWeight: page === n.key ? 600 : 400, flexShrink: 0, whiteSpace: "nowrap" }}>
            {n.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

// ============================================================
// ランキングページ（Supabaseからデータ取得）
// ============================================================
function RankingPage({ onSelect }) {
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("avg_rating");
  const [filter, setFilter] = useState("全て");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await supabaseFetch("politicians", {
        select: "*,parties(name,short_name,color_hex)",
        order: `${sort}.desc`,
      });
      setPoliticians(data || []);
      setLoading(false);
    }
    load();
  }, [sort]);

  const filtered = politicians.filter(p => {
    const partyName = p.parties?.short_name || p.parties?.name || "";
    const matchFilter = filter === "全て" || p.house === filter || partyName.includes(filter);
    const matchSearch = !search || p.name?.includes(search) || partyName.includes(search) || p.district?.includes(search);
    return matchFilter && matchSearch;
  });

  const RANK_MEDAL = ["🥇","🥈","🥉"];

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 54px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px" }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94A3B8" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="議員名・政党・選挙区で検索..." style={{ width: "100%", fontSize: 13, padding: "9px 12px 9px 38px", borderRadius: 12, border: "2px solid #E2E8F0", outline: "none", boxSizing: "border-box", color: "#1E293B" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          {["全て","衆議院","参議院","自民党","立憲民主","公明党","日本維新"].map(f => (
            <Chip key={f} text={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 20, border: "2px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 600, marginLeft: "auto" }}>
            <option value="avg_rating">評価順</option>
            <option value="review_count">口コミ数順</option>
            <option value="question_count">発言回数順</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700, marginBottom: 10 }}>{filtered.length}名の議員</div>
            {filtered.map((p, i) => {
              const ps = PARTY_STYLE[p.parties?.short_name] || PARTY_STYLE[p.parties?.name] || { bg: "#F1F5F9", text: "#64748B" };
              return (
                <div key={p.id} onClick={() => onSelect(p)}
                  style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", marginBottom: 10, border: `2px solid ${i === 0 ? "#C7D2FE" : "#F1F5F9"}`, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, transition: "box-shadow 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ fontSize: i < 3 ? 22 : 13, fontWeight: 700, width: 28, textAlign: "center", color: "#94A3B8", flexShrink: 0, marginTop: i < 3 ? 0 : 10 }}>{i < 3 ? RANK_MEDAL[i] : i + 1}</div>
                  <PoliticianAvatar politician={{ ...p, party: p.parties?.short_name || p.parties?.name }} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#1E293B" }}>{p.name}</span>
                      <Badge text={p.parties?.short_name || p.parties?.name || "無所属"} bg={ps.bg} color={ps.text} />
                    </div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>{p.house} · {p.district} · {p.terms}期</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Stars rating={p.avg_rating} size={14} />
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#1E293B" }}>{p.avg_rating > 0 ? p.avg_rating : "未評価"}</span>
                      {p.review_count > 0 && <span style={{ fontSize: 12, color: "#94A3B8" }}>({p.review_count}件)</span>}
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {p.question_count > 0 && <span style={{ fontSize: 11, color: "#94A3B8" }}>発言 <b style={{ color: "#1E293B" }}>{p.question_count}回</b></span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>
                議員データを読み込み中か、条件に合う議員が見つかりません
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 地図ページ
// ============================================================
function MapPage({ onSelect }) {
  const [politicians, setPoliticians] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [houseFilter, setHouseFilter] = useState("全て");
  const [selected, setSelected] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function load() {
      const [data, recent] = await Promise.all([
        supabaseFetch("politicians", {
          select: "*,parties(name,short_name,color_hex)",
          order: "question_count.desc",
        }),
        supabaseFetch("reviews", {
          select: "id,politician_id,rating,body,created_at,politicians(name)",
          order: "created_at.desc",
          limit: 5,
        }),
      ]);
      setPoliticians(data || []);
      setRecentReviews(recent || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = politicians.filter(p => {
    const ms = !search || p.name?.includes(search) || p.district?.includes(search) || p.parties?.short_name?.includes(search) || p.parties?.name?.includes(search);
    const mh = houseFilter === "全て" || p.house === houseFilter;
    return ms && mh;
  });

  const PR = { "自民党":"#EFF6FF", "立憲民主":"#FDF2F8", "公明党":"#FFFBEB", "日本維新":"#FFF7ED", "国民民主":"#F5F3FF", "共産党":"#FEF2F2", "れいわ":"#FDF4FF", "社民党":"#FFF1F2" };
  const PT = { "自民党":"#1D4ED8", "立憲民主":"#BE185D", "公明党":"#B45309", "日本維新":"#C2410C", "国民民主":"#6D28D9", "共産党":"#DC2626", "れいわ":"#9333EA", "社民党":"#E11D48" };

  const pName = p => p.parties?.short_name || p.parties?.name || "無所属";

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", minHeight: "calc(100vh - 110px)" }}>
      {/* 左：検索＋議員リスト */}
      <div style={{ borderRight: isMobile ? "none" : "1px solid #E2E8F0", borderBottom: "none", background: "#fff", display: "flex", flexDirection: "column", order: isMobile ? 2 : 0 }}>
        {/* 検索 */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>議員名・選挙区・政党で絞り込んで口コミを確認できます</div>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94A3B8" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="例：田中、東京、自民党..." style={{ width: "100%", fontSize: isMobile ? 16 : 12, padding: isMobile ? "11px 10px 11px 34px" : "6px 10px 6px 28px", borderRadius: 6, border: "1px solid #E2E8F0", outline: "none", boxSizing: "border-box", color: "#1E293B", background: "#fff" }} />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["全て","衆議院","参議院"].map(f => (
              <button key={f} onClick={() => setHouseFilter(f)} style={{ fontSize: isMobile ? 14 : 11, padding: isMobile ? "10px 16px" : "3px 10px", borderRadius: 20, border: `1px solid ${houseFilter === f ? "#4F46E5" : "#E2E8F0"}`, background: houseFilter === f ? "#EEF2FF" : "#fff", color: houseFilter === f ? "#4F46E5" : "#64748B", cursor: "pointer" }}>{f}</button>
            ))}
          </div>
        </div>
        {/* リスト */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? <LoadingSpinner /> : (
            <>
              <div style={{ padding: "8px 14px", fontSize: 11, color: "#94A3B8", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>{filtered.length}名の議員 · 発言回数順</div>
              {filtered.map(p => {
                const pn = pName(p);
                const pbg = PR[pn] || "#F1F5F9";
                const ptx = PT[pn] || "#64748B";
                return (
                  <div key={p.id} onClick={() => { setSelected(p.id); onSelect(p); }}
                    style={{ padding: "9px 14px", cursor: "pointer", borderLeft: `3px solid ${selected === p.id ? "#4F46E5" : "transparent"}`, background: selected === p.id ? "#EEF2FF" : "transparent", display: "flex", gap: 9, alignItems: "center", borderBottom: "1px solid #F8FAFC" }}>
                    <PoliticianAvatar politician={{ ...p, party: pn }} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{p.name}</span>
                        <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 20, background: pbg, color: ptx }}>{pn}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{p.house} · {p.district}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                        <Stars rating={p.avg_rating} size={11} />
                        {p.question_count > 0 && <span style={{ fontSize: 10, color: "#94A3B8" }}>発言{p.question_count}回</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 右：地図＋サイドバー */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 240px", background: "#F8FAFF", order: isMobile ? 1 : 0, borderBottom: isMobile ? "1px solid #E2E8F0" : "none" }}>
        {/* 地図 */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>選挙区マップ — クリックで絞り込み</span>
            <div style={{ display: "flex", gap: 10 }}>
              {[["#EEEDFE","関東"],["#FAEEDA","中部"],["#FAECE7","近畿"],["#FBEAF0","九州"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748B" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c, border: "1px solid #ddd" }} />{l}
                </div>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 560 500" style={{ width: isMobile ? "560px" : "100%" }} xmlns="http://www.w3.org/2000/svg">
            {[
              [390,10,160,80,"北海道","#E6F1FB","#B5D4F4"],
              [400,102,46,24,"青森","#EAF3DE","#C0DD97"],[400,128,46,24,"岩手","#EAF3DE","#C0DD97"],
              [352,102,46,24,"秋田","#EAF3DE","#C0DD97"],[352,128,46,24,"山形","#EAF3DE","#C0DD97"],
              [400,154,46,24,"宮城","#EAF3DE","#C0DD97"],[352,154,46,24,"福島","#EAF3DE","#C0DD97"],
              [304,180,46,24,"栃木","#EEEDFE","#AFA9EC"],[352,180,46,24,"茨城","#EEEDFE","#AFA9EC"],
              [256,180,46,24,"群馬","#EEEDFE","#AFA9EC"],[304,206,46,24,"埼玉","#EEEDFE","#AFA9EC"],
              [352,206,46,24,"千葉","#EEEDFE","#AFA9EC"],[352,232,46,24,"東京","#EEEDFE","#AFA9EC"],
              [304,232,46,24,"神奈川","#EEEDFE","#AFA9EC"],[256,206,46,24,"山梨","#EEEDFE","#AFA9EC"],
              [160,206,46,24,"富山","#FAEEDA","#FAC775"],[208,206,46,24,"長野","#FAEEDA","#FAC775"],
              [112,206,46,24,"石川","#FAEEDA","#FAC775"],[112,180,46,24,"福井","#FAEEDA","#FAC775"],
              [160,232,46,24,"岐阜","#FAEEDA","#FAC775"],[208,232,46,24,"静岡","#FAEEDA","#FAC775"],
              [160,258,46,24,"愛知","#FAEEDA","#FAC775"],[208,258,46,24,"三重","#FAEEDA","#FAC775"],
              [112,232,46,24,"新潟","#FAEEDA","#FAC775"],
              [64,258,46,24,"京都","#FAECE7","#F5C4B3"],[112,258,46,24,"滋賀","#FAECE7","#F5C4B3"],
              [64,284,46,24,"大阪","#FAECE7","#F5C4B3"],[16,284,46,24,"兵庫","#FAECE7","#F5C4B3"],
              [112,284,46,24,"奈良","#FAECE7","#F5C4B3"],[64,310,46,24,"和歌山","#FAECE7","#F5C4B3"],
              [16,258,46,24,"鳥取","#EAF3DE","#C0DD97"],[16,310,46,24,"島根","#EAF3DE","#C0DD97"],
              [64,336,46,24,"岡山","#EAF3DE","#C0DD97"],[16,336,46,24,"広島","#EAF3DE","#C0DD97"],
              [16,362,46,24,"山口","#EAF3DE","#C0DD97"],
              [112,336,46,24,"徳島","#B5D4F4","#85B7EB"],[112,362,46,24,"香川","#B5D4F4","#85B7EB"],
              [64,362,46,24,"愛媛","#B5D4F4","#85B7EB"],[112,388,46,24,"高知","#B5D4F4","#85B7EB"],
              [16,388,46,24,"福岡","#FBEAF0","#F4C0D1"],[64,388,46,24,"大分","#FBEAF0","#F4C0D1"],
              [16,414,46,24,"佐賀","#FBEAF0","#F4C0D1"],[64,414,46,24,"熊本","#FBEAF0","#F4C0D1"],
              [16,440,46,24,"長崎","#FBEAF0","#F4C0D1"],[64,440,46,24,"宮崎","#FBEAF0","#F4C0D1"],
              [40,466,46,24,"鹿児島","#FBEAF0","#F4C0D1"],
              [160,466,56,24,"沖縄","#E1F5EE","#9FE1CB"],
            ].map(([x,y,w,h,name,fill,stroke]) => (
              <g key={name} style={{ cursor: "pointer" }} onClick={() => setSearch(name)}>
                <rect x={x} y={y} width={w} height={h} rx="3" fill={fill} stroke={stroke} strokeWidth="0.5" />
                <text x={x+w/2} y={y+h/2+4} textAnchor="middle" fontSize={isMobile ? "12" : "9.5"} fill="#475569">{name}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* サイドバー */}
        <div style={{ borderLeft: "1px solid #E2E8F0", padding: "14px 12px", background: "#fff", overflowY: "auto", display: isMobile ? "none" : "block" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14 }}>📈</span>人気の議員
            <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 400 }}>過去24時間</span>
          </div>
          {(loading ? [] : politicians.slice(0,5)).map((p, i) => {
            const pn = pName(p);
            const pbg = PR[pn] || "#F1F5F9";
            const ptx = PT[pn] || "#64748B";
            return (
              <div key={p.id} onClick={() => onSelect(p)} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}>
                <span style={{ fontSize: 12, color: "#94A3B8", width: 14 }}>{i+1}</span>
                <PoliticianAvatar politician={{ ...p, party: pn }} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                    {p.name}
                    <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 20, background: pbg, color: ptx }}>{pn}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>{p.house}</div>
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B", margin: "14px 0 10px", paddingBottom: 8, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14 }}>💬</span>最近の口コミ
          </div>
          {(loading ? [] : recentReviews).length === 0 ? (
            <div style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "12px 0" }}>
              口コミはまだありません。<br/>最初の投稿者になりましょう！
            </div>
          ) : recentReviews.map(r => {
            const polName = r.politicians?.name || "議員";
            const snippet = (r.body || "").length > 40 ? (r.body || "").slice(0, 40) + "…" : (r.body || "");
            const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString("ja-JP") : "";
            return (
              <div key={r.id}
                onClick={() => { const full = politicians.find(p => p.id === r.politician_id); onSelect(full || { id: r.politician_id, name: polName }); }}
                style={{ padding: "8px 0", borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{polName}</span>
                  <Stars rating={r.rating} size={11} />
                </div>
                <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5, marginBottom: 2 }}>{snippet}</div>
                <div style={{ fontSize: 10, color: "#CBD5E1" }}>{dateStr}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ニュースページ
// ============================================================
// ============================================================
// 国会APIからリアルタイムデータ取得（Netlify Functions経由）
// ============================================================
const KOKKAI_FN = "/.netlify/functions/kokkai";

async function fetchKokkaiSpeeches(limit = 12) {
  try {
    const from = (() => { const d = new Date(); d.setMonth(d.getMonth()-2); return d.toISOString().slice(0,10); })();
    const res = await fetch(`${KOKKAI_FN}?type=speech&limit=${limit}&from=${from}`);
    if (!res.ok) return [];
    const data = await res.json();

    // APIレスポンス形式：speechRecord が直接ルートにある
    const speechRecords = data.speechRecord || [];
    const list = Array.isArray(speechRecords) ? speechRecords : [speechRecords];

    // 議長・委員長・事務局などの形式的発言を除外
    const EXCLUDE_ROLES = ["委員長", "議長", "副議長", "副委員長", "事務総長", "会議録情報", "○委員長"];
    const EXCLUDE_SPEECHES = ["御異議なしと認めます", "これより会議を開きます", "次の案件を議題", "採決いたします", "可決されました", "ただいまから"];

    return list
      .filter(s => {
        if (!s.speaker || !s.speech || !s.speakerYomi) return false;
        if (EXCLUDE_ROLES.some(r => s.speaker.includes(r))) return false;
        if (EXCLUDE_SPEECHES.some(e => (s.speech || "").includes(e))) return false;
        if ((s.speech || "").length < 50) return false; // 短すぎる発言を除外
        return true;
      })
      .slice(0, limit)
      .map(s => ({
        speaker: s.speaker,
        house: s.nameOfHouse || "",
        meeting: s.nameOfMeeting || "",
        date: s.date || "",
        speech: (s.speech || "").slice(0, 150) + "…",
        url: s.meetingURL || "#",
      }));
  } catch { return []; }
}

async function fetchKokkaiMeetings(limit = 20) {
  try {
    const from = (() => { const d = new Date(); d.setMonth(d.getMonth()-1); return d.toISOString().slice(0,10); })();
    const res = await fetch(`${KOKKAI_FN}?type=meeting&limit=${limit}&from=${from}`);
    if (!res.ok) return [];
    const data = await res.json();

    // speech APIと同じ構造：speechRecordがルートにある
    // meeting_listの場合はmeetingRecordがルート
    const records = data.meetingRecord || data.speechRecord || data.records || [];
    const list = Array.isArray(records) ? records : [records];

    // 重複除去（同じ会議名・日付）
    const seen = new Set();
    return list
      .map(m => ({
        date: m.date || "",
        house: m.nameOfHouse || "",
        meeting: m.nameOfMeeting || "",
        url: m.meetingURL || "#",
        issueNumber: m.issue || "",
      }))
      .filter(m => {
        if (!m.date || !m.meeting) return false;
        const key = `${m.date}-${m.meeting}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  } catch { return []; }
}

// ============================================================
// ニュースページ（国会APIからリアルタイム取得）
// ============================================================
function NewsPage({ onSelect }) {
  const [speeches, setSpeeches] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchKokkaiSpeeches(12),
      supabaseFetch("politicians", { select: "*,parties(name,short_name)", limit: 100 }),
    ]).then(([sp, pols]) => {
      setSpeeches(sp);
      setPoliticians(pols || []);
      setLoading(false);
    });
  }, []);

  const findPol = name => politicians.find(p => p.name && name && (p.name === name || name.includes(p.name.replace(" ","")) || p.name.replace(" ","") === name.replace(/\s/g,"")));

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>国会での最新発言</span>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>国会会議録検索システムAPIよりリアルタイム取得</span>
          {!loading && <span style={{ fontSize: 11, color: "#10B981", background: "#DCFCE7", padding: "2px 8px", borderRadius: 20 }}>● LIVE</span>}
        </div>
        {loading ? <LoadingSpinner /> : speeches.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>データを取得中です</div>
        ) : speeches.map((s, i) => {
          const pol = findPol(s.speaker);
          const ps = pol ? (PARTY_STYLE[pol.parties?.short_name] || PARTY_STYLE[pol.parties?.name] || { bg: "#F1F5F9", text: "#64748B" }) : { bg: "#F1F5F9", text: "#64748B" };
          return (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                {pol ? <PoliticianAvatar politician={{ ...pol, party: pol.parties?.short_name }} size={36} /> : (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", cursor: pol ? "pointer" : "default" }} onClick={() => pol && onSelect(pol)}>{s.speaker}</span>
                    {pol && <Badge text={pol.parties?.short_name || "無所属"} bg={ps.bg} color={ps.text} />}
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{s.house} · {s.meeting} · {s.date}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: "0 0 8px", background: "#F8FAFF", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #E2E8F0" }}>「{s.speech}」</p>
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none" }}>会議録を読む →</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 国会記録ページ（国会APIからリアルタイム取得）
// ============================================================
function KokkaiPage({ onSelect }) {
  const [meetings, setMeetings] = useState([]);
  const [filter, setFilter] = useState("全て");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKokkaiMeetings(20).then(data => {
      setMeetings(data);
      setLoading(false);
    });
  }, []);

  const filtered = meetings.filter(m =>
    filter === "全て" ||
    (filter === "衆議院" && m.house === "衆議院") ||
    (filter === "参議院" && m.house === "参議院")
  );

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>最近の国会会議一覧</span>
          {!loading && <span style={{ fontSize: 11, color: "#10B981", background: "#DCFCE7", padding: "2px 8px", borderRadius: 20 }}>● LIVE</span>}
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            {["全て","衆議院","参議院"].map(f => <Chip key={f} text={f} active={filter === f} onClick={() => setFilter(f)} />)}
          </div>
        </div>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>データを取得中です</div>
        ) : filtered.map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 8, border: "1px solid #E2E8F0", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ background: m.house === "衆議院" ? "#EEF2FF" : "#FDF4FF", borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 56, flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: m.house === "衆議院" ? "#4F46E5" : "#9333EA", fontWeight: 600 }}>{m.house}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{m.date?.slice(5)?.replace("-","/")}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 2 }}>{m.meeting}</div>
              {m.issueNumber && <div style={{ fontSize: 11, color: "#94A3B8" }}>{m.issueNumber}</div>}
            </div>
            <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none", flexShrink: 0 }}>会議録 →</a>
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "10px 0", fontSize: 11, color: "#94A3B8" }}>
          出典：国立国会図書館 国会会議録検索システム
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 国会日程ページ（参議院カレンダーAPIよりリアルタイム取得）
// ============================================================
function SchedulePage() {
  const today = new Date();
  // 次回参院選：2025年7月27日（予定）
  const election = new Date("2025-07-27");
  const daysLeft = Math.max(0, Math.ceil((election - today) / (1000 * 60 * 60 * 24)));

  // 国会会期情報（第217回国会：2025年1月24日〜）
  const sessionStart = new Date("2025-01-24");
  const sessionDays = Math.ceil((today - sessionStart) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px" }}>

        {/* 選挙カウントダウン */}
        <div style={{ background: "#1E293B", borderRadius: 14, padding: "18px 20px", marginBottom: 14, color: "#fff" }}>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>次回参院選まで（2025年7月27日予定）</div>
          <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 2 }}>{daysLeft}<span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>日</span></div>
          <div style={{ fontSize: 12, color: "#64748B" }}>第26回参議院議員通常選挙</div>
        </div>

        {/* 国会会期 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 14, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>現在の国会</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}>第217回国会（通常国会）</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>2025年1月24日召集 · 会期中{sessionDays}日目</div>
            </div>
            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "#DCFCE7", color: "#15803D", fontWeight: 600 }}>会期中</span>
          </div>
        </div>

        {/* 今日の日付表示 */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 10 }}>
          最新の国会情報
        </div>

        {/* 国会会議録APIへのリンク */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>国会会議録検索システム</div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>国立国会図書館が提供する会議録をリアルタイムで検索できます</div>
          <a href="https://kokkai.ndl.go.jp/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}>会議録を検索する →</a>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>衆議院インターネット審議中継</div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>本会議・委員会の審議をライブ・録画で視聴できます</div>
          <a href="https://www.shugiintv.go.jp/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}>審議を視聴する →</a>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>参議院インターネット審議中継</div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>参院本会議・委員会の審議をライブ・録画で視聴できます</div>
          <a href="https://www.webtv.sangiin.go.jp/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}>審議を視聴する →</a>
        </div>

        <div style={{ textAlign: "center", padding: "14px 0", fontSize: 11, color: "#94A3B8" }}>
          情報は各公式サイトより提供されています
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 議員詳細パネル（Supabaseからデータ取得）
// ============================================================
function DetailPanel({ politician: p, onClose }) {
  const [tab, setTab] = useState("口コミ");
  const [reviews, setReviews] = useState([]);
  const [votes, setVotes] = useState([]);
  const [star, setStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [following, setFollowing] = useState(false);
  const isMobile = useIsMobile();

  const ps = PARTY_STYLE[p.parties?.short_name] || PARTY_STYLE[p.parties?.name] || { bg: "#F1F5F9", text: "#64748B" };
  const partyName = p.parties?.short_name || p.parties?.name || "無所属";

  useEffect(() => {
    if (p.id) {
      supabaseFetch("reviews", { filter: `politician_id=eq.${p.id}`, order: "created_at.desc" })
        .then(data => setReviews(data || []));
      supabaseFetch("votes", { filter: `politician_id=eq.${p.id}`, order: "voted_at.desc" })
        .then(data => setVotes(data || []));
    }
  }, [p.id]);

  const handleSubmit = async () => {
    if (!star || !body.trim()) return;
    setSubmitting(true);
    const ok = await supabaseInsert("reviews", {
      politician_id: p.id,
      rating: star,
      body: body.trim(),
      is_anonymous: true,
      status: "approved",
    });
    if (ok) {
      setReviews([{ rating: star, body: body.trim(), created_at: new Date().toISOString(), is_anonymous: true }, ...reviews]);
      setSubmitted(true);
      setBody(""); setStar(0);
    }
    setSubmitting(false);
  };

  const totalR = reviews.length || 0;
  const avgR = totalR > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalR).toFixed(1) : null;

  // 活動スコア（通知表風 5段階）
  const qScore = p.question_count > 0 ? Math.min(5, Math.ceil(p.question_count / 200)) : null;
  const aScore = p.attendance_rate > 0 ? Math.min(5, Math.round(p.attendance_rate / 20)) : null;

  return (
    <div style={{ background: "#fff", borderTop: "1px solid #E2E8F0" }}>

      {/* 上部：プロフィール帯 */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
        <PoliticianAvatar politician={{ ...p, party: partyName }} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#1E293B" }}>{p.name}</span>
            {p.name_kana && <span style={{ fontSize: 11, color: "#94A3B8" }}>{p.name_kana}</span>}
            <Badge text={partyName} bg={ps.bg} color={ps.text} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[p.house, p.district, p.terms > 0 ? `当選${p.terms}回` : null].filter(Boolean).map((v, i) => (
              <span key={i} style={{ fontSize: 11, color: "#64748B" }}>{v}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setFollowing(!following)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: `1px solid ${following ? "#4F46E5" : "#E2E8F0"}`, background: following ? "#EEF2FF" : "#fff", color: following ? "#4F46E5" : "#64748B", cursor: "pointer" }}>
            {following ? "フォロー中" : "+ フォロー"}
          </button>
          <button onClick={onClose} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: "none", color: "#94A3B8", cursor: "pointer" }}>閉じる</button>
        </div>
      </div>

      {/* 中段：活動スコアカード（独自の通知表形式） */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", borderBottom: "1px solid #F1F5F9" }}>
        {[
          { label: "市民評価", value: avgR ? `${avgR}点` : "未評価", sub: `${totalR}件の口コミ`, color: "#FBBF24", icon: "⭐" },
          { label: "国会発言数", value: p.question_count > 0 ? `${p.question_count.toLocaleString()}回` : "—", sub: "通算", color: "#4F46E5", icon: "🎤" },
          { label: "当選回数", value: p.terms > 0 ? `${p.terms}回` : "—", sub: "通算", color: "#10B981", icon: "🏆" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRight: isMobile ? (i % 2 === 0 ? "1px solid #F1F5F9" : "none") : (i < 2 ? "1px solid #F1F5F9" : "none"), borderBottom: isMobile && i < 2 ? "1px solid #F1F5F9" : "none", background: i === 0 ? "#FFFBEB" : "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span style={{ fontSize: 10, color: "#94A3B8" }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 下段：左＝口コミ、右＝投稿フォーム */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px", maxHeight: isMobile ? "none" : 380, overflow: isMobile ? "visible" : "hidden" }}>

        {/* 左：口コミ一覧 */}
        <div style={{ overflowY: "auto", borderRight: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
            {["口コミ一覧","投票記録","プロフィール"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 600, border: "none", background: "none", cursor: "pointer", color: tab === t ? "#4F46E5" : "#94A3B8", borderBottom: `2px solid ${tab === t ? "#4F46E5" : "transparent"}` }}>{t}</button>
            ))}
          </div>
          <div style={{ padding: "12px 16px" }}>
            {tab === "口コミ一覧" && (
              totalR === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#94A3B8", fontSize: 13 }}>
                  まだ口コミがありません。<br/>右の投稿フォームから最初の口コミを書きましょう！
                </div>
              ) : reviews.map((r, i) => (
                <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < reviews.length-1 ? "1px solid #F8FAFC" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Stars rating={r.rating} size={13} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{r.rating}.0</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#CBD5E1" }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("ja-JP") : ""} · 匿名</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0 }}>{r.body}</p>
                </div>
              ))
            )}
            {tab === "投票記録" && (
              votes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#94A3B8", fontSize: 13 }}>投票記録データを準備中です</div>
              ) : votes.map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #F8FAFC", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: VOTE_STYLE[v.result]?.bg, color: VOTE_STYLE[v.result]?.text, fontWeight: 600, flexShrink: 0 }}>{v.result}</span>
                  <div>
                    <div style={{ fontSize: 12, color: "#1E293B", lineHeight: 1.5 }}>{v.bill_name}</div>
                    <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{v.voted_at}</div>
                  </div>
                </div>
              ))
            )}
            {tab === "プロフィール" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* 基本情報 */}
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", padding: "8px 0 4px", letterSpacing: 0.5 }}>基本情報</div>
                {[
                  { label: "所属政党", value: partyName },
                  { label: "院", value: p.house },
                  { label: "選挙区", value: p.district || "—" },
                  { label: "当選回数", value: p.terms ? `${p.terms}回` : "—" },
                ].map((row, i) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F8FAFC" }}>
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{row.value}</span>
                  </div>
                ))}

                {/* 国会活動実績 */}
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", padding: "12px 0 4px", letterSpacing: 0.5 }}>国会活動実績</div>
                {[
                  { label: "国会発言数", value: p.question_count > 0 ? `${p.question_count.toLocaleString()}回` : "—", note: "通算" },
                  ...(p.committee ? [{ label: "委員会所属", value: p.committee, note: "" }] : []),
                ].map((row, i) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F8FAFC" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>{row.label}</div>
                      {row.note && <div style={{ fontSize: 10, color: "#CBD5E1" }}>{row.note}</div>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", textAlign: "right", maxWidth: 160 }}>{row.value}</span>
                  </div>
                ))}

                {/* 政治資金 */}
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", padding: "12px 0 4px", letterSpacing: 0.5 }}>政治資金</div>
                <div style={{ padding: "8px 0", borderBottom: "1px solid #F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>政治資金収支報告書</div>
                    <div style={{ fontSize: 10, color: "#CBD5E1" }}>総務省・都道府県選管公開</div>
                  </div>
                  <a
                    href={`https://www.soumu.go.jp/senkyo/seiji_s/seijishikin/contents/SF${new Date().getFullYear()-1}0930.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}
                  >
                    総務省で確認 →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右：口コミ投稿フォーム（常時表示） */}
        <div style={{ padding: "14px", background: "#FAFAFA", overflowY: "auto" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 12 }}>口コミを投稿する</div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>完全匿名で投稿できます</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {[1,2,3,4,5].map(n => (
              <span key={n}
                onMouseEnter={() => setHoverStar(n)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => setStar(n)}
                style={{ fontSize: 26, cursor: "pointer", display: "inline-block", transition: "transform 0.1s", transform: n <= (hoverStar || star) ? "scale(1.15)" : "scale(1)", color: n <= (hoverStar || star) ? "#FBBF24" : "#E5E7EB" }}>★</span>
            ))}
          </div>
          {star > 0 && (
            <div style={{ fontSize: 12, color: "#4F46E5", fontWeight: 600, marginBottom: 8 }}>
              {["","とても悪い","悪い","普通","良い","とても良い"][star]}
            </div>
          )}
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={`${p.name}議員についてのご意見・評価をお書きください（500文字以内）`}
            style={{ width: "100%", minHeight: 100, fontSize: 12, padding: 9, borderRadius: 8, border: "1px solid #E2E8F0", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box", color: "#1E293B", background: "#fff", lineHeight: 1.6 }}
          />
          <div style={{ fontSize: 10, color: "#94A3B8", textAlign: "right", marginBottom: 8 }}>{body.length}/500</div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !star || !body.trim()}
            style={{ width: "100%", background: star && body.trim() ? "#1E293B" : "#E2E8F0", color: star && body.trim() ? "#fff" : "#94A3B8", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: star && body.trim() ? "pointer" : "default" }}>
            {submitting ? "投稿中..." : submitted ? "✓ 口コミを投稿しました" : "この議員に口コミを投稿する"}
          </button>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>ガイドライン</div>
            {["実際の経験に基づいた投稿をお願いします","誹謗中傷・虚偽の情報は禁止です","個人情報の記載はお控えください"].map((g, i) => (
              <div key={i} style={{ fontSize: 10, color: "#CBD5E1", marginBottom: 3 }}>· {g}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// コラム一覧ページ
// ============================================================
function ColumnPage({ onSelectArticle }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseFetch("articles", {
      filter: "is_published=eq.true",
      order: "published_at.desc",
    }).then(data => {
      setArticles(data || []);
      setLoading(false);
    });
  }, []);

  const fmtDate = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
  };

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 14, letterSpacing: 0.5 }}>政治コラム</div>
        {loading ? <LoadingSpinner /> : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>記事がまだありません</div>
        ) : articles.map(a => (
          <div key={a.id}
            onClick={() => onSelectArticle(a.slug)}
            style={{ background: "#fff", borderRadius: 16, border: "2px solid #F1F5F9", marginBottom: 14, cursor: "pointer", overflow: "hidden" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            {a.thumbnail_url
              ? <img src={a.thumbnail_url} alt={a.title} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
              : <div style={{ width: "100%", height: 100, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📰</div>
            }
            <div style={{ padding: "14px 16px 16px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", lineHeight: 1.5, marginBottom: 6 }}>{a.title}</div>
              {a.excerpt && <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7, marginBottom: 10 }}>{a.excerpt}</div>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {(a.tags || []).slice(0, 4).map(t => (
                    <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#EEF2FF", color: "#4F46E5", fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{fmtDate(a.published_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 記事詳細ページ
// ============================================================
const MD_COMPONENTS = {
  img: ({ node, ...props }) => (
    <img {...props} style={{ maxWidth: "100%", height: "auto", borderRadius: 8, margin: "12px 0", display: "block" }} alt={props.alt || ""} />
  ),
  h1: ({ node, ...props }) => <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", margin: "28px 0 10px", lineHeight: 1.4 }} {...props} />,
  h2: ({ node, ...props }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", margin: "24px 0 8px", lineHeight: 1.4, paddingBottom: 6, borderBottom: "2px solid #EEF2FF" }} {...props} />,
  h3: ({ node, ...props }) => <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "20px 0 6px" }} {...props} />,
  p: ({ node, ...props }) => <p style={{ margin: "0 0 16px", lineHeight: 1.8 }} {...props} />,
  ul: ({ node, ...props }) => <ul style={{ paddingLeft: 24, margin: "0 0 16px" }} {...props} />,
  ol: ({ node, ...props }) => <ol style={{ paddingLeft: 24, margin: "0 0 16px" }} {...props} />,
  li: ({ node, ...props }) => <li style={{ marginBottom: 6, lineHeight: 1.7 }} {...props} />,
  a: ({ node, ...props }) => <a {...props} style={{ color: "#4F46E5", textDecoration: "none" }} target="_blank" rel="noopener noreferrer" />,
  blockquote: ({ node, ...props }) => (
    <blockquote style={{ borderLeft: "4px solid #C7D2FE", margin: "16px 0", padding: "8px 16px", color: "#64748B", background: "#F8FAFF", borderRadius: "0 8px 8px 0" }} {...props} />
  ),
  pre: ({ node, ...props }) => <pre style={{ background: "#1E293B", padding: 16, borderRadius: 8, overflowX: "auto", margin: "16px 0" }} {...props} />,
  code: ({ node, ...props }) => <code style={{ background: "#F1F5F9", padding: "2px 6px", borderRadius: 4, fontSize: 14, color: "#4F46E5", fontFamily: "monospace" }} {...props} />,
  table: ({ node, ...props }) => <div style={{ overflowX: "auto", margin: "16px 0" }}><table style={{ borderCollapse: "collapse", width: "100%" }} {...props} /></div>,
  th: ({ node, ...props }) => <th style={{ padding: "8px 12px", background: "#F8FAFF", borderBottom: "2px solid #E2E8F0", textAlign: "left", fontWeight: 600, color: "#1E293B", fontSize: 14 }} {...props} />,
  td: ({ node, ...props }) => <td style={{ padding: "8px 12px", borderBottom: "1px solid #F1F5F9", color: "#374151", fontSize: 14 }} {...props} />,
};

function ArticlePage({ slug, onBack }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabaseFetch("articles", { filter: `slug=eq.${slug}`, limit: 1 }).then(data => {
      setArticle(data?.[0] || null);
      setLoading(false);
    });
  }, [slug]);

  const fmtDate = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
  };

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748B", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", fontFamily: "inherit" }}>
          ← コラム一覧に戻る
        </button>
        {loading ? <LoadingSpinner /> : !article ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>記事が見つかりませんでした</div>
        ) : (
          <article style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", margin: "0 16px 32px" }}>
            {article.thumbnail_url && (
              <img src={article.thumbnail_url} alt={article.title} style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
            )}
            <div style={{ padding: "20px 20px 36px" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", lineHeight: 1.5, margin: "0 0 10px" }}>{article.title}</h1>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>{fmtDate(article.published_at)}</span>
                {article.author && <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{article.author}</span>}
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 24 }}>
                {(article.tags || []).map(t => (
                  <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#EEF2FF", color: "#4F46E5", fontWeight: 600 }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.8, color: "#374151" }}>
                <ReactMarkdown components={MD_COMPONENTS}>{article.content}</ReactMarkdown>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

// ============================================================
// メインApp
// ============================================================
// ============================================================
// 利用規約ページ
// ============================================================
function TermsPage() {
  const sections = [
    {
      title: "1. サービスについて",
      content: "政治家レビュー（以下「本サービス」）は、国会議員に関する公開情報の閲覧および市民による口コミの投稿・共有を目的としたプラットフォームです。本サービスは政治的中立を保ち、特定の政党・候補者を支持・批判する目的では運営していません。"
    },
    {
      title: "2. 禁止事項",
      content: "以下の投稿は禁止します：\n・事実に基づかない虚偽の情報\n・誹謗中傷・人格攻撃\n・個人情報（住所・電話番号等）の記載\n・差別的・暴力的な表現\n・選挙運動・政治的勧誘を目的とした投稿\n・著作権を侵害するコンテンツ"
    },
    {
      title: "3. 口コミの取り扱い",
      content: "投稿された口コミは匿名で公開されます。運営は不適切な口コミを予告なく削除する権利を有します。口コミの内容は投稿者の意見であり、運営の見解を表すものではありません。"
    },
    {
      title: "4. データの出典",
      content: "議員データは各議員の公式プロフィール等の公開情報を元にしています。国会会議録データは国立国会図書館「国会会議録検索システム」APIより取得しています（出典：国立国会図書館）。"
    },
    {
      title: "5. 免責事項",
      content: "本サービスに掲載される情報の正確性・完全性について保証しません。本サービスの利用により生じた損害について、運営は一切の責任を負いません。"
    },
    {
      title: "6. 削除依頼",
      content: "掲載情報や口コミへの削除依頼は、サービス内のお問い合わせフォームよりご連絡ください。内容を確認の上、適切に対応いたします。"
    },
    {
      title: "7. プライバシーポリシー",
      content: "本サービスは口コミ投稿時に個人を特定できる情報を収集しません。アクセス解析のためCookieを使用する場合があります。"
    },
  ];

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>利用規約・プライバシーポリシー</h1>
          <p style={{ fontSize: 13, color: "#94A3B8" }}>最終更新日：2025年5月14日</p>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 10, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.8, whiteSpace: "pre-line" }}>{s.content}</div>
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: "#94A3B8" }}>
          © {new Date().getFullYear()} 政治家レビュー · 国会会議録データ出典：国立国会図書館
        </div>
      </div>
    </div>
  );
}

// ============================================================
// お問い合わせページ（Netlify Forms）
// ============================================================
const encodeForm = (data) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");

function ContactPage() {
  const [fields, setFields] = useState({ name: "", email: "", message: "", "bot-field": "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  const handleChange = (e) => setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm({ "form-name": "contact", ...fields }),
    })
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", fontSize: 15, padding: "12px 14px",
    borderRadius: 10, border: "1.5px solid #E2E8F0", outline: "none",
    color: "#1E293B", background: "#fff", appearance: "none",
  };

  if (status === "done") {
    return (
      <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>送信しました</div>
          <div style={{ fontSize: 14, color: "#64748B" }}>お問い合わせありがとうございます。内容を確認の上、ご連絡いたします。</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>お問い合わせ</h1>
          <p style={{ fontSize: 13, color: "#94A3B8" }}>掲載情報の削除依頼・ご意見・ご質問はこちらからご連絡ください。</p>
        </div>

        <form
          name="contact"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
          style={{ background: "#fff", borderRadius: 14, padding: "24px 20px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Netlify 必須: form-name hidden */}
          <input type="hidden" name="form-name" value="contact" />
          {/* honeypot: スパム対策（非表示） */}
          <div style={{ display: "none" }}>
            <label>ここは入力しないでください<input name="bot-field" onChange={handleChange} /></label>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              お名前 <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text" name="name" value={fields.name} onChange={handleChange}
              placeholder="山田 太郎" required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              メールアドレス <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="email" name="email" value={fields.email} onChange={handleChange}
              placeholder="example@mail.com" required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              お問い合わせ内容 <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              name="message" value={fields.message} onChange={handleChange}
              placeholder="お問い合わせ内容をご記入ください。" required rows={6}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            />
          </div>

          {status === "error" && (
            <div style={{ fontSize: 13, color: "#EF4444", background: "#FEF2F2", padding: "10px 14px", borderRadius: 8 }}>
              送信に失敗しました。時間をおいて再度お試しください。
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 10, border: "none",
              background: status === "sending" ? "#94A3B8" : "#6366F1", color: "#fff",
              cursor: status === "sending" ? "not-allowed" : "pointer", transition: "background 0.2s",
            }}
          >
            {status === "sending" ? "送信中..." : "送信する"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// プライバシーポリシーページ
// ============================================================
function PrivacyPage() {
  const sections = [
    {
      title: "1. 個人情報の取得について",
      content: "本サービスでは、お問い合わせフォームをご利用の際に、お名前およびメールアドレスを取得します。それ以外の個人情報は収集しておりません。",
    },
    {
      title: "2. 個人情報の利用目的",
      content: "取得した個人情報は、お問い合わせへの回答を行うためにのみ使用します。ご本人の同意なく第三者に提供することはありません。",
    },
    {
      title: "3. Cookieについて",
      content: "Cookie（クッキー）とは、ウェブサイトがお使いのブラウザに保存する小さなテキストデータです。本サービスはサービス改善のためCookieを使用します。Cookieはお使いのブラウザの設定から無効化することができますが、一部機能が利用できなくなる場合があります。",
    },
    {
      title: "4. アクセス解析ツール（Google Analytics）について",
      content: "本サービスでは、Googleが提供するアクセス解析ツール「Google Analytics（GA4）」を使用しています。Google AnalyticsはCookieを使用してアクセス情報を収集しますが、個人を特定する情報は含まれません。収集されたデータはGoogleのプライバシーポリシーに基づき管理されます。\n\nGoogle プライバシーポリシー：https://policies.google.com/privacy",
    },
    {
      title: "5. 広告配信について（Google AdSense）",
      content: "本サービスでは、Google LLCが提供する広告配信サービス「Google AdSense」を使用しています。Googleを含む第三者配信事業者は、ユーザーが本サービスや他のウェブサイトを過去に訪問した際の情報に基づき、興味に応じた広告を表示するためにCookieを使用します。\n\n・パーソナライズ広告の無効化：https://www.google.com/settings/ads\n・AdSenseの仕組みの詳細：https://policies.google.com/technologies/ads",
    },
    {
      title: "6. 免責事項",
      content: "本サービスに掲載する情報の正確性・完全性に努めますが、内容を保証するものではありません。本サービスは政治的中立を旨とし、特定の政党・政治家・候補者を支持または批判する目的で運営しておりません。掲載情報の利用により生じた損害について、運営は一切の責任を負いません。",
    },
    {
      title: "7. 著作権について",
      content: "本サービスに掲載されているコンテンツ（テキスト・画像・デザイン等）の著作権は、運営または正当な権利を有する第三者に帰属します。無断転載・複製・改変はお断りします。なお、国会会議録データは国立国会図書館「国会会議録検索システム」APIより取得しており、同館の利用規約に従います。",
    },
    {
      title: "8. プライバシーポリシーの変更について",
      content: "本プライバシーポリシーは、法令変更やサービス内容の変化に応じて予告なく改定する場合があります。改定後のポリシーは本ページに掲載した時点で効力を生じるものとします。",
    },
    {
      title: "9. 制定日・最終更新日",
      content: "制定日：2026年6月13日\n最終更新日：2026年6月13日",
    },
  ];

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>プライバシーポリシー</h1>
          <p style={{ fontSize: 13, color: "#94A3B8" }}>最終更新日：2026年6月13日</p>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 10, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.9, whiteSpace: "pre-line" }}>{s.content}</div>
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: "#94A3B8" }}>
          © {new Date().getFullYear()} 政治家レビュー
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 運営者情報ページ
// ============================================================
function AboutPage({ setPage }) {
  const rows = [
    { label: "サイト名", value: "政治家レビュー" },
    { label: "運営者", value: "時事ニュース本音で言っていいすか" },
    { label: "X（旧Twitter）", value: "@english__hal", link: "https://x.com/english__hal" },
  ];

  return (
    <div style={{ background: "#F8FAFF", minHeight: "calc(100vh - 110px)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>運営者情報</h1>
        </div>

        {/* 基本情報 */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: 10 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: i < rows.length - 1 ? "1px solid #F1F5F9" : "none", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#94A3B8", minWidth: 130, flexShrink: 0 }}>{r.label}</span>
              {r.link ? (
                <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: "#6366F1", fontWeight: 500, textDecoration: "none" }}>{r.value}</a>
              ) : (
                <span style={{ fontSize: 15, color: "#1E293B", fontWeight: 500 }}>{r.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* サイトの目的 */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 10, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>サイトの目的</div>
          <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.9 }}>
            政治家レビューは、国会議員の基本情報（所属政党・選挙区・当選回数）や国会での発言数などの公開情報と、市民による口コミ・評価を中立的に共有するプラットフォームです。発言数は国立国会図書館「国会会議録検索システム」のデータを用いています。特定の政党・政治家を支持・批判する目的ではなく、有権者が客観的な情報にアクセスできる場を提供することを目的としています。
          </div>
        </div>

        {/* お問い合わせ */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 10, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>お問い合わせ</div>
          <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.9, marginBottom: 14 }}>
            掲載情報の削除依頼・ご意見・ご質問は、お問い合わせフォームよりご連絡ください。
          </div>
          <button
            onClick={() => setPage("contact")}
            style={{ padding: "12px 24px", fontSize: 14, fontWeight: 700, borderRadius: 10, border: "none", background: "#6366F1", color: "#fff", cursor: "pointer" }}
          >
            お問い合わせフォームへ
          </button>
        </div>

        <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: "#94A3B8" }}>
          © {new Date().getFullYear()} 政治家レビュー
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("map");
  const [selectedPol, setSelectedPol] = useState(null);
  const [currentSlug, setCurrentSlug] = useState(null);
  const [stats, setStats] = useState({ total: 84, shugiin: 54, sangiin: 30, reviews: 0 });

  useEffect(() => {
    async function loadStats() {
      const [all, reviewCount] = await Promise.all([
        supabaseFetch("politicians", { select: "id,house", limit: 1000 }),
        supabaseCount("reviews"),
      ]);
      if (all?.length) {
        setStats({
          total: all.length,
          shugiin: all.filter(p => p.house === "衆議院").length,
          sangiin: all.filter(p => p.house === "参議院").length,
          reviews: reviewCount,
        });
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const m = path.match(/^\/articles\/(.+)$/);
    if (m) {
      setCurrentSlug(m[1]);
      setPage("article");
    }
    const onPop = () => {
      const p = window.location.pathname;
      const match = p.match(/^\/articles\/(.+)$/);
      if (match) {
        setCurrentSlug(match[1]);
        setPage("article");
      } else {
        setCurrentSlug(null);
        setPage("column");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div style={{ fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif", background: "#F8FAFF", minHeight: "100vh" }}>
      <Header page={page} setPage={setPage} stats={stats} />
      {page === "map" && <MapPage onSelect={setSelectedPol} />}
      {page === "ranking" && <RankingPage onSelect={setSelectedPol} />}
      {page === "news" && <NewsPage onSelect={setSelectedPol} />}
      {page === "column" && <ColumnPage onSelectArticle={slug => { setCurrentSlug(slug); setPage("article"); window.history.pushState({}, "", `/articles/${slug}`); }} />}
      {page === "article" && <ArticlePage slug={currentSlug} onBack={() => { setCurrentSlug(null); setPage("column"); window.history.pushState({}, "", "/"); }} />}
      {page === "kokkai" && <KokkaiPage onSelect={setSelectedPol} />}
      {page === "schedule" && <SchedulePage />}
      {page === "terms" && <TermsPage />}
      {page === "contact" && <ContactPage />}
      {page === "privacy" && <PrivacyPage />}
      {page === "about" && <AboutPage setPage={setPage} />}
      {selectedPol && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, maxHeight: "70vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(0,0,0,0.15)" }}>
          <DetailPanel politician={selectedPol} onClose={() => setSelectedPol(null)} />
        </div>
      )}
      {/* フッター */}
      {!selectedPol && (
        <footer style={{ borderTop: "1px solid #E2E8F0", padding: "16px 20px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>© {new Date().getFullYear()} 政治家レビュー</span>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => setPage("terms")} style={{ fontSize: 12, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>利用規約</button>
            <button onClick={() => setPage("privacy")} style={{ fontSize: 12, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>プライバシーポリシー</button>
            <button onClick={() => setPage("about")} style={{ fontSize: 12, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>運営者情報</button>
            <button onClick={() => setPage("contact")} style={{ fontSize: 12, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>お問い合わせ</button>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>国会データ出典：国立国会図書館</span>
          </div>
        </footer>
      )}
    </div>
  );
}
