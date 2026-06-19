import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = yeni, string = düzenleme
  const [form, setForm] = useState({ text: '', options: ['', '', '', ''], correctIndex: 0, category: '' });

  const [stats, setStats] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);

  const fetchAll = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        api.get('/questions'),
        api.get('/categories')
      ]);
      setQuestions(qRes.data);
      setCategories(cRes.data);
      if (cRes.data.length > 0) setForm(f => ({ ...f, category: cRes.data[0].name }));
    } catch {
      setQuestions([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchAll(); 
    // Real fetch for stats
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        // Silently handle error
      }
    };
    fetchStats();

    // URL'den kategori parametresini kontrol et
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setForm(f => ({ ...f, category: catParam }));
      setFilterCategory(catParam);
    }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        correctAnswer: form.options[form.correctIndex]
      };
      const { data } = await api.post('/admin/questions', payload);
      setQuestions(prev => [data, ...prev]);
      setShowModal(false);
      toast.success('Soru eklendi');
    } catch { toast.error('Soru eklenemedi'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        correctAnswer: form.options[form.correctIndex]
      };
      const { data } = await api.put(`/admin/questions/${editingId}`, payload);
      setQuestions(prev => prev.map(q => q._id === editingId ? data : q));
      setShowModal(false);
      setEditingId(null);
      toast.success('Soru güncellendi');
    } catch { toast.error('Soru güncellenemedi'); }
  };

  const openEdit = (q) => {
    const correctIndex = q.options.findIndex(o => o === q.correctAnswer);
    setForm({
      text: q.text,
      options: [...q.options],
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      category: q.category || ''
    });
    setEditingId(q._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
      toast.success('Soru silindi');
    } catch { toast.error('Soru silinemedi'); }
  };

  const setOption = (index, val) => {
    const newOpts = [...form.options];
    newOpts[index] = val;
    setForm({ ...form, options: newOpts });
  };

  return (
    <div>
      <div className="page-header flex-between mb-3">
        <div>
          <h1 className="page-title">Soru Havuzu ve Dashboard</h1>
          <p className="page-subtitle">Sistemin genel durumu ve ana soru havuzu</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {filterCategory && (
            <button className="btn btn-ghost" onClick={() => { setFilterCategory(null); window.history.replaceState({}, '', '/admin'); }}>
              ✕ Filtreyi Kaldır ({filterCategory})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setForm({ text: '', options: ['','','',''], correctIndex: 0, category: filterCategory || 'Genel Kültür' }); setEditingId(null); setShowModal(true); }}>
            + Yeni Soru Ekle
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-grid mb-3">
          <div className="stat-card">
            <div className="stat-icon" style={{fontSize:'1.5rem',color:'var(--primary-light)'}}>K</div>
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Toplam Kullanıcı</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{fontSize:'1.5rem',color:'var(--accent)'}}>O</div>
            <div className="stat-value">{stats.activeRooms}</div>
            <div className="stat-label">Aktif Odalar</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{fontSize:'1.5rem',color:'var(--warning)'}}>S</div>
            <div className="stat-value">{stats.totalQuestions}</div>
            <div className="stat-label">Soru Havuzu</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{fontSize:'1.5rem',color:'var(--success)'}}>Ö</div>
            <div className="stat-value">{stats.pendingSuggestions}</div>
            <div className="stat-label">Bekleyen Öneri</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Soru</th>
                <th>Kategori</th>
                <th>Doğru Cevap</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {questions.filter(q => filterCategory ? q.category === filterCategory : true).map(q => (
                <tr key={q._id}>
                  <td style={{ maxWidth: 350, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.text}</td>
                  <td><span className="badge badge-info">{q.category}</span></td>
                  <td><span className="text-success font-bold">{q.correctAnswer || q.options[q.correctIndex]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}>Düzenle</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Soruyu Düzenle' : 'Soru Ekle'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Soru Metni</label>
                <textarea className="form-input" style={{ minHeight: 80 }} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Şıklar (Doğru olanı işaretle)</label>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.6rem', alignItems: 'center' }}>
                    <input type="radio" name="cAnswer" checked={form.correctIndex === i} onChange={() => setForm({ ...form, correctIndex: i })} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                    <input className="form-input" value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`${String.fromCharCode(65+i)} Şıkkı`} required />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
