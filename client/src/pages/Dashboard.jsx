import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, ContactRound, Heart, HeartOff, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api";
import ContactTable from "../components/ContactTable";
import Toast from "../components/Toast";

function CountUp({ value, loading }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (loading) return;
    let raf, start;
    const duration = 900;
    const tick = (t) => {
      start = start ?? t;
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, loading]);
  return <>{loading ? "—" : n.toLocaleString()}</>;
}

export default function Dashboard() {
  const [stats, setStats] = useState({total:0,favourite:0,unfavourite:0});
  const [recent, setRecent] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try { const [s,c] = await Promise.all([api.get("/contacts/stats"),api.get("/contacts?limit=5&page=1")]); setStats(s.data); setRecent(c.data.contacts); }
    catch (e) { setToast({type:"error",message:errorMessage(e)}); }
    finally { setLoading(false); }
  };
  useEffect(()=>{load();},[]);
  const cards = [
    {label:"Total contacts",value:stats.total,icon:Users,tone:"blue",note:"All saved contacts"},
    {label:"Favourite contacts",value:stats.favourite,icon:Heart,tone:"rose",note:"Your priority connections"},
    {label:"Unfavourite contacts",value:stats.unfavourite,icon:HeartOff,tone:"amber",note:"Other saved connections"}
  ];
  return <><Toast toast={toast} onClose={()=>setToast(null)}/><div className="welcome-row"><div><div className="eyebrow">OVERVIEW</div><h2>Your contacts at a glance</h2><p>Here’s what’s happening across your contact directory.</p></div><Link to="/contacts/new" className="primary-button"><Plus size={18}/> Add new contact</Link></div><div className="stats-grid">{cards.map((c,i)=><div className="stat-card" key={c.label} style={{"--i":i}}><div className="stat-top"><span>{c.label}</span><div className={`stat-icon ${c.tone}`}><c.icon size={20}/></div></div><div className="stat-value"><CountUp value={c.value} loading={loading}/></div><div className="stat-note"><span className="note-dot"/> {c.note}</div></div>)}</div><section className="content-card recent-card"><div className="section-heading"><div><h3>Recently added contacts</h3><p>Your latest connections in the directory</p></div><Link to="/contacts" className="text-link">View all contacts <ArrowRight size={16}/></Link></div>{loading?<div className="loading-state">Loading contacts...</div>:<ContactTable contacts={recent} readOnly/>}</section><div className="dashboard-tip"><div className="tip-icon"><ContactRound size={20}/></div><div><strong>Keep your directory up to date</strong><p>Add contact details and mark important people as favourites for quick access.</p></div><Link to="/favourites" className="text-link">View favourites <ArrowUpRight size={16}/></Link></div></>;
}