import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import socket from '../services/socket';

export default function GameRoomPage() {
  const { roomId } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [phase, setPhase] = useState('lobby'); // lobby, playing, result
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceLog, setPerformanceLog] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState('');

  // ref: en güncel değerlere timer içinden erişmek için
  const questionsRef = useRef([]);
  const currentQuestionIndexRef = useRef(0);
  const performanceLogRef = useRef([]);
  const isHostRef = useRef(false);

  const fetchData = async () => {
    try {
      const { data: found } = await api.get(`/rooms/${roomId}`); 
      
      const isParticipant = found.participants.some(p => (p.userId?._id || p.userId) === (user?._id || user?.id));
      if (!isParticipant) {
        await api.put(`/rooms/${roomId}/join`);
        const { data: refreshed } = await api.get(`/rooms/${roomId}`);
        setRoom(refreshed);
        isHostRef.current = (refreshed.hostId?._id || refreshed.hostId) === (user?.id || user?._id);
      } else {
        setRoom(found);
        isHostRef.current = (found.hostId?._id || found.hostId) === (user?.id || user?._id);
      }

      const roomQs = found.questions || [];
      setQuestions(roomQs);
      questionsRef.current = roomQs;
      if (roomQs.length > 0) {
        setCurrentQuestion(roomQs[0]);
      }
    } catch (err) {
       console.error('GameRoom fetchData error:', err);
       toast.error('Oda verisi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  // Sonraki soruya geç
  const advanceQuestion = (nextIdx) => {
    const allQs = questionsRef.current;
    setShowCorrectAnswer(false);
    setCorrectAnswerText('');
    if (nextIdx < allQs.length) {
      currentQuestionIndexRef.current = nextIdx;
      setCurrentQuestionIndex(nextIdx);
      setCurrentQuestion(allQs[nextIdx]);
      setTimeLeft(15);
      setSelectedAnswer(null);
    } else {
      // Tüm sorular bitti
      setPhase('result');
    }
  };

  useEffect(() => {
    fetchData();
    const s = socket.connect();

    s.emit('joinRoom', { roomId, user });

    s.on('updateScoreboard', (participants) => {
      setRoom(prev => ({ ...prev, participants }));
    });

    s.on('gameStarted', () => {
      setPhase('playing');
      setTimeLeft(15);
      setSelectedAnswer(null);
      toast.success('Oyun Başladı!');
    });

    // Tüm oyuncular bu event ile aynı anda sonraki soruya geçer
    s.on('nextQuestion', ({ questionIndex, correctAnswer }) => {
      // Doğru cevabı 5 saniye göster, sonra soruya geç
      if (correctAnswer) {
        setShowCorrectAnswer(true);
        setCorrectAnswerText(correctAnswer);
        setTimeout(() => advanceQuestion(questionIndex), 5000);
      } else {
        advanceQuestion(questionIndex);
      }
    });

    s.on('roomClosed', () => {
      toast.error('Oda kapatıldı veya host ayrıldı.');
      nav('/');
    });

    return () => {
      socket.leaveRoom();
    };
  }, [roomId]);

  // Timer — sadece host'un timerı 0'a gelince socket ile nextQuestion yayınlar
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      // Süre bitti — Doğru cevabı al, socket ile herkese yayınla
      const currentQ = questionsRef.current[currentQuestionIndexRef.current];
      const correctAnswer = currentQ?.correctAnswer || '';
      // Doğru cevabı 5 sn göster
      setShowCorrectAnswer(true);
      setCorrectAnswerText(correctAnswer);
      if (isHostRef.current) {
        const nextIdx = currentQuestionIndexRef.current + 1;
        // 5 saniye sonra socket ile herkese nextQuestion gönder
        setTimeout(() => {
          socket.emit('nextQuestion', { roomId, questionIndex: nextIdx, correctAnswer });
          advanceQuestion(nextIdx);
        }, 5000);
      }
      // Non-host oyuncular 'nextQuestion' socket event'ini bekler
    }
  }, [phase, timeLeft]);

  const fetchAiAnalysis = async (log) => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/analysis', { performanceData: log });
      setAiAnalysis(data.analysisText);
      toast.success('Yapay zeka performansını analiz etti!');
      // localStorage'a kaydet (AnalysisPage'de gösterilmek üzere)
      const savedIds = JSON.parse(localStorage.getItem('vquest_ai_report_ids') || '[]');
      localStorage.setItem('vquest_ai_report_ids', JSON.stringify([data._id, ...savedIds]));
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Oyun bittiğinde AI analizi
  useEffect(() => {
    if (phase === 'result' && performanceLogRef.current.length > 0) {
       const timer = setTimeout(() => {
         fetchAiAnalysis(performanceLogRef.current);
       }, 500);
       return () => clearTimeout(timer);
    } else if (phase === 'result' && performanceLogRef.current.length === 0) {
       setAiAnalysis("Harika bir oyundu! Bir dahaki sefere daha fazla soruyla analiz yapabilirim.");
    }
  }, [phase]);

  const startRoomGame = async () => {
    try {
      await api.post(`/rooms/${roomId}/start`);
      socket.emit('startGame', { roomId });
    } catch (err) {
      toast.error('Oyun başlatılamadı');
    }
  };

  const answerQuestion = (index) => {
    if (selectedAnswer !== null) return; // Zaten cevaplandı
    setSelectedAnswer(index);

    const isCorrect = currentQuestion?.options[index] === currentQuestion?.correctAnswer;

    // Performans kaydı (oyun sonu için)
    const newLog = [...performanceLogRef.current, { 
      category: currentQuestion.category || room?.name || room?.category || 'Genel', 
      isCorrect,
      question: currentQuestion.text 
    }];
    performanceLogRef.current = newLog;
    setPerformanceLog(newLog);

    // Sokete skor gönder
    socket.emit('submitAnswer', { 
      roomId, 
      userId: user?._id || user?.id, 
      isCorrect, 
      score: timeLeft * 10
    });

    // Doğru/yanlış gösterilmez — sadece "Cevabın alındı" bilgisi
    toast('Cevabın kaydedildi, süre dolana kadar bekle...', {
      icon: '⏳',
      duration: 2000,
    });
  };

  const closeRoomSession = () => {
    if (window.confirm('Odayı tamamen kapatmak istiyor musun?')) {
      socket.emit('closeRoom', { roomId });
    }
  };

  if (phase === 'lobby') {
    return (
      <div className="card text-center" style={{ maxWidth: 600, margin: '2rem auto', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
        <h1 className="page-title">Bekleme Odası</h1>
        <p className="text-muted mb-3">Diğer oyuncuların katılması bekleniyor... (Oda ID: {roomId})</p>
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Katılımcılar:</h4>
          {room?.participants?.map((p, i) => (
             <div key={i} className="badge badge-success" style={{ margin: '0.2rem' }}>
               👤 {p.userId?.username || `Oyuncu ${i+1}`} {(p.userId?._id || p.userId?.id) === (user?.id || user?._id) && '(Sen)'}
             </div>
          ))}
        </div>
        
        <div className="mb-2" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>Giriş Kodu: <strong style={{ fontSize: '1.2rem' }}>{room?.joinCode}</strong></p>
        </div>

        {(room?.hostId?._id || room?.hostId) === (user?.id || user?._id) ? (
          <button className="btn btn-primary btn-lg btn-full" onClick={startRoomGame}>Macerayı Başlat</button>
        ) : (
          <div className="loading-center" style={{ height: 'auto', gap: '0.5rem' }}>
            <span className="spinner spinner-sm" />
            <p>Oyun sahibinin başlatması bekleniyor...</p>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="card text-center" style={{ maxWidth: 800, margin: '2rem auto', padding: '3rem 2rem' }}>
        <h1 className="page-title mb-3">🏆 Skor Tablosu</h1>
        <div className="table-wrap mb-2">
          <table className="table">
            <thead><tr><th>Sıralama</th><th>Oyuncu</th><th>Puan</th></tr></thead>
            <tbody>
              {room?.participants?.sort((a,b) => b.score - a.score).map((p, i) => (
                <tr key={i} style={i===0 ? { background: 'rgba(255,215,0,0.1)' } : {}}>
                  <td style={{ fontSize: '1.2rem' }}>
                    {i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : `#${i+1}`}
                  </td>
                  <td className="font-bold">{p.userId?.username || 'Oyuncu'}</td>
                  <td className="text-success font-bold">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {aiLoading ? (
          <div className="card mb-2 p-1 text-center" style={{ border: '1px dashed var(--primary)' }}>
             <span className="spinner sm" /> Yapay zeka performansını analiz ediyor...
          </div>
        ) : aiAnalysis && (
          <div className="card mb-2 p-1" style={{ background: 'rgba(108,71,255,0.1)', border: '1px solid var(--primary)' }}>
             <h4 style={{ color: 'var(--primary-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>🤖 AI Değerlendirmesi</h4>
             <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{aiAnalysis}"</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => nav('/')}>Odadan Çık</button>
          {(room?.hostId?._id || room?.hostId) === (user?.id || user?._id) && (
            <button className="btn btn-danger" onClick={closeRoomSession}>⚠️ Odayı Kapat</button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'playing' && (!currentQuestion || questions.length === 0)) {
     return (
       <div className="loading-center">
         <span className="spinner spinner-lg" />
         <p>Sorular hazırlanıyor...</p>
       </div>
     );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
      <div className="timer-bar-container">
        <div className="timer-bar" style={{ width: `${(timeLeft / 15) * 100}%` }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Soru {currentQuestionIndex + 1} / {questions.length}
        </span>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, textShadow: 'var(--glow)' }}>
          {timeLeft}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {selectedAnswer !== null ? '✅ Cevap verildi' : '⏳ Bekleniyor'}
        </span>
      </div>

      {/* Doğru Cevap Banner — süre bitince 5 sn gösterilir */}
      {showCorrectAnswer && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '1.2rem 2rem',
          marginBottom: '1rem',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#22c55e',
          letterSpacing: '0.02em',
        }}>
          ✅ Doğru Cevap: {correctAnswerText}
        </div>
      )}

      <div className="card mb-3" style={{ padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>{currentQuestion?.text}</h2>
      </div>

      <div className="grid-2">
         {currentQuestion?.options.map((opt, i) => (
           <button 
             key={i} 
             className={`answer-btn answer-btn-${i} ${selectedAnswer === i ? 'answer-selected' : ''}`}
             onClick={() => answerQuestion(i)}
             disabled={selectedAnswer !== null || showCorrectAnswer}
             style={{ 
               minHeight: 120, 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
             }}
           >
             {opt}
           </button>
         ))}
      </div>
    </div>
  );
}
