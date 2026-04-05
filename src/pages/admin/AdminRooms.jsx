import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch {
      setRooms([
        { _id: '1', name: 'Tarih Şampiyonası', category: 'Tarih', participants: [], maxParticipants: 10, status: 'playing' }
      ]);
    } finally { setLoading(false); }
  };

  const handleClose = async (id) => {
    if(!window.confirm('Bu odayı zorla kapatmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      setRooms(prev => prev.filter(r => r._id !== id));
      toast.success('Oda kapatıldı');
    } catch { toast.error('Oda kapatılamadı'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🚪 Aktif Odalar</h1>
        <p className="page-subtitle">Sistemdeki yarışma odalarını denetleyin</p>
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Oda Adı</th>
                <th>Kategori</th>
                <th>Oyuncular</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r._id}>
                  <td className="font-bold">{r.name}</td>
                  <td>{r.category}</td>
                  <td>{r.participants?.length || 0} / {r.maxParticipants || 10}</td>
                  <td>
                    <span className={`badge ${r.status==='active'?'badge-success':'badge-warning'}`}>
                      {r.status === 'active' ? 'Bekliyor' : 'Kapalı'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleClose(r._id)}>Zorla Kapat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
