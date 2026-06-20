import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const nav = useNavigate();

  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      toast.success(`Hoş geldin, ${data.user.username}!`);
      if (data.user.role === 'admin') {
        nav('/admin');
      } else {
        nav('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <h1 className="auth-sidebar-title">VQuest</h1>
          <p className="auth-sidebar-text">
            Yeni nesil canlı bilgi yarışmasına hoş geldin. Hemen giriş yap ve binlerce oyuncuya karşı bilgini sına.
          </p>
        </div>
      </div>
      <div className="auth-content">
        <div className="auth-card card">
          <h2 className="page-title mb-1" style={{ fontSize: '2.2rem' }}>Giriş Yap</h2>
          <p className="text-muted mb-3">Hesabına erişmek için bilgilerini gir.</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input className={`form-input ${error ? 'is-invalid' : ''}`} type="email" placeholder="ornek@mail.com" required value={email} onChange={e => {setEmail(e.target.value); setError(null);}} />
            </div>
            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input className={`form-input ${error ? 'is-invalid' : ''}`} type="password" placeholder="••••••••" required value={password} onChange={e => {setPassword(e.target.value); setError(null);}} />
            </div>
            
            {error && (
              <div className="error-text mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            
            <button className="btn btn-primary btn-full btn-lg mt-1" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Bekleniyor...</> : 'Giriş Yap'}
            </button>
          </form>
          
          <p className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'center', marginTop: '1.5rem' }}>
            Hesabın yok mu? <Link to="/register" style={{ fontWeight: 'bold', marginLeft: '0.2rem' }}>Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
