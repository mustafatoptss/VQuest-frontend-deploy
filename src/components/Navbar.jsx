import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const p = location.pathname;

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-brand">VQuest</Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className={`nav-link ${p === '/' ? 'active' : ''}`}>Ana Sayfa</Link>
              {user?.role === 'admin' && (
                <Link to="/packages" className={`nav-link ${p.startsWith('/packages') ? 'active' : ''}`}>Paketler</Link>
              )}
              <Link to="/profile" className={`nav-link ${p === '/profile' ? 'active' : ''}`}>Profil</Link>
              <Link to="/analysis" className={`nav-link ${p === '/analysis' ? 'active' : ''}`}>Analizler</Link>
              <Link to="/suggest" className={`nav-link ${p === '/suggest' ? 'active' : ''}`}>Soru Öner</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{ color: 'var(--warning)' }}>Admin</Link>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => logout()}>Çıkış Yap</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${p === '/login' ? 'active' : ''}`}>Giriş Yap</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Kayıt Ol</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {user ? (
           <>
              <Link to="/" className={`mobile-nav-item ${p === '/' ? 'active' : ''}`}>
                <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><span>Ana Sayfa</span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/packages" className={`mobile-nav-item ${p.startsWith('/packages') ? 'active' : ''}`}>
                  <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><span>Paketler</span>
                </Link>
              )}
              <Link to="/profile" className={`mobile-nav-item ${p === '/profile' ? 'active' : ''}`}>
                <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><span>Profil</span>
              </Link>
              <Link to="/analysis" className={`mobile-nav-item ${p === '/analysis' ? 'active' : ''}`}>
                <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><span>Analizler</span>
              </Link>
              <Link to="/suggest" className={`mobile-nav-item ${p === '/suggest' ? 'active' : ''}`}>
                <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><span>Soru Öner</span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={`mobile-nav-item ${p.startsWith('/admin') ? 'active' : ''}`}>
                  <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div><span>Admin</span>
                </Link>
              )}
              <button className="mobile-nav-item" onClick={() => logout()} style={{ background: 'none', border: 'none' }}>
                <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div><span>Çıkış</span>
              </button>
           </>
        ) : (
           <>
             <Link to="/login" className={`mobile-nav-item ${p === '/login' ? 'active' : ''}`}>
               <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg></div><span>Giriş Yap</span>
             </Link>
             <Link to="/register" className={`mobile-nav-item ${p === '/register' ? 'active' : ''}`}>
               <div className="mobile-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></div><span>Kayıt Ol</span>
             </Link>
           </>
        )}
      </nav>
    </>
  );
};
