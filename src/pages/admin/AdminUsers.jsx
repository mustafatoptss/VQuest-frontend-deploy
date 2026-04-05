import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch {
      // Mock data
      setUsers([
        { _id: '1', username: 'ahmetkara', email: 'ahmet@mail.com', role: 'user', isBlocked: false, createdAt: new Date() },
        { _id: '2', username: 'betulyilmaz', email: 'betul@mail.com', role: 'user', isBlocked: true, createdAt: new Date() },
        { _id: '3', username: 'admin_test', email: 'admin@vquest.com', role: 'admin', isBlocked: false, createdAt: new Date() },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (id, isBlocked) => {
    try {
      await api.put(`/admin/users/${id}/block`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: !isBlocked } : u));
      toast.success(isBlocked ? 'Kullanıcı engeli kaldırıldı' : 'Kullanıcı engellendi');
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Kullanıcı Yönetimi</h1>
        <p className="page-subtitle">Platformdaki tüm üyeleri incele ve yönet</p>
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner-lg spinner" /></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="font-bold">{u.username}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isBlocked 
                      ? <span className="badge badge-danger">Engelli</span>
                      : <span className="badge badge-success">Aktif</span>}
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button 
                        className={`btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => toggleBlock(u._id, u.isBlocked)}
                      >
                        {u.isBlocked ? 'Engel Kaldır' : 'Engelle'}
                      </button>
                    )}
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
