import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadingIds, setFadingIds] = useState(new Set());

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => api.put(`/notifications/${n._id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const deleteNotif = async (id) => {
    // Start fade-out animation
    setFadingIds(prev => new Set([...prev, id]));

    // Wait for animation to complete, then remove from state and call API
    setTimeout(async () => {
      try {
        await api.delete(`/notifications/${id}`);
        setNotifications(prev => prev.filter(n => n._id !== id));
        setFadingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        toast.success('Bildirim silindi');
      } catch {
        setFadingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        toast.error('Silinemedi');
      }
    }, 350);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <div className="loading-center"><span className="spinner-lg spinner" /></div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateX(0); max-height: 200px; margin-bottom: 0.8rem; }
          to   { opacity: 0; transform: translateX(40px); max-height: 0; margin-bottom: 0; padding: 0; }
        }
        .notif-fading {
          animation: fadeSlideOut 0.35s ease forwards;
          pointer-events: none;
          overflow: hidden;
        }
      `}</style>

      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Bildirimler</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
            ✓ Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{fontSize:'2rem',color:'var(--primary-light)',fontWeight:800}}>!</div>
          <div className="empty-title">Burası şimdilik sessiz</div>
          <div className="empty-text">Sistem yöneticilerinden yeni bir bildirim gelmediğinde burayı görürsünüz.</div>
        </div>
      ) : (
        <div>
          {notifications.map(n => (
            <div
              key={n._id}
              className={`notif-item ${!n.isRead ? 'unread' : ''}${fadingIds.has(n._id) ? ' notif-fading' : ''}`}
            >
              {!n.isRead && <div className="notif-dot" />}
              <div className="notif-text" style={n.isRead ? { marginLeft: '1rem' } : {}}>
                <div>{n.message}</div>
                {n.createdAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    {new Date(n.createdAt).toLocaleString('tr-TR')}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                {!n.isRead && (
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Okundu işaretle"
                    onClick={() => markRead(n._id)}
                  >✓</button>
                )}
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  title="Sil"
                  onClick={() => deleteNotif(n._id)}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
