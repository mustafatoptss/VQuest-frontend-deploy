import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SuggestPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    category: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        // Redis mongoId → _id normalizasyonu
        const normalized = (Array.isArray(res.data) ? res.data : []).map(c => ({
          ...c,
          _id: c._id || c.mongoId || c.id,
        }));
        setCategories(normalized);
        if (normalized.length > 0) {
          setForm(f => ({ ...f, category: normalized[0]._id }));
        }
      })
      .catch(() => toast.error('Kategoriler yüklenemedi'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.options.some(opt => !opt.trim())) {
      toast.error('Lütfen tüm şıkları doldurun');
      return;
    }
    if (form.options.length !== new Set(form.options).size) {
      toast.error('Şıklar birbirinden farklı olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await api.post('/suggestions', {
        questionText: form.text,
        options: form.options,
        correctAnswer: form.options[form.correctIndex],
        category: form.category
      });
      toast.success('Soru öneriniz başarıyla gönderildi! Onay bekliyor.');
      setForm(prev => ({ text: '', options: ['', '', '', ''], correctIndex: 0, category: prev.category }));
    } catch {
      toast.error('Öneri gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const setOption = (index, val) => {
    const newOpts = [...form.options];
    newOpts[index] = val;
    setForm({ ...form, options: newOpts });
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Soru Öner</h1>
        <p className="page-subtitle">VQuest havuzuna yeni sorular kazandırın</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Soru Metni</label>
            <textarea
              className="form-input"
              placeholder="Örn: React'ta state güncellemek için hangi hook kullanılır?"
              value={form.text}
              onChange={e => setForm({ ...form, text: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              className="form-input"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ margin: '2rem 0' }}>
            <label className="form-label mb-2">Şıklar ve Doğru Cevap</label>
            {form.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={form.correctIndex === i}
                  onChange={() => setForm({ ...form, correctIndex: i })}
                  style={{ width: 20, height: 20, accentColor: 'var(--primary)' }}
                />
                <input
                  className="form-input"
                  style={{ flex: 1, borderColor: form.correctIndex === i ? 'var(--success)' : undefined }}
                  placeholder={`${String.fromCharCode(65 + i)} Şıkkı`}
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  required
                />
              </div>
            ))}
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Doğru olan şıkkın solundaki yuvarlağı seçin</p>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Gönderiliyor...</> : 'Öneriyi Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}
