import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AnalysisPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const cooldownRef = useRef(false);

  // Fetch all user reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // GET /api/ai/analysis — fetch all user's reports
      // Backend stores by userId, we list them from the analysis list endpoint
      // The backend only has GET /api/ai/reports/:reportId not a list endpoint,
      // so we cache the report list in localStorage after creation.
      const saved = JSON.parse(localStorage.getItem('vquest_ai_report_ids') || '[]');
      if (saved.length === 0) {
        setReports([]);
        return;
      }
      // Fetch each report individually
      const fetched = await Promise.all(
        saved.map(async (id) => {
          try {
            const { data } = await api.get(`/ai/reports/${id}`);
            return data;
          } catch {
            return null;
          }
        })
      );
      setReports(fetched.filter(Boolean));
    } catch {
      setReports([]);
    }
  };

  const startAnalysis = async () => {
    if (cooldownRef.current || loading) return;

    cooldownRef.current = true;
    setLoading(true);

    try {
      const { data } = await api.post('/ai/analysis');
      toast.success('Analiz tamamlandı!');

      // Persist report ID in localStorage
      const saved = JSON.parse(localStorage.getItem('vquest_ai_report_ids') || '[]');
      const updated = [data._id, ...saved];
      localStorage.setItem('vquest_ai_report_ids', JSON.stringify(updated));

      setReports((prev) => [data, ...prev]);
      setSelectedReport(data);
    } catch (err) {
      toast.error('Veri işlenemedi');
    } finally {
      setLoading(false);
      // 10 saniye cooldown
      setTimeout(() => { cooldownRef.current = false; }, 10000);
    }
  };

  const refreshReports = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetchReports();
      toast.success('Raporlar güncellendi');
    } catch {
      toast.error('Veri işlenemedi');
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Bu analiz kaydı silinsin mi?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/ai/reports/${id}`);
      const saved = JSON.parse(localStorage.getItem('vquest_ai_report_ids') || '[]');
      localStorage.setItem('vquest_ai_report_ids', JSON.stringify(saved.filter((x) => x !== id)));
      setReports((prev) => prev.filter((r) => r._id !== id));
      if (selectedReport?._id === id) setSelectedReport(null);
      toast.success('Rapor silindi');
    } catch {
      toast.error('Veri işlenemedi');
    } finally {
      setDeletingId(null);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Tüm analiz geçmişi silinsin mi?')) return;
    try {
      await Promise.all(reports.map((r) => api.delete(`/ai/reports/${r._id}`).catch(() => {})));
      localStorage.removeItem('vquest_ai_report_ids');
      setReports([]);
      setSelectedReport(null);
      toast.success('Tüm geçmiş temizlendi');
    } catch {
      toast.error('Veri işlenemedi');
    }
  };

  // Simple markdown → HTML renderer (bold, paragraphs)
  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">AI Performans Analizi</h1>
          <p className="page-subtitle">Oyunlarından elde edilen verilerin yapay zeka değerlendirmesi</p>
        </div>
        {reports.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={clearAll} disabled={loading}>
            Tümünü Temizle
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={startAnalysis}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #6c47ff, #00e5ff)',
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '0.75rem 1.5rem',
            minWidth: 180
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="spinner" />
              Yapay Zeka Düşünüyor...
            </span>
          ) : 'Analiz Başlat'}
        </button>

        <button
          className="btn btn-ghost"
          onClick={refreshReports}
          disabled={loading}
          style={{ padding: '0.75rem 1.5rem' }}
        >
           Sonuçlarımı Yenile
        </button>
      </div>

      {/* Loading overlay card */}
      {loading && (
        <div
          className="card mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(108,71,255,0.15), rgba(0,229,255,0.08))',
            border: '1px solid rgba(108,71,255,0.5)',
            textAlign: 'center',
            padding: '2rem'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <span className="spinner-lg spinner" style={{ width: 48, height: 48 }} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-light)' }}>
            Yapay Zeka Düşünüyor...
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Verileriniz analiz ediliyor, lütfen bekleyin
          </div>
        </div>
      )}

      {/* Selected report detail */}
      {selectedReport && !loading && (
        <div
          className="card mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(108,71,255,0.1), rgba(0,229,255,0.06))',
            border: '1px solid rgba(108,71,255,0.3)'
          }}
        >
          <div className="flex-between mb-2">
            <h3 style={{ fontWeight: 700, color: 'var(--accent)' }}>AI Değerlendirmesi</h3>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setSelectedReport(null)}
            >✕</button>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
            {new Date(selectedReport.createdAt || Date.now()).toLocaleString('tr-TR')}
          </div>
          <div
            style={{
              padding: '1rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              lineHeight: 1.8
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedReport.analysisText) }}
          />
        </div>
      )}

      {/* Dashboard cards */}
      {!loading && reports.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '1.2rem', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.3)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)' }}>{reports.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toplam Analiz</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.2rem', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.3)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>✓</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Güçlü Yönler</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1.2rem', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.2)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ff6464' }}>↑</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gelişim Alanları</div>
          </div>
        </div>
      )}

      {/* Report list */}
      {!loading && reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{fontSize:'2rem',color:'var(--primary-light)',fontWeight:800}}>AI</div>
          <div className="empty-title">Henüz Analiz Yok</div>
          <div className="empty-text">
            "Analiz Başlat" butonuna basarak yapay zekanın performansını değerlendirmesini sağlayın.
          </div>
        </div>
      ) : !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {reports.map((r, i) => (
            <div
              key={r._id}
              className="card"
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                opacity: deletingId === r._id ? 0.4 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  #{reports.length - i} · {new Date(r.createdAt || Date.now()).toLocaleString('tr-TR')}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
                  {r.analysisText?.length > 200
                    ? r.analysisText.slice(0, 200) + '...'
                    : r.analysisText}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, paddingTop: '0.2rem' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  title="Tam raporu gör"
                  onClick={() => setSelectedReport(r)}
                >Görüntüle</button>
                <button
                  className="btn btn-danger btn-sm"
                  title="Sil"
                  disabled={deletingId === r._id}
                  onClick={() => deleteReport(r._id)}
                >Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
