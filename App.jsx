import { useState } from "react";

const POLITICIANS = [
  { id: 1, name: "田中 一郎", initials: "田中", party: "自民党", house: "衆議院", district: "東京1区", terms: 5, rating: 4.7, reviews: 1243, attendance: 96, questions: 312, color: "#E6F1FB", textColor: "#185FA5", tags: ["地元密着", "経済政策", "質問回数多"] },
  { id: 2, name: "佐藤 美咲", initials: "佐藤", party: "立憲民主", house: "参議院", district: "比例代表", terms: 2, rating: 4.4, reviews: 876, attendance: 91, questions: 198, color: "#E1F5EE", textColor: "#0F6E56", tags: ["子育て支援", "SNS活発"] },
  { id: 3, name: "鈴木 健太", initials: "鈴木", party: "公明党", house: "衆議院", district: "大阪3区", terms: 3, rating: 4.2, reviews: 654, attendance: 94, questions: 154, color: "#FAECE7", textColor: "#993C1D", tags: ["福祉", "答弁率高"] },
  { id: 4, name: "山本 雄二", initials: "山本", party: "自民党", house: "衆議院", district: "神奈川5区", terms: 1, rating: 4.0, reviews: 312, attendance: 88, questions: 87, color: "#EEEDFE", textColor: "#534AB7", tags: ["デジタル政策", "若手注目株"] },
  { id: 5, name: "中村 花子", initials: "中村", party: "日本維新", house: "参議院", district: "大阪府", terms: 1, rating: 3.8, reviews: 241, attendance: 89, questions: 112, color: "#FAEEDA", textColor: "#854F0B", tags: ["改革派", "財政再建"] },
];

const VOTES = [
  { bill: "子ども・子育て支援法改正案", date: "2025年6月12日", result: "賛成" },
  { bill: "経済安全保障推進法改正案", date: "2025年5月28日", result: "賛成" },
  { bill: "最低賃金法改正案（野党提出）", date: "2025年5月14日", result: "反対" },
  { bill: "地方自治法改正案", date: "2025年4月30日", result: "欠席" },
  { bill: "防衛費増額財源確保法案", date: "2025年4月10日", result: "賛成" },
];

const REVIEWS = [
  { user: "東京在住・40代", rating: 5, date: "2025年6月15日", body: "地元の陳情に対して秘書を通じて丁寧に対応してもらいました。子育て支援の政策には特に力を入れており、地域の保育所問題でも動いてくれた実績があります。", tags: ["地元密着", "対応が早い"], helpful: 42 },
  { user: "匿名ユーザー", rating: 4, date: "2025年6月8日", body: "演説はわかりやすく、政策の説明も丁寧。ただ党の方針に従う投票が多く、独自色が弱い印象。", tags: ["説明が丁寧", "党従属気味"], helpful: 18 },
  { user: "神田区民", rating: 5, date: "2025年5月29日", body: "街頭演説を聞く機会がありましたが、経済政策についての知識が深く説得力がありました。地元のイベントにも積極的に顔を出している姿勢は好感が持てます。", tags: ["経済政策", "地元活動"], helpful: 27 },
];

const PARTY_COLORS = {
  "自民党": { bg: "#EEEDFE", text: "#534AB7" },
  "立憲民主": { bg: "#E6F1FB", text: "#185FA5" },
  "公明党": { bg: "#E1F5EE", text: "#0F6E56" },
  "日本維新": { bg: "#FAEEDA", text: "#854F0B" },
};

const VOTE_STYLES = {
  "賛成": { bg: "#EAF3DE", text: "#3B6D11" },
  "反対": { bg: "#FCEBEB", text: "#A32D2D" },
  "欠席": { bg: "#F1EFE8", text: "#5F5E5A" },
};

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ fontSize: size, color: "#EF9F27", letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#EF9F27" : "#ddd" }}>★</span>
      ))}
    </span>
  );
}

function Avatar({ initials, color, textColor, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: textColor,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 500, flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ text, bg, color }) {
  return (
    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: bg, color }}>{text}</span>
  );
}

function RankingPage({ onSelect }) {
  const [search, setSearch] = useState("");
  const [houseFilter, setHouseFilter] = useState("全て");
  const filtered = POLITICIANS.filter(p => {
    const matchSearch = p.name.includes(search) || p.party.includes(search) || p.district.includes(search);
    const matchHouse = houseFilter === "全て" || p.house === houseFilter;
    return matchSearch && matchHouse;
  });

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "0.5px solid #e5e5e5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#378ADD" }} />
          <span style={{ fontSize: 17, fontWeight: 500 }}>政治家マップ</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ランキング","地図で探す","投票記録","口コミ"].map(n => (
            <span key={n} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: n === "ランキング" ? "#E6F1FB" : "transparent", color: n === "ランキング" ? "#185FA5" : "#888", border: "0.5px solid #e5e5e5", cursor: "pointer" }}>{n}</span>
          ))}
        </div>
      </div>

      {/* search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderBottom: "0.5px solid #e5e5e5", background: "#fafaf9" }}>
        <span style={{ fontSize: 16, color: "#888" }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="政治家名・選挙区・政党で検索..."
          style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid #e5e5e5", background: "#fff", outline: "none" }}
        />
        {["全て","衆議院","参議院"].map(f => (
          <span key={f} onClick={() => setHouseFilter(f)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, cursor: "pointer", background: houseFilter === f ? "#E6F1FB" : "transparent", color: houseFilter === f ? "#185FA5" : "#888", border: "0.5px solid #e5e5e5" }}>{f}</span>
        ))}
      </div>

      {/* list */}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>{filtered.length}名の政治家 — 総合評価順</div>
        {filtered.map((p, i) => (
          <div key={p.id} onClick={() => onSelect(p)}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, border: "0.5px solid #e5e5e5", borderRadius: 12, background: "#fff", marginBottom: 8, cursor: "pointer" }}
          >
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: i < 3 ? ["#FAEEDA","#F1EFE8","#FAECE7"][i] : "#f5f5f5", color: i < 3 ? ["#854F0B","#5F5E5A","#993C1D"][i] : "#888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
            <Avatar initials={p.initials} color={p.color} textColor={p.textColor} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                <Badge text={p.party} bg={PARTY_COLORS[p.party]?.bg || "#eee"} color={PARTY_COLORS[p.party]?.text || "#555"} />
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{p.house} / {p.district} / {p.terms}期</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Stars rating={p.rating} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.rating}</span>
                <span style={{ fontSize: 12, color: "#888" }}>（口コミ {p.reviews.toLocaleString()}件）</span>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                {p.tags.map(t => <span key={t} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, border: "0.5px solid #e5e5e5", color: "#888" }}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPage({ politician, onBack }) {
  const [activeTab, setActiveTab] = useState("口コミ");
  const [reviewText, setReviewText] = useState("");
  const [hoverStar, setHoverStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState(REVIEWS);

  const handleSubmit = () => {
    if (!selectedStar || !reviewText.trim()) return;
    setReviews([{ user: "あなた", rating: selectedStar, date: "たった今", body: reviewText, tags: [], helpful: 0 }, ...reviews]);
    setSubmitted(true);
    setReviewText("");
    setSelectedStar(0);
  };

  const p = politician;

  return (
    <div>
      {/* back */}
      <div onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#888", padding: "10px 20px", borderBottom: "0.5px solid #e5e5e5", cursor: "pointer" }}>
        ← ランキングに戻る
      </div>

      {/* hero */}
      <div style={{ display: "flex", gap: 16, padding: 20, borderBottom: "0.5px solid #e5e5e5" }}>
        <Avatar initials={p.initials} color={p.color} textColor={p.textColor} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{p.house} / {p.district} / 当選{p.terms}回</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <Badge text={p.party} bg={PARTY_COLORS[p.party]?.bg || "#eee"} color={PARTY_COLORS[p.party]?.text || "#555"} />
            <Badge text={p.house} bg="#E6F1FB" color="#185FA5" />
            <Badge text={`${p.terms}期`} bg="#F1EFE8" color="#5F5E5A" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Stars rating={p.rating} size={18} />
            <span style={{ fontSize: 22, fontWeight: 500 }}>{p.rating}</span>
            <span style={{ fontSize: 13, color: "#888" }}>（{p.reviews.toLocaleString()}件の口コミ）</span>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: "0.5px solid #e5e5e5" }}>
        {[
          { label: "質問回数", value: p.questions, unit: "回", sub: "今期" },
          { label: "本会議出席率", value: p.attendance, unit: "%", sub: "平均82%" },
          { label: "口コミ数", value: p.reviews.toLocaleString(), unit: "件", sub: "総合" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "14px 16px", borderRight: i < 2 ? "0.5px solid #e5e5e5" : "none" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{s.value}<span style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>{s.unit}</span></div>
            <div style={{ fontSize: 11, color: "#aaa" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div style={{ display: "flex", borderBottom: "0.5px solid #e5e5e5" }}>
        {["口コミ", "投票記録"].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 20px", fontSize: 14, cursor: "pointer", borderBottom: activeTab === tab ? "2px solid #378ADD" : "2px solid transparent", color: activeTab === tab ? "#378ADD" : "#888", fontWeight: activeTab === tab ? 500 : 400 }}>{tab}</div>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {activeTab === "口コミ" && (
          <div>
            {/* write review */}
            <div style={{ background: "#fafaf9", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>口コミを投稿する</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)} onClick={() => setSelectedStar(n)}
                    style={{ fontSize: 24, cursor: "pointer", color: n <= (hoverStar || selectedStar) ? "#EF9F27" : "#ddd" }}>★</span>
                ))}
                {selectedStar > 0 && <span style={{ fontSize: 12, color: "#888", alignSelf: "center", marginLeft: 4 }}>["","最低","やや不満","普通","良い","とても良い"][selectedStar]</span>}
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="実際に感じたことや経験を具体的に書いてください..."
                style={{ width: "100%", minHeight: 80, fontSize: 13, padding: 10, borderRadius: 8, border: "0.5px solid #e5e5e5", resize: "vertical", fontFamily: "inherit", outline: "none" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "#aaa" }}>{reviewText.length} / 500文字</span>
                <button onClick={handleSubmit} style={{ padding: "7px 16px", borderRadius: 8, background: selectedStar && reviewText.trim() ? "#378ADD" : "#ccc", color: "#fff", border: "none", fontSize: 13, cursor: selectedStar && reviewText.trim() ? "pointer" : "default" }}>
                  {submitted ? "投稿しました！" : "投稿する"}
                </button>
              </div>
            </div>

            {reviews.map((r, i) => (
              <div key={i} style={{ background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#888" }}>{r.user[0]}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.user}</div>
                      <Stars rating={r.rating} size={12} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{r.body}</div>
                {r.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                    {r.tags.map(t => <span key={t} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, border: "0.5px solid #e5e5e5", color: "#888" }}>{t}</span>)}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#aaa" }}>👍 参考になった（{r.helpful}）</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "投票記録" && (
          <div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>直近の本会議投票記録</div>
            {VOTES.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "0.5px solid #e5e5e5" }}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: VOTE_STYLES[v.result].bg, color: VOTE_STYLES[v.result].text, flexShrink: 0, marginTop: 2 }}>{v.result}</span>
                <div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>{v.bill}</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{v.date} · 本会議</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 720, margin: "0 auto", border: "0.5px solid #e5e5e5", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
      {selected
        ? <DetailPage politician={selected} onBack={() => setSelected(null)} />
        : <RankingPage onSelect={setSelected} />
      }
    </div>
  );
}
