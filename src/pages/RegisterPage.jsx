import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Kayıt başarılı! Lütfen giriş yapın.');
      nav('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h1 className="page-title mb-1">Hesap Oluştur</h1>
        <p className="text-muted mb-3">VQuest'e katılarak harika ödüller kazan!</p>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Kullanıcı Adı</label>
            <input className="form-input" type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input className="form-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input className="form-input" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn btn-primary btn-full btn-lg mt-2" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Bekleniyor...</> : 'Kayıt Ol'}
          </button>
        </form>
        
        <p className="mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
          Zaten hesabın var mı? <Link to="/login" style={{ fontWeight: 'bold' }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
