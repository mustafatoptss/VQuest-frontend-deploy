import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSuggestions(); }, []);

  const fetchSuggestions = async () => {
    try {
      const { data } = await api.get('/admin/suggestions'); // Admin sees all
      setSuggestions(data);
    } catch {
      setSuggestions([
        { _id: '65f0123456789abcdef12345', questionText: 'Hata var: Gerçek data gelmedi. Backend kapalı olabilir.', options: ['Seçenek 1','Seçenek 2','Doğru Cevap','Yanlış'], correctAnswer: 'Doğru Cevap', category: { name: 'Bilinmiyor' }, user: { username: 'sistem' } }
      ]);
    } finally { setLoading(false); }
  };

  const handleAction = async (id, action) => {
    try {
      if(action === 'approve') {
        const s = suggestions.find(s => s._id === id);
        await api.post('/admin/questions', { text: s.questionText, options: s.options, correctAnswer: s.correctAnswer, category: s.category?._id || s.category });
        await api.delete(`/admin/suggestions/${id}`); // Assumes endpoint to clear suggestion
        toast.success('Öneri kabul edildi ve havuza eklendi');
      } else {
        await api.delete(`/admin/suggestions/${id}`);
        toast.error('Öneri reddedildi');
      }
      setSuggestions(prev => prev.filter(s => s._id !== id));
    } catch { toast.error('İşlem başarısız'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💡 Gelen Öneriler</h1>
        <p className="page-subtitle">Kullanıcıların önerdiği soruları onaylayın veya reddedin</p>
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : suggestions.length === 0 ? (
        <div className="empty-state">
           <div className="empty-icon">✅</div>
           <div className="empty-title">Bekleyen öneri yok</div>
        </div>
      ) : (
        <div className="grid-2">
          {suggestions.map(s => (
            <div key={s._id} className="card">
              <span className="badge badge-info mb-2">{s.category?.name || s.category || 'Belirtilmemiş'}</span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{s.questionText}</h3>
              <div style={{ marginBottom: '1.5rem', background: 'var(--bg-card-2)', padding: '1rem', borderRadius: '8px' }}>
                {s.options.map((opt, i) => (
                  <div key={i} style={{ color: opt === s.correctAnswer ? 'var(--success)' : 'inherit', fontWeight: opt === s.correctAnswer ? 'bold' : 'normal', marginBottom: '0.3rem' }}>
                    {opt === s.correctAnswer ? '✓ ' : '○ '} {opt}
                  </div>
                ))}
              </div>
              <div className="flex-between">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Öneren: {s.user?.username || s.user?.email || 'Bilinmeyen'}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleAction(s._id, 'reject')}>Reddet</button>
                  <button className="btn btn-success btn-sm" onClick={() => handleAction(s._id, 'approve')}>Kabul Et</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
