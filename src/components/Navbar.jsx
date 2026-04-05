import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const p = location.pathname;

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-brand">🏆 VQuest</Link>
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
                <>
                  <Link to="/admin" className="nav-link" style={{ color: 'var(--warning)' }}>Admin</Link>
                </>
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
                <div className="mobile-nav-icon">🏠</div><span>Ana Sayfa</span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/packages" className={`mobile-nav-item ${p.startsWith('/packages') ? 'active' : ''}`}>
                  <div className="mobile-nav-icon">📦</div><span>Paketler</span>
                </Link>
              )}
              <Link to="/profile" className={`mobile-nav-item ${p === '/profile' ? 'active' : ''}`}>
                <div className="mobile-nav-icon">👤</div><span>Profil</span>
             </Link>
              <Link to="/analysis" className={`mobile-nav-item ${p === '/analysis' ? 'active' : ''}`}>
                <div className="mobile-nav-icon">📊</div><span>Analizler</span>
             </Link>
              <Link to="/suggest" className={`mobile-nav-item ${p === '/suggest' ? 'active' : ''}`}>
                <div className="mobile-nav-icon">💡</div><span>Soru Öner</span>
              </Link>
              {user?.role === 'admin' && (
                 <Link to="/admin" className={`mobile-nav-item ${p.startsWith('/admin') ? 'active' : ''}`}>
                   <div className="mobile-nav-icon">⚙️</div><span>Admin</span>
                 </Link>
              )}
             <button className="mobile-nav-item" onClick={() => logout()} style={{ background: 'none', border: 'none' }}>
                <div className="mobile-nav-icon">🚪</div><span>Çıkış</span>
             </button>
           </>
        ) : (
           <>
             <Link to="/login" className={`mobile-nav-item ${p === '/login' ? 'active' : ''}`}>
               <div className="mobile-nav-icon">🔑</div><span>Giriş Yap</span>
             </Link>
             <Link to="/register" className={`mobile-nav-item ${p === '/register' ? 'active' : ''}`}>
               <div className="mobile-nav-icon">✨</div><span>Kayıt Ol</span>
             </Link>
           </>
        )}
      </nav>
    </>
  );
};
