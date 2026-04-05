import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { fetchCats(); }, []);

  const fetchCats = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {
      setCategories([
        { _id: '1', name: 'Yazılım', description: 'Programlama dili soruları' },
        { _id: '2', name: 'Tarih', description: 'Dünya ve Türkiye tarihi' },
      ]);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/categories', form);
      setCategories(prev => [data, ...prev]);
      setShowModal(false);
      toast.success('Kategori eklendi');
    } catch { toast.error('Eklenemedi'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/admin/categories/${editingId}`, form);
      setCategories(prev => prev.map(c => c._id === editingId ? data : c));
      setShowModal(false);
      setEditingId(null);
      toast.success('Kategori güncellendi');
    } catch { toast.error('Güncellenemedi'); }
  };

  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || '' });
    setEditingId(c._id);
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">🏷️ Kategori Yönetimi</h1>
          <p className="page-subtitle">Soru kategorilerini düzenleyin</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({name:'', description:''}); setEditingId(null); setShowModal(true); }}>
          ➕ Yeni Kategori
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : (
        <div className="grid-3">
          {categories.map(c => (
            <div key={c._id} className="card">
              <div className="flex-between mb-2">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>{c.name}</h3>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button className="btn btn-ghost btn-sm" title="Düzeyle" onClick={() => openEdit(c)}>✏️</button>
                  <button className="btn btn-ghost btn-sm" title="Soruları Yönet" onClick={() => window.location.href=`/admin?category=${c.name}`}>👁️</button>
                  <button className="btn btn-ghost btn-sm" title="Hızlı Soru Ekle" onClick={() => { setForm({ name: c.name, description: '' }); setEditingId(null); setShowModal(true); }}>➕</button>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.description}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <h3 className="modal-title">{editingId ? 'Kategoriyi Düzeyle' : 'Kategori Ekle'}</h3>
               <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label className="form-label">Kategori Adı</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
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
