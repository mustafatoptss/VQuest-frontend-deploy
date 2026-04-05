import { Link, useLocation } from 'react-router-dom';

export const AdminSidebar = () => {
  const p = useLocation().pathname;
  
  const links = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Kategoriler', path: '/admin/categories', icon: '🏷️' },
    { name: 'Kullanıcılar', path: '/admin/users', icon: '👥' },
    { name: 'Odalar', path: '/admin/rooms', icon: '🚪' },
    { name: 'Duyurular', path: '/admin/notifications', icon: '📢' },
    { name: 'AI Prompt', path: '/admin/ai-prompt', icon: '🤖' },
    { name: 'Soru Önerileri', path: '/admin/suggestions', icon: '💡' }
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
            <span>{l.icon}</span> {l.name}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <Link to="/" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'center' }}>
          ⬅️ Uygulamaya Dön
        </Link>
      </div>
    </aside>
  );
};
