import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Kayıt başarılı! Lütfen giriş yapın.');
      nav('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <h1 className="auth-sidebar-title">VQuest'e Katıl</h1>
          <p className="auth-sidebar-text">
            Kendi soru setlerini oluştur, arkadaşlarınla yarış veya yeteneklerini test et. Sadece birkaç saniye sürer.
          </p>
        </div>
      </div>
      <div className="auth-content">
        <div className="auth-card card">
          <h2 className="page-title mb-1" style={{ fontSize: '2.2rem' }}>Hesap Oluştur</h2>
          <p className="text-muted mb-3">Bilgilerini girerek aramıza katıl.</p>
          
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Kullanıcı Adı</label>
              <input className={`form-input ${error ? 'is-invalid' : ''}`} type="text" placeholder="kullanici_adi" required value={form.username} onChange={e => {setForm({...form, username: e.target.value}); setError(null);}} minLength={3} />
            </div>
            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input className={`form-input ${error ? 'is-invalid' : ''}`} type="email" placeholder="ornek@mail.com" required value={form.email} onChange={e => {setForm({...form, email: e.target.value}); setError(null);}} />
            </div>
            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input className={`form-input ${error ? 'is-invalid' : ''}`} type="password" placeholder="••••••••" required value={form.password} onChange={e => {setForm({...form, password: e.target.value}); setError(null);}} minLength={6} />
            </div>
            
            {error && (
              <div className="error-text mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            
            <button className="btn btn-primary btn-full btn-lg mt-1" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Bekleniyor...</> : 'Kayıt Ol'}
            </button>
          </form>
          
          <p className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'center', marginTop: '1.5rem' }}>
            Zaten hesabın var mı? <Link to="/login" style={{ fontWeight: 'bold', marginLeft: '0.2rem' }}>Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
