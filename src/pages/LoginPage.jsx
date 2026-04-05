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

  const handleLogin = async (e) => {
    e.preventDefault();
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
      toast.error(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h1 className="page-title mb-1">VQuest'e Giriş</h1>
        <p className="text-muted mb-3">Bilgi yarışmasına katılmak için giriş yap</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input className="form-input" type="email" placeholder="ornek@mail.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input className="form-input" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full btn-lg mt-2" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Bekleniyor...</> : 'Giriş Yap'}
          </button>
        </form>
        
        <p className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
          Hesabın yok mu? <Link to="/register" style={{ fontWeight: 'bold' }}>Hemen Kayıt Ol</Link>
        </p>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'left' }}>
          <p className="mb-1 text-muted"><strong>Admin Girişi:</strong></p>
          <p>Email: admin@vquest.com</p>
          <p>Şifre: admin123</p>
        </div>
      </div>
    </div>
  );
}
