import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    category: '', 
    packageId: '', 
    maxParticipants: 10, 
    duration: 30, 
    isPublic: true, 
    newQuestions: [],
    sourceType: 'ready' // 'ready' or 'custom'
  });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const nav = useNavigate();

  const fetchData = async () => {
    try {
      const pRooms = api.get('/rooms').then(res => res.data).catch(() => []);
      const pCats = api.get('/categories').then(res => res.data).catch(() => []);
      const pPkgs = api.get('/packages').then(res => res.data).catch(() => []);

      const [sRooms, sCats, sPkgs] = await Promise.all([pRooms, pCats, pPkgs]);
      
      setRooms(Array.isArray(sRooms) ? sRooms : []);
      setCategories(Array.isArray(sCats) ? sCats : []);

      // Sadece mevcut kategorilerle ilişkili paketleri göster
      const categoryNames = Array.isArray(sCats) ? sCats.map(c => c.name) : [];
      const filteredPkgs = Array.isArray(sPkgs)
        ? sPkgs.filter(pkg =>
            Array.isArray(pkg.questions) &&
            pkg.questions.some(q => {
              const cat = typeof q === 'object' ? q.category : null;
              return cat && categoryNames.includes(cat);
            })
          )
        : [];
      setPackages(filteredPkgs);
      
      if (Array.isArray(sCats) && sCats.length > 0 && !form.category && !form.packageId) {
        setForm(f => ({ ...f, category: sCats[0].name }));
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setRooms([]);
      setCategories([]);
      setPackages([]);
    } finally { setLoading(false); }
  };


  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 5000); // 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/rooms', form);
      toast.success('Oda oluşturuldu!');
      nav(`/rooms/${data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Oda oluşturulamadı';
      toast.error(msg);
      console.error('Room creation error:', err.response?.data);
    }
  };

  console.log('LobbyPage rendering:', { rooms, categories, packages, loading });

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCodeInput) return;
    try {
      const { data } = await api.post('/rooms/join-code', { code: joinCodeInput });
      nav(`/rooms/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Geçersiz kod');
    }
  };

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

  const joinRoom = (id) => nav(`/rooms/${id}`);

  return (
    <div>
      <div className="page-header flex-between mb-3">
        <div>
          <h1 className="page-title">🎮 Oyun Lobisi</h1>
          <p className="page-subtitle">Aktif odalara katıl veya kendi odanı kur</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              className="form-input" 
              placeholder="📌 Oda Kodu" 
              style={{ width: '120px', padding: '0.5rem' }} 
              value={joinCodeInput} 
              onChange={e => setJoinCodeInput(e.target.value)} 
            />
            <button type="submit" className="btn btn-ghost btn-sm">Katıl</button>
          </form>
          <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>➕ Oda Kur</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : (
        <div className="grid-3">
          {rooms.map(r => (
             <div key={r._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{r.name}</h3>
                  <span className={`badge ${r.isStarted ? 'badge-warning' : 'badge-success'}`}>
                    {r.isStarted ? 'Oynanıyor' : 'Bekliyor'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   <span className="badge badge-info">{r.category}</span>
                   <span className="badge badge-primary">👥 {r.participants?.length || 0}/{r.maxParticipants}</span>
                </div>
                <button 
                  className="btn btn-primary btn-full" 
                  onClick={() => joinRoom(r._id)} 
                  disabled={r.isStarted || (r.participants?.length || 0) >= r.maxParticipants}
                >
                  {r.isStarted ? 'Devam Ediyor' : (r.participants?.length || 0) >= r.maxParticipants ? 'Dolu' : 'Katıl'}
                </button>
             </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Oda Kur</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Oda Adı</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Soru Kaynağı</label>
                <div className="tabs mb-1">
                  <button 
                    type="button" 
                    className={`tab ${form.sourceType === 'ready' ? 'active' : ''}`} 
                    onClick={() => setForm({...form, sourceType: 'ready', newQuestions: []})}
                  >
                    📚 Hazır Soru Paketi
                  </button>
                  <button 
                    type="button" 
                    className={`tab ${form.sourceType === 'custom' ? 'active' : ''}`} 
                    onClick={() => setForm({...form, sourceType: 'custom', packageId: ''})}
                  >
                    ✍️ Özel Soru Oluştur
                  </button>
                </div>

                {form.sourceType === 'ready' ? (
                  <select className="form-input" value={form.packageId ? `pkg:${form.packageId}` : `cat:${form.category}`} onChange={e => {
                    const [type, val] = e.target.value.split(':');
                    if (type === 'pkg') setForm({ ...form, packageId: val, category: '' });
                    else setForm({ ...form, category: val, packageId: '' });
                  }}>
                    <option value="">-- Hazır Paket Seçin --</option>
                    <optgroup label="Soru Paketleri (Kategoriler)">
                      {categories.map(c => <option key={c._id} value={`cat:${c.name}`}>{c.name} Paketini Oyna</option>)}
                    </optgroup>
                    {packages.length > 0 && (
                      <optgroup label="Özel Admin Paketleri">
                        {packages.map(p => <option key={p._id} value={`pkg:${p._id}`}>{p.title}</option>)}
                      </optgroup>
                    )}
                  </select>
                ) : (
                  <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Kendi sorularını aşağıdan ekleyebilirsin. Bu sorular sadece bu odaya özel olacaktır.
                    </p>
                    <div className="flex-between mb-1">
                      <label className="form-label">Sorular ({form.newQuestions.length})</label>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={addCustomQuestion}>+ Soru Ekle</button>
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {form.newQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="card mb-1" style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)' }}>
                          <div className="flex-between mb-1">
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Soru {qIdx + 1}</span>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => removeCustomQuestion(qIdx)}>✕</button>
                          </div>
                          <input className="form-input mb-1" style={{ padding: '0.4rem' }} placeholder="Soru Metni" value={q.text} onChange={e => updateCustomQuestion(qIdx, 'text', e.target.value)} required />
                          <div className="grid-2 mb-1">
                            {q.options.map((opt, oIdx) => (
                               <input key={oIdx} className="form-input" style={{ padding: '0.4rem' }} placeholder={`Şık ${String.fromCharCode(65+oIdx)}`} value={opt} onChange={e => updateCustomQuestion(qIdx, oIdx, e.target.value)} required />
                            ))}
                          </div>
                          <select className="form-input" style={{ padding: '0.4rem' }} value={q.correctAnswer} onChange={e => updateCustomQuestion(qIdx, 'correctAnswer', e.target.value)} required>
                             <option value="">Doğru Cevabı Seçin</option>
                             {q.options.map((opt, oIdx) => (
                               <option key={oIdx} value={opt}>{String.fromCharCode(65+oIdx)} Şıkkı</option>
                             ))}
                          </select>
                        </div>
                      ))}
                      {form.newQuestions.length === 0 && <p className="text-center text-muted py-1">Henüz soru eklemedin.</p>}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Maksimum Oyuncu</label>
                <input type="number" min="2" max="50" className="form-input" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">Süre (Dk)</label>
                <input type="number" min="5" max="120" className="form-input" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px' }}>
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} id="isPublic" />
                <label htmlFor="isPublic" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Herkese Açık Oda (Kodsuz katılım)</label>
              </div>



              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
