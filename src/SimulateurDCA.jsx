import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
`;

const ASSETS = {
  // ETFs Actions
  msci_world: {
    label: "MSCI World", short: "World", icon: "🌍", color: "#4ade80",
    pessimiste: 5, realiste: 8, optimiste: 10.5, bullrun: 12,
    description: "1 600+ entreprises · 23 pays développés",
    staking: null,
    etfs: [
      { name: "Amundi MSCI World", ticker: "CW8", fee: "0,12%", note: "Le plus populaire en France · Réplication physique" },
      { name: "iShares Core MSCI World", ticker: "IWDA", fee: "0,20%", note: "Très liquide · 1600+ entreprises · BlackRock" },
      { name: "Lyxor MSCI World", ticker: "LCWD", fee: "0,12%", note: "Alternative française · Bonne liquidité" },
    ],
  },
  sp500: {
    label: "S&P 500", short: "S&P", icon: "🇺🇸", color: "#60a5fa",
    pessimiste: 6, realiste: 9.5, optimiste: 11, bullrun: 13,
    description: "500 plus grandes entreprises US",
    staking: null,
    etfs: [
      { name: "Amundi S&P 500", ticker: "500", fee: "0,15%", note: "Éligible PEA · Très populaire" },
      { name: "iShares Core S&P 500", ticker: "CSPX", fee: "0,07%", note: "Frais les plus bas · Capitalisant" },
    ],
  },
  emerging: {
    label: "Emerging Markets", short: "EM", icon: "🌏", color: "#f59e0b",
    pessimiste: 3, realiste: 7, optimiste: 11, bullrun: 14,
    description: "Inde, Chine, Brésil · Croissance future",
    staking: null,
    etfs: [
      { name: "iShares Core MSCI EM IMI", ticker: "EIMI", fee: "0,18%", note: "Large + mid + small caps · Très diversifié" },
      { name: "Amundi MSCI Emerging Markets", ticker: "AEEM", fee: "0,20%", note: "Éligible PEA · Synthétique" },
    ],
  },
  nasdaq: {
    label: "NASDAQ 100", short: "QQQ", icon: "💻", color: "#a78bfa",
    pessimiste: 7, realiste: 12, optimiste: 16, bullrun: 20,
    description: "100 plus grandes tech US · Apple, NVIDIA, Meta",
    staking: null,
    etfs: [
      { name: "Amundi NASDAQ-100", ticker: "ANX", fee: "0,22%", note: "Éligible PEA · Réplication synthétique" },
      { name: "iShares NASDAQ 100", ticker: "CNDX", fee: "0,33%", note: "Réplication physique · Très liquide" },
    ],
  },
  stoxx600: {
    label: "Europe Stoxx 600", short: "EU600", icon: "🇪🇺", color: "#38bdf8",
    pessimiste: 4, realiste: 7, optimiste: 9, bullrun: 11,
    description: "600 entreprises européennes · Dividendes élevés",
    staking: null,
    etfs: [
      { name: "iShares STOXX Europe 600", ticker: "EXSA", fee: "0,20%", note: "Très diversifié · 17 pays européens" },
      { name: "Amundi STOXX Europe 600", ticker: "CS6", fee: "0,07%", note: "Frais très bas · Capitalisant" },
    ],
  },
  semiconductors: {
    label: "Semiconducteurs", short: "SEMI", icon: "⚡", color: "#fb923c",
    pessimiste: 8, realiste: 14, optimiste: 20, bullrun: 28,
    description: "NVIDIA, TSMC, ASML · Secteur le plus performant",
    staking: null,
    etfs: [
      { name: "VanEck Semiconductor ETF", ticker: "SMH", fee: "0,35%", note: "35 leaders mondiaux des semi-conducteurs" },
      { name: "iShares Semiconductor ETF", ticker: "SOXX", fee: "0,35%", note: "30 entreprises US · NVIDIA, Intel, Qualcomm" },
    ],
  },
  japan: {
    label: "MSCI Japan", short: "JPN", icon: "🗾", color: "#f472b6",
    pessimiste: 3, realiste: 6, optimiste: 8.5, bullrun: 11,
    description: "Toyota, Sony, SoftBank · 2e marché développé",
    staking: null,
    etfs: [
      { name: "iShares MSCI Japan", ticker: "IJPA", fee: "0,12%", note: "Large + mid caps · 240+ entreprises" },
      { name: "Amundi MSCI Japan", ticker: "CJ1", fee: "0,12%", note: "Éligible PEA · Synthétique" },
    ],
  },
  // Crypto
  bitcoin: {
    label: "Bitcoin", short: "BTC", icon: "₿", color: "#f97316",
    pessimiste: -5, realiste: 15, optimiste: 30, bullrun: 50,
    description: "Crypto · Haute volatilité · Max 10% recommandé",
    staking: null,
    etfs: [
      { name: "Bitcoin", ticker: "BTC", fee: "~1%", note: "Via Trade Republic · Achat direct" },
    ],
  },
  ethereum: {
    label: "Ethereum", short: "ETH", icon: "Ξ", color: "#818cf8",
    pessimiste: -8, realiste: 18, optimiste: 35, bullrun: 60,
    description: "Smart contracts · Staking 2.52% sur Trade Republic",
    staking: 2.52,
    etfs: [
      { name: "Ethereum", ticker: "ETH", fee: "~1%", note: "Via Trade Republic · Staking 2.52%/an inclus" },
    ],
  },
  solana: {
    label: "Solana", short: "SOL", icon: "◎", color: "#34d399",
    pessimiste: -10, realiste: 20, optimiste: 45, bullrun: 80,
    description: "Haute performance · Staking 5.42% sur Trade Republic",
    staking: 5.42,
    etfs: [
      { name: "Solana", ticker: "SOL", fee: "~1%", note: "Via Trade Republic · Staking 5.42%/an inclus" },
    ],
  },
  // Défensifs
  or: {
    label: "Or", short: "Gold", icon: "🥇", color: "#d4a24e",
    pessimiste: 1, realiste: 4, optimiste: 7, bullrun: 9,
    description: "Valeur refuge · Couverture inflation",
    staking: null,
    etfs: [
      { name: "Amundi Physical Gold", ticker: "GOLD", fee: "0,15%", note: "Or physique · ETC" },
      { name: "iShares Physical Gold", ticker: "IGLN", fee: "0,12%", note: "Adossé à de l'or physique · Très liquide" },
    ],
  },
};

const CATEGORIES = [
  { key: "etfs", label: "ETFs Actions", icon: "📈", assets: ["msci_world","sp500","emerging","nasdaq","stoxx600","semiconductors","japan"] },
  { key: "crypto", label: "Crypto", icon: "₿", assets: ["bitcoin","ethereum","solana"] },
  { key: "defensifs", label: "Défensifs", icon: "🏦", assets: ["or"] },
];

const SCENARIOS = [
  { key: "pessimiste", label: "Pessimiste", pct: "5%", color: "#ef4444" },
  { key: "realiste", label: "Réaliste", pct: "8%", color: "#4ade80" },
  { key: "optimiste", label: "Optimiste", pct: "10%", color: "#f59e0b" },
  { key: "bullrun", label: "Bull run", pct: "12%", color: "#c084fc" },
];

const fmt = (v) => Math.round(v).toLocaleString("fr-FR") + " €";
const fmtK = (v) => { if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`; if (v >= 1e3) return `${(v/1e3).toFixed(0)}k`; return Math.round(v).toString(); };

function project(monthly, years, activeAssets, allocations, scenarioKey, initialCapital = 0) {
  const months = years * 12;
  const data = [];
  let bal = initialCapital;
  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      let wr = 0;
      Object.entries(activeAssets).forEach(([k, on]) => {
        if (!on) return;
        const pct = (allocations[k] || 0) / 100;
        const baseRate = ASSETS[k][scenarioKey] / 100;
        const stakingRate = (ASSETS[k].staking || 0) / 100;
        const ar = baseRate + stakingRate;
        wr += pct * (Math.pow(1 + ar, 1/12) - 1);
      });
      bal = bal * (1 + wr) + monthly;
    }
    if (m % 12 === 0) data.push({
      year: m / 12,
      label: `Année ${m / 12}`,
      invested: initialCapital + monthly * m,
      value: bal,
    });
  }
  return data;
}

const Chip = ({ active, label, icon, color, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "12px",
    border: `1.5px solid ${active ? color+"60" : "rgba(255,255,255,0.06)"}`,
    background: active ? color+"10" : "rgba(255,255,255,0.02)",
    cursor: "pointer", transition: "all 0.3s",
  }}>
    <span style={{ fontSize: "17px" }}>{icon}</span>
    <span style={{ fontFamily: "'Sora'", fontSize: "13px", fontWeight: active ? 500 : 400, color: active ? color : "rgba(255,255,255,0.35)", transition: "color 0.3s" }}>{label}</span>
    <div style={{
      width: "17px", height: "17px", borderRadius: "5px", marginLeft: "2px",
      border: `1.5px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
      background: active ? color : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
    }}>{active && <span style={{ color: "#0b0b0f", fontSize: "10px", fontWeight: 700 }}>✓</span>}</div>
  </button>
);

const SBtn = ({ active, label, color, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Sora'", fontSize: "12px", fontWeight: active ? 600 : 400,
    padding: "10px 18px", borderRadius: "10px",
    border: `1.5px solid ${active ? color+"50" : "rgba(255,255,255,0.06)"}`,
    background: active ? color+"12" : "transparent",
    color: active ? color : "rgba(255,255,255,0.3)",
    cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.3px",
  }}>{label}</button>
);

const ASlider = ({ k, value, onChange }) => {
  const a = ASSETS[k];
  return (
    <div className="sim-alloc-row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "6px 0" }}>
      <span style={{ fontSize: "15px", width: "24px", textAlign: "center" }}>{a.icon}</span>
      <span className="sim-alloc-label" style={{ fontFamily: "'Sora'", fontSize: "12px", color: "rgba(255,255,255,0.5)", width: "50px" }}>{a.short}</span>
      <div style={{ flex: 1, position: "relative", height: "5px", background: "rgba(255,255,255,0.04)", borderRadius: "3px" }}>
        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${value}%`, background: `linear-gradient(90deg, ${a.color}90, ${a.color})`, borderRadius: "3px", transition: "width 0.15s" }}/>
        <input type="range" min={0} max={100} step={5} value={value} onChange={e=>onChange(Number(e.target.value))}
          style={{ position: "absolute", top: "-10px", left: 0, width: "100%", height: "24px", WebkitAppearance: "none", appearance: "none", background: "transparent", cursor: "pointer" }}/>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "14px", color: a.color, width: "44px", textAlign: "right", fontWeight: 500 }}>{value}%</span>
    </div>
  );
};

const CTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "rgba(8,8,12,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px 20px", backdropFilter: "blur(20px)", minWidth: "180px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ fontFamily: "'Sora'", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>{d?.label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: p.color }}/>
            <span style={{ fontFamily: "'Sora'", fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{p.name}</span>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "12px", color: p.color, fontWeight: 500 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SimulateurDCA() {
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(12);
  const [scenario, setScenario] = useState("realiste");
  const [actives, setActives] = useState({ msci_world: true, emerging: true, sp500: false, bitcoin: true, or: false });
  const [allocs, setAllocs] = useState({ msci_world: 70, emerging: 20, sp500: 0, bitcoin: 10, or: 0 });
  const [showTable, setShowTable] = useState(false);
  const [anim, setAnim] = useState(0);

  const toggle = k => { setActives(p => { const n={...p,[k]:!p[k]}; if(!n[k]) setAllocs(a=>({...a,[k]:0})); return n; }); };
  const total = useMemo(() => Object.entries(actives).reduce((s,[k,v]) => v ? s+(allocs[k]||0) : s, 0), [actives,allocs]);
  const cnt = Object.values(actives).filter(Boolean).length;

  const wReturn = useMemo(() =>
    Object.entries(actives).reduce((s,[k,on]) => on ? s+(allocs[k]/100)*ASSETS[k][scenario] : s, 0), [actives,allocs,scenario]);

  const projs = useMemo(() => {
    if (total !== 100 || cnt === 0) return null;
    const r = {};
    SCENARIOS.forEach(s => { r[s.key] = project(monthly, years, actives, allocs, s.key); });
    return r;
  }, [monthly, years, actives, allocs, total, cnt]);

  const chart = useMemo(() => {
    if (!projs) return [];
    return projs.realiste.map((d,i) => ({
      year: d.year, label: d.label, invested: d.invested,
      pessimiste: projs.pessimiste[i]?.value||0, realiste: d.value,
      optimiste: projs.optimiste[i]?.value||0, bullrun: projs.bullrun[i]?.value||0,
    }));
  }, [projs]);

  const sel = projs?.[scenario];
  const finalV = sel?.[sel.length-1]?.value || 0;
  const totalInv = monthly * years * 12;
  const gains = finalV - totalInv;

  useEffect(() => { setAnim(a=>a+1); }, [monthly, years, scenario, total]);

  const etfs = useMemo(() =>
    Object.entries(actives).filter(([,v])=>v).flatMap(([k]) => ASSETS[k].etfs.map(e=>({...e, asset: ASSETS[k].label, color: ASSETS[k].color}))), [actives]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", color: "#eae6dc", fontFamily: "'Sora', sans-serif" }}>
      <style>{FONTS_CSS}{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes countUp { from { opacity:0; filter:blur(8px); } to { opacity:1; filter:blur(0); } }
        @keyframes dotPulse { 0%,100% { opacity:0.03; } 50% { opacity:0.06; } }
        @keyframes gradShift { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:#eae6dc; border:2px solid #0b0b0f; cursor:pointer; box-shadow:0 0 12px rgba(234,230,220,0.2); transition:all 0.2s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform:scale(1.25); box-shadow:0 0 20px rgba(234,230,220,0.4); }
        input[type="range"]::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#eae6dc; border:2px solid #0b0b0f; cursor:pointer; box-shadow:0 0 12px rgba(234,230,220,0.2); }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:2px; }

        @media (max-width: 768px) {
          .sim-params-grid { grid-template-columns: 1fr !important; }
          .sim-stats-grid { grid-template-columns: 1fr !important; }
          .sim-container { padding: 28px 16px 48px !important; }
          .sim-header-title { font-size: 32px !important; }
          .sim-param-value { font-size: 32px !important; }
          .sim-stat-value { font-size: 24px !important; }
          .sim-chart-box { padding: 16px !important; }
          .sim-chart-legend { display: none !important; }
          .sim-table-grid { grid-template-columns: 60px 1fr 1fr 1fr 1fr !important; padding: 10px 12px !important; font-size: 10px !important; }
          .sim-table-grid span { font-size: 10px !important; }
          .sim-etf-card { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; padding: 14px 16px !important; }
          .sim-etf-right { align-self: flex-end; }
          .sim-scenario-row { gap: 6px !important; }
          .sim-scenario-row button { padding: 8px 12px !important; font-size: 11px !important; }
          .sim-alloc-row { gap: 8px !important; }
          .sim-alloc-label { display: none !important; }
          .sim-chip-row { gap: 6px !important; }
          .sim-chip-row button { padding: 8px 10px !important; font-size: 11px !important; }
        }

        @media (max-width: 480px) {
          .sim-header-title { font-size: 26px !important; }
          .sim-param-value { font-size: 28px !important; }
          .sim-stat-value { font-size: 20px !important; }
          .sim-stats-grid { gap: 8px !important; }
          .sim-chip-row button { padding: 7px 8px !important; font-size: 10px !important; }
          .sim-chip-row button span:last-child { display: none !important; }
          .sim-table-grid { grid-template-columns: 44px 1fr 1fr 1fr 1fr !important; padding: 8px 8px !important; }
        }
      `}</style>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize:"32px 32px", animation:"dotPulse 10s ease infinite" }}/>

      <div className="sim-container" style={{ position:"relative", zIndex:1, maxWidth:"960px", margin:"0 auto", padding:"48px 32px 64px" }}>

        {/* Header */}
        <div style={{ marginBottom:"48px", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ fontFamily:"'Sora'", fontSize:"11px", color:"rgba(255,255,255,0.25)", letterSpacing:"4px", textTransform:"uppercase", marginBottom:"12px" }}>// Simulateur DCA</div>
          <h1 className="sim-header-title" style={{ fontFamily:"'DM Serif Display'", fontSize:"clamp(36px,6vw,56px)", fontWeight:400, lineHeight:1.1, color:"#eae6dc", margin:0 }}>
            Ton capital dans{" "}
            <span style={{ color:"#4ade80", fontStyle:"italic", background:"linear-gradient(90deg,#4ade80,#60a5fa,#4ade80)", backgroundSize:"200% 100%", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"gradShift 4s ease infinite" }}>{years} ans</span>
          </h1>
          <p style={{ fontFamily:"'Sora'", fontSize:"14px", color:"rgba(255,255,255,0.25)", marginTop:"10px", fontWeight:300 }}>Basé sur les données historiques · Rendements annualisés</p>
        </div>

        {/* Params */}
        <div className="sim-params-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"32px", animation:"fadeUp 0.6s ease 0.1s both" }}>
          {[{label:"Versement mensuel",val:monthly,set:setMonthly,min:50,max:2000,step:50,disp:`${monthly.toLocaleString("fr-FR")}`,unit:"€",pct:monthly/2000},
            {label:"Durée d'investissement",val:years,set:setYears,min:1,max:40,step:1,disp:`${years}`,unit:"ans",pct:(years-1)/39}
          ].map((p,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"16px", padding:"24px 28px" }}>
              <div style={{ fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>{p.label}</div>
              <div className="sim-param-value" style={{ fontFamily:"'Outfit'", fontSize:"40px", color:"#eae6dc", fontWeight:600, marginBottom:"16px", letterSpacing:"-1px" }}>
                {p.disp} <span style={{ fontSize:"28px", color:"#4ade80", fontWeight:400 }}>{p.unit}</span>
              </div>
              <div style={{ position:"relative", height:"4px", background:"rgba(255,255,255,0.04)", borderRadius:"2px" }}>
                <div style={{ position:"absolute", top:0, left:0, height:"100%", width:`${p.pct*100}%`, background:"linear-gradient(90deg,#4ade8050,#4ade80)", borderRadius:"2px", transition:"width 0.15s" }}/>
                <input type="range" min={p.min} max={p.max} step={p.step} value={p.val} onChange={e=>p.set(Number(e.target.value))}
                  style={{ position:"absolute", top:"-10px", left:0, width:"100%", height:"24px", WebkitAppearance:"none", background:"transparent", cursor:"pointer" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Assets */}
        <div style={{ marginBottom:"24px", animation:"fadeUp 0.6s ease 0.15s both" }}>
          <div style={{ fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>Mes actifs</div>
          <div className="sim-chip-row" style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
            {Object.entries(ASSETS).map(([k,a]) => <Chip key={k} active={actives[k]} label={a.label} icon={a.icon} color={a.color} onClick={()=>toggle(k)}/>)}
          </div>
        </div>

        {/* Allocation */}
        {cnt > 0 && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"16px", padding:"24px 28px", marginBottom:"32px", animation:"fadeUp 0.6s ease 0.2s both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div style={{ fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.3)", letterSpacing:"2px", textTransform:"uppercase" }}>Allocation</div>
              <div style={{
                fontFamily:"'JetBrains Mono'", fontSize:"12px", fontWeight:500,
                color: total===100 ? "#4ade80" : total>100 ? "#ef4444" : "#f59e0b",
                padding:"4px 12px", borderRadius:"8px",
                background: total===100 ? "rgba(74,222,128,0.08)" : total>100 ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
              }}>{total}% / 100%</div>
            </div>
            {Object.keys(ASSETS).filter(k=>actives[k]).map(k => <ASlider key={k} k={k} value={allocs[k]} onChange={v=>setAllocs(p=>({...p,[k]:v}))}/>)}
            <div style={{ display:"flex", height:"8px", borderRadius:"4px", overflow:"hidden", marginTop:"16px", background:"rgba(255,255,255,0.03)" }}>
              {Object.keys(ASSETS).filter(k=>actives[k]&&allocs[k]>0).map(k => <div key={k} style={{ width:`${allocs[k]}%`, background:ASSETS[k].color, transition:"width 0.3s" }}/>)}
            </div>
          </div>
        )}

        {/* Scenarios */}
        <div style={{ marginBottom:"24px", animation:"fadeUp 0.6s ease 0.25s both" }}>
          <div style={{ fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>Scénario de performance annuelle</div>
          <div className="sim-scenario-row" style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            {SCENARIOS.map(s => <SBtn key={s.key} active={scenario===s.key} label={`${s.label} — ${scenario===s.key ? wReturn.toFixed(1) : ""}%/an`} color={s.color} onClick={()=>setScenario(s.key)}/>)}
          </div>
        </div>

        {/* Results */}
        {total===100 && projs && (
          <>
            <div key={anim} className="sim-stats-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px", marginBottom:"32px", animation:"fadeUp 0.5s ease both" }}>
              {[{l:"Capital investi",v:fmt(totalInv),c:"#eae6dc",bg:"rgba(255,255,255,0.02)",bc:"rgba(255,255,255,0.05)"},
                {l:"Valeur finale estimée",v:fmt(finalV),c:"#4ade80",bg:"rgba(74,222,128,0.04)",bc:"rgba(74,222,128,0.1)"},
                {l:"Gains générés",v:(gains>=0?"+":"")+fmt(gains),c:gains>=0?"#4ade80":"#ef4444",bg:"rgba(255,255,255,0.02)",bc:"rgba(255,255,255,0.05)"}
              ].map((s,i) => (
                <div key={i} style={{ background:s.bg, border:`1px solid ${s.bc}`, borderRadius:"16px", padding:"24px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>{s.l}</div>
                  <div className="sim-stat-value" style={{ fontFamily:"'Outfit'", fontSize:"30px", color:s.c, fontWeight:600, letterSpacing:"-0.5px", animation:`countUp 0.6s ease ${i*0.1}s both` }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="sim-chart-box" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"16px", padding:"28px", marginBottom:"32px", animation:"fadeUp 0.6s ease 0.15s both" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4ade80" }}/>
                  <span style={{ fontFamily:"'Sora'", fontSize:"14px", fontWeight:500, color:"rgba(255,255,255,0.7)" }}>Évolution du portefeuille</span>
                </div>
                <div className="sim-chart-legend" style={{ display:"flex", gap:"14px", flexWrap:"wrap" }}>
                  {[{c:"rgba(255,255,255,0.25)",l:"Investi",d:true},...SCENARIOS.map(s=>({c:s.color,l:s.label}))].map((x,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                      <div style={{ width:x.d?"12px":"8px", height:x.d?"2px":"8px", borderRadius:x.d?"1px":"4px", background:x.c, borderTop:x.d?`2px dashed ${x.c}`:"none" }}/>
                      <span style={{ fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.3)" }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={chart}>
                  <defs>
                    {SCENARIOS.map(s => (
                      <linearGradient key={s.key} id={`g_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={scenario===s.key?0.15:0.03}/>
                        <stop offset="100%" stopColor={s.color} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                  <XAxis dataKey="year" tick={{fill:"rgba(255,255,255,0.2)",fontFamily:"'JetBrains Mono'",fontSize:10}} axisLine={{stroke:"rgba(255,255,255,0.05)"}} tickLine={false} tickFormatter={v=>`${v}a`}/>
                  <YAxis tick={{fill:"rgba(255,255,255,0.2)",fontFamily:"'JetBrains Mono'",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${fmtK(v)}€`} width={60}/>
                  <Tooltip content={<CTooltip/>}/>
                  <Area type="monotone" dataKey="invested" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="6 4" fill="none" name="Investi" dot={false}/>
                  {SCENARIOS.map(s => <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={scenario===s.key?2.5:1} strokeOpacity={scenario===s.key?1:0.3} fill={`url(#g_${s.key})`} name={s.label} dot={false}/>)}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div style={{ marginBottom:"32px", animation:"fadeUp 0.6s ease 0.2s both" }}>
              <button onClick={()=>setShowTable(!showTable)} style={{
                display:"flex", alignItems:"center", gap:"8px", width:"100%",
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius: showTable?"16px 16px 0 0":"16px",
                padding:"18px 28px", cursor:"pointer", transition:"all 0.3s",
              }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4ade80" }}/>
                <span style={{ fontFamily:"'Sora'", fontSize:"13px", color:"rgba(255,255,255,0.6)", flex:1, textAlign:"left" }}>Projection année par année — 3 scénarios</span>
                <span style={{ fontFamily:"'Sora'", fontSize:"18px", color:"rgba(255,255,255,0.2)", transform:showTable?"rotate(180deg)":"rotate(0)", transition:"transform 0.3s" }}>▾</span>
              </button>
              {showTable && (
                <div style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.04)", borderTop:"none", borderRadius:"0 0 16px 16px", overflow:"hidden", animation:"fadeUp 0.3s ease both" }}>
                  <div className="sim-table-grid" style={{ display:"grid", gridTemplateColumns:"100px 1fr 1fr 1fr 1fr", padding:"14px 28px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    {["Année","Investi","Pessimiste (5%)","Réaliste (8%)","Optimiste (10%)"].map((h,i) => (
                      <span key={i} style={{ fontFamily:"'Sora'", fontSize:"9px", color:"rgba(255,255,255,0.25)", letterSpacing:"1.5px", textTransform:"uppercase", textAlign:i===0?"left":"right" }}>{h}</span>
                    ))}
                  </div>
                  {chart.filter(d=>d.year>0).map((d,i) => (
                    <div key={i} className="sim-table-grid" style={{
                      display:"grid", gridTemplateColumns:"100px 1fr 1fr 1fr 1fr", padding:"12px 28px",
                      borderBottom:"1px solid rgba(255,255,255,0.02)",
                      background:i%2===0?"transparent":"rgba(255,255,255,0.008)", transition:"background 0.2s",
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(74,222,128,0.03)"}
                      onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"rgba(255,255,255,0.008)"}
                    >
                      <span style={{ fontFamily:"'Sora'", fontSize:"12px", color:"rgba(255,255,255,0.3)" }}>Année {d.year}</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", fontSize:"12px", color:"rgba(255,255,255,0.5)", textAlign:"right", fontWeight:500 }}>{fmt(d.invested)}</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", fontSize:"12px", color:"#ef4444", textAlign:"right" }}>{fmt(d.pessimiste)}</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", fontSize:"12px", color:"#4ade80", textAlign:"right" }}>{fmt(d.realiste)}</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", fontSize:"12px", color:"#f59e0b", textAlign:"right" }}>{fmt(d.optimiste)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ETFs */}
            <div style={{ animation:"fadeUp 0.6s ease 0.25s both" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
                <span style={{ fontSize:"14px", color:"#4ade80" }}>→</span>
                <span style={{ fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.3)", letterSpacing:"2px", textTransform:"uppercase" }}>ETF recommandés sur Trade Republic</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {etfs.map((e,i) => (
                  <div key={i} className="sim-etf-card" style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:"14px",
                    padding:"18px 24px", transition:"all 0.3s",
                  }}
                    onMouseEnter={x=>{x.currentTarget.style.borderColor=e.color+"30";x.currentTarget.style.background="rgba(255,255,255,0.03)";}}
                    onMouseLeave={x=>{x.currentTarget.style.borderColor="rgba(255,255,255,0.04)";x.currentTarget.style.background="rgba(255,255,255,0.02)";}}
                  >
                    <div>
                      <div style={{ fontFamily:"'Sora'", fontSize:"14px", fontWeight:500, color:"#eae6dc", marginBottom:"4px" }}>{e.name}</div>
                      <div style={{ fontFamily:"'Sora'", fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>{e.note}</div>
                    </div>
                    <div className="sim-etf-right" style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
                      <span style={{ fontFamily:"'JetBrains Mono'", fontSize:"11px", fontWeight:600, color:e.color, background:e.color+"15", padding:"4px 10px", borderRadius:"6px" }}>{e.ticker}</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{e.fee}/an</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop:"40px", fontFamily:"'Sora'", fontSize:"10px", color:"rgba(255,255,255,0.1)", letterSpacing:"0.5px" }}>
              Rendements passés ne préjugent pas des rendements futurs · Simulation indicative · Pas de frais ni fiscalité inclus
            </div>
          </>
        )}

        {total!==100 && cnt>0 && (
          <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.12)", borderRadius:"16px", padding:"32px", textAlign:"center", animation:"fadeUp 0.5s ease both" }}>
            <div style={{ fontSize:"28px", marginBottom:"12px" }}>⚖️</div>
            <div style={{ fontFamily:"'Sora'", fontSize:"14px", color:"rgba(255,255,255,0.5)" }}>Ajuste ton allocation pour atteindre <span style={{ color:"#f59e0b", fontWeight:600 }}>100%</span></div>
            <div style={{ fontFamily:"'JetBrains Mono'", fontSize:"12px", color:"rgba(255,255,255,0.25)", marginTop:"8px" }}>Actuellement : {total}%</div>
          </div>
        )}

        {cnt===0 && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"16px", padding:"48px", textAlign:"center", animation:"fadeUp 0.5s ease both" }}>
            <div style={{ fontSize:"36px", marginBottom:"16px", opacity:0.4 }}>📊</div>
            <div style={{ fontFamily:"'DM Serif Display'", fontSize:"22px", color:"rgba(255,255,255,0.2)" }}>Sélectionne tes actifs pour commencer</div>
          </div>
        )}
      </div>
    </div>
  );
}
