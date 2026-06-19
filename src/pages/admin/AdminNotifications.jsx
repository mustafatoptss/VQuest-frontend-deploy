import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MIN_MSG_LENGTH = 5;

export default function AdminNotifications() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      // Admin uses the same GET /api/notifications endpoint to see sent ones
      const { data } = await api.get('/notifications');
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (message.trim().length < MIN_MSG_LENGTH) {
      toast.error(`Mesaj en az ${MIN_MSG_LENGTH} karakter olmalıdır`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/admin/notifications', { message });
      toast.success('Bildirim tüm kullanıcılara gönderildi!');
      setMessage('');
      // Prepend to history
      setHistory(prev => [data, ...prev]);
    } catch {
      toast.error('Bildirim gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const isValid = message.trim().length >= MIN_MSG_LENGTH;

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1 className="page-title">Bildirim Gönder</h1>
        <p className="page-subtitle">Sistemdeki tüm kullanıcılara anlık duyuru yapın</p>
      </div>

      {/* Compose Card */}
      <div className="card mb-3">
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">Duyuru Mesajı</label>
            <textarea
              className="form-input"
              style={{ minHeight: 120 }}
              placeholder="Örn: Bu akşam saat 20:00'da büyük Tarih Yarışması başlıyor! Kaçırmayın!"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              minLength={MIN_MSG_LENGTH}
            />
            <div style={{ fontSize: '0.8rem', color: !isValid && message.length > 0 ? '#ff6464' : 'var(--text-muted)', marginTop: '0.3rem' }}>
              {message.trim().length} / min {MIN_MSG_LENGTH} karakter
            </div>
          </div>
          <button
            className="btn btn-primary btn-full btn-lg"
            type="submit"
            disabled={loading || !isValid}
            style={{
              background: isValid ? 'linear-gradient(135deg, #6c47ff, #00e5ff)' : undefined,
              border: 'none',
              fontWeight: 700
            }}
          >
            {loading
              ? <><span className="spinner" /> Gönderiliyor...</>
              : 'Tüm Kullanıcılara Gönder'}
          </button>
        </form>
      </div>

      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        * Gönderilen bildirimler kullanıcıların "Bildirimler" sekmesine anında düşer ve Socket.io ile anlık olarak iletilir.
      </div>

      {/* History Table */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-light)' }}>
          Geçmiş Duyurular
        </h3>
        {historyLoading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : history.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem 0' }}>
            <div className="empty-text" style={{ color: 'var(--text-muted)' }}>—</div>
            <div className="empty-text">Henüz gönderilmiş bildirim yok</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>#</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mesaj</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tarih</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {history.map((n, i) => (
                  <tr key={n._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>{n.message}</td>
                    <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('tr-TR') : '—'}
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      <span style={{
                        background: 'rgba(0,229,255,0.1)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(0,229,255,0.3)',
                        borderRadius: 6,
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem'
                      }}>
                        ✓ Gönderildi
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
