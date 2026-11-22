import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Activity, BookUser, ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, Users, X } from "lucide-react";
import api, { errorMessage } from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import ContactForm from "./pages/ContactForm";
import Favourites from "./pages/Favourites";

function Protected({ children }) {
  return localStorage.getItem("cms_token") ? children : <Navigate to="/login" replace />;
}

function Shell({ children, admin, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e) => e.key === "Escape" && setConfirmOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);
  const location = useLocation();
  const title = location.pathname.startsWith("/contacts/new") ? "Add contact"
    : location.pathname.includes("/edit") ? "Edit contact"
    : location.pathname.startsWith("/contacts") ? "Contacts"
    : location.pathname.startsWith("/favourites") ? "Favourite contacts" : "Dashboard";
  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/contacts", label: "All contacts", icon: Users },
    { to: "/favourites", label: "Favourites", icon: Heart }
  ];
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><BookUser size={21}/></div><span>Contact Management <b>System</b></span><button className="sidebar-close" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        {nav.map(item => <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}><item.icon size={19}/><span>{item.label}</span>{item.to === "/favourites" && <span className="nav-dot"/>}</NavLink>)}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Activity size={17}/></div><strong>Stay connected</strong><p>Keep your professional network organised in one place.</p></div><button className="sidebar-logout" onClick={() => setConfirmOpen(true)}><LogOut size={18}/><span>Sign out</span></button><div className="sidebar-foot"><span className="online-dot"/> System operational</div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div><div className="breadcrumb">Workspace <span>/</span> <b>{title}</b></div><h1>{title}</h1></div></div><div className="topbar-right"><div className="top-date"><span className="online-dot"/> Admin workspace</div><div className="profile-wrap"><div className="avatar">{(admin?.name || "A").slice(0,1).toUpperCase()}</div><div className="profile-copy"><strong>{admin?.name || "Administrator"}</strong><span>Administrator</span></div><button className="icon-button logout-button" title="Sign out" onClick={() => setConfirmOpen(true)}><LogOut size={17}/></button></div></div></header>
      <div className="page-content" key={location.pathname}>{children}</div>
      <footer className="footer"><span>© {new Date().getFullYear()} Contact Management System</span><span>Contact management workspace</span></footer>
    </main>
    {confirmOpen && <div className="modal-scrim" onClick={() => setConfirmOpen(false)}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="signout-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon"><LogOut size={24}/></div>
        <h3 id="signout-title">Sign out?</h3>
        <p>You will need to sign in again to manage your contacts.</p>
        <div className="modal-actions">
          <button className="secondary-button" onClick={() => setConfirmOpen(false)}>Stay signed in</button>
          <button className="primary-button" onClick={() => { setConfirmOpen(false); onLogout(); }}>Sign out</button>
        </div>
      </div>
    </div>}
  </div>;
}

export default function App() {
  const [admin, setAdmin] = useState(() => { try { return JSON.parse(localStorage.getItem("cms_admin") || "null"); } catch { return null; } });
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (localStorage.getItem("cms_token")) {
      api.get("/auth/me").then(({data}) => { setAdmin(data.admin); localStorage.setItem("cms_admin", JSON.stringify(data.admin)); }).catch(() => {});
    }
  }, []);
  const logout = () => { localStorage.removeItem("cms_token"); localStorage.removeItem("cms_admin"); setAdmin(null); navigate("/login"); };
  const login = (data) => { localStorage.setItem("cms_token", data.token); localStorage.setItem("cms_admin", JSON.stringify(data.admin)); setAdmin(data.admin); navigate("/"); };
  if (location.pathname === "/login") return localStorage.getItem("cms_token") ? <Navigate to="/" replace/> : <Login onLogin={login}/>;
  return <Protected><Shell admin={admin} onLogout={logout}><Routes>
    <Route path="/" element={<Dashboard/>}/>
    <Route path="/contacts" element={<Contacts/>}/>
    <Route path="/contacts/new" element={<ContactForm/>}/>
    <Route path="/contacts/:id/edit" element={<ContactForm/>}/>
    <Route path="/favourites" element={<Favourites/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Shell></Protected>;
}