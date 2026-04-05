import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function PackagesPage() {
  const user = useAuthStore(state => state.user);
  const nav = useNavigate();
  
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Bu sayfaya sadece adminler erişebilir');
      nav('/');
    }
  }, [user, nav]);
  const [packages, setPackages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isPublic: true, questions: [], newQuestions: [] });

  const fetchData = async () => {
    try {
      const [pRes, qRes] = await Promise.all([api.get('/packages'), api.get('/questions')]);
      setPackages(Array.isArray(pRes.data) ? pRes.data : []);
      setQuestions(Array.isArray(qRes.data) ? qRes.data : []);
    } catch (err) {
      console.error('Fetch data error:', err);
      setPackages([]);
      setQuestions([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addCustomQuestion = () => {
    setForm(prev => ({
      ...prev,
      newQuestions: [...prev.newQuestions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]
    }));
  };

  const updateCustomQuestion = (idx, field, val) => {
    const nq = [...form.newQuestions];
    if (field === 'text') nq[idx].text = val;
    else if (field === 'correctAnswer') nq[idx].correctAnswer = val;
    else nq[idx].options[field] = val;
    setForm({ ...form, newQuestions: nq });
  };

  const removeCustomQuestion = (idx) => {
    setForm({ ...form, newQuestions: form.newQuestions.filter((_, i) => i !== idx) });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/packages', form);
      fetchData(); // Refresh all
      setShowModal(false);
      setForm({ title: '', description: '', isPublic: true, questions: [], newQuestions: [] });
      toast.success('Paket oluşturuldu!');
    } catch { toast.error('Paket oluşturulamadı'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Paketi silmek istiyor musun?')) return;
    try {
      await api.delete(`/packages/${id}`);
      setPackages(prev => prev.filter(p => p._id !== id));
      toast.success('Paket silindi');
    } catch { toast.error('Silinemedi'); }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">📦 Soru Paketlerim</h1>
          <p className="page-subtitle">Kendi soru setlerini oluştur ve yönet</p>
        </div>
        {useAuthStore.getState().user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Yeni Paket</button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : packages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">Henüz paketiniz yok</div>
          <div className="empty-text">Kendi soru setinizi oluşturun!</div>
        </div>
      ) : (
        <div className="grid-3">
          {packages.map(pkg => (
            <div key={pkg._id} className="card">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{pkg.title}</h3>
              {pkg.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>{pkg.description}</p>}
              <div className="flex-between">
                <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>{pkg.questions?.length || 0} soru</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  { (useAuthStore.getState().user?._id === (pkg.creator?._id || pkg.creator) || useAuthStore.getState().user?.role === 'admin') && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(pkg._id)}>🗑️</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">➕ Yeni Paket Oluştur</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Paket Başlığı</label>
                <input className="form-input" placeholder="Örn: Tarih Sorularım" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama (İsteğe Bağlı)</label>
                <textarea className="form-input" placeholder="Bu paket hakkında kısa bir açıklama..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Sorular ({form.questions.length} seçildi)</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                  {questions.length === 0 ? <p className="text-muted p-1">Soru bulunamadı.</p> : questions.map(q => (
                    <label key={q._id} style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                      <input 
                        type="checkbox" 
                        checked={form.questions.includes(q._id)}
                        onChange={(e) => {
                          const newQs = e.target.checked 
                            ? [...form.questions, q._id] 
                            : form.questions.filter(id => id !== q._id);
                          setForm({ ...form, questions: newQs });
                        }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>{q.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary" disabled={form.questions.length === 0 && form.newQuestions.length === 0}>Oluştur</button>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <div className="flex-between mb-1">
                  <label className="form-label">Sıfırdan Soru Ekle ({form.newQuestions.length})</label>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={addCustomQuestion}>+ Yeni Soru</button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {form.newQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="card mb-1" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                      <div className="flex-between mb-1">
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Yeni Soru {qIdx + 1}</span>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeCustomQuestion(qIdx)}>✕</button>
                      </div>
                      <input className="form-input mb-1" placeholder="Soru Metni" value={q.text} onChange={e => updateCustomQuestion(qIdx, 'text', e.target.value)} required />
                      <div className="grid-2 mb-1">
                        {q.options.map((opt, oIdx) => (
                          <input key={oIdx} className="form-input" placeholder={`Şık ${String.fromCharCode(65+oIdx)}`} value={opt} onChange={e => updateCustomQuestion(qIdx, oIdx, e.target.value)} required />
                        ))}
                      </div>
                      <select className="form-input" value={q.correctAnswer} onChange={e => updateCustomQuestion(qIdx, 'correctAnswer', e.target.value)} required>
                        <option value="">Doğru Şıkkı Seçin</option>
                        {q.options.map((opt, oIdx) => (
                           <option key={oIdx} value={opt}>{String.fromCharCode(65+oIdx)} Şıkkı</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
