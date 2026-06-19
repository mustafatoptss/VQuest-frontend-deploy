import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, token, logout, updateUser } = useAuthStore();
  const [tab, setTab] = useState('info');
  const [pwForm, setPwForm] = useState({ newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile');
        setProfile(data);
      } catch { setProfile(user); }
    };
    fetchProfile();
  }, [user]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('Şifre en az 6 karakter'); return; }
    setLoading(true);
    try {
      await api.put('/profile/password', pwForm);
      toast.success('Şifre güncellendi!');
      setPwForm({ newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Şifre güncellenemedi');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Hesabını kalıcı olarak silmek istediğinden emin misin?')) return;
    try {
      await api.delete('/profile');
      logout();
      toast.success('Hesap silindi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hesap silinemedi');
    }
  };

  const p = profile || user || {};

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profilim</h1>
        <p className="page-subtitle">Hesap bilgilerinizi yönetin</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
          {(p.username || 'U')[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{p.username || 'Kullanıcı'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{p.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className={`badge ${p.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>{p.role === 'admin' ? 'Admin' : 'Kullanıcı'}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card"><div className="stat-icon" style={{fontSize:'1.5rem',color:'var(--primary-light)'}}>P</div><div className="stat-value">{p.totalScore || 0}</div><div className="stat-label">Toplam Puan</div></div>
        <div className="stat-card"><div className="stat-icon" style={{fontSize:'1.5rem',color:'var(--accent)'}}>O</div><div className="stat-value">{p.gamesPlayed || 0}</div><div className="stat-label">Oyun Sayısı</div></div>
        <div className="stat-card"><div className="stat-icon" style={{fontSize:'1.5rem',color:'var(--success)'}}>%</div><div className="stat-value">{p.correctRate || 0}%</div><div className="stat-label">Doğruluk Oranı</div></div>
      </div>

      <div className="tabs">
        {['info', 'password', 'danger'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'info' ? 'Bilgiler' : t === 'password' ? 'Şifre' : 'Tehlikeli Bölge'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="card">
          <div className="form-group"><label className="form-label">Kullanıcı Adı</label><input className="form-input" value={p.username || ''} disabled /></div>
          <div className="form-group"><label className="form-label">E-posta</label><input className="form-input" value={p.email || ''} disabled /></div>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label className="form-label">Yeni Şifre</label>
              <input className="form-input" type="password" placeholder="Minimum 6 karakter" value={pwForm.newPassword} onChange={e => setPwForm({ newPassword: e.target.value })} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Güncelleniyor...</> : 'Şifreyi Güncelle'}
            </button>
          </form>
        </div>
      )}

      {tab === 'danger' && (
        <div className="card" style={{ border: '1px solid rgba(255,82,82,0.3)' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Hesap Silme</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Bu işlem geri alınamaz. Tüm verileriniz silinecektir.</p>
          <button className="btn btn-danger" onClick={handleDeleteAccount}>Hesabımı Sil</button>
        </div>
      )}
    </div>
  );
}
