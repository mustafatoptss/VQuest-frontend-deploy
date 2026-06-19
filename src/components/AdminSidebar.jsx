import { Link, useLocation } from 'react-router-dom';

export const AdminSidebar = () => {
  const p = useLocation().pathname;
  
  const links = [
    { name: 'Dashboard', path: '/admin', icon: null },
    { name: 'Kategoriler', path: '/admin/categories', icon: null },
    { name: 'Kullanıcılar', path: '/admin/users', icon: null },
    { name: 'Odalar', path: '/admin/rooms', icon: null },
    { name: 'Duyurular', path: '/admin/notifications', icon: null },
    { name: 'AI Prompt', path: '/admin/ai-prompt', icon: null },
    { name: 'Soru Önerileri', path: '/admin/suggestions', icon: null }
  ];

  return (
    <aside className="admin-sidebar">
      <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-light)' }}>Admin Panel</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VQuest Yönetim Sistemi</p>
      </div>

      <nav>
        {links.map(l => (
          <Link key={l.path} to={l.path} className={`sidebar-link ${p === l.path ? 'active' : ''}`}>
            {l.name}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <Link to="/" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'center' }}>
          ← Uygulamaya Dön
        </Link>
      </div>
    </aside>
  );
};
