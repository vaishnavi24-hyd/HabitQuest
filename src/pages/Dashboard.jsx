import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroEvolution from '../components/HeroEvolution';
import { 
  Shield, Zap, Flame, Clock, Target, Trophy, 
  ChevronRight, Activity, CalendarDays, Rocket 
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quests, setQuests] = useState([]);
  const [activeQuest, setActiveQuest] = useState(null);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [analytics, setAnalytics] = useState({ xpToday: 0, focusTime: 0, missions: 0, streak: 0 });
  
  useEffect(() => {
    const savedQuests = JSON.parse(localStorage.getItem('habitQuests') || '[]');
    setQuests(savedQuests);
    
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active && active.status === 'active') {
      setActiveQuest(active);
    }
    
    const savedAnalytics = JSON.parse(localStorage.getItem('userAnalytics'));
    if (savedAnalytics) {
      setAnalytics(savedAnalytics);
    }
  }, []);

  const handleAbort = () => {
    // End quest and remove active
    const existingQuests = JSON.parse(localStorage.getItem('habitQuests') || '[]');
    if (activeQuest) {
      const updatedQuests = existingQuests.map(q => 
        q.id === activeQuest.id ? { ...q, status: 'aborted' } : q
      );
      localStorage.setItem('habitQuests', JSON.stringify(updatedQuests));
    }
    localStorage.removeItem('activeQuest');
    setActiveQuest(null);
    setShowAbortConfirm(false);
  };

  const heroLevel = user?.level || 4;
  const currentXP = 75;
  const nextLevelXP = 100;
  const xpPercent = (currentXP / nextLevelXP) * 100;

  // Mock graph data
  const weekData = [
    { day: 'Mon', xp: 40 },
    { day: 'Tue', xp: 65 },
    { day: 'Wed', xp: 30 },
    { day: 'Thu', xp: 85 },
    { day: 'Fri', xp: 50 },
    { day: 'Sat', xp: 95 },
    { day: 'Sun', xp: 120 },
  ];

  const maxXP = Math.max(...weekData.map(d => d.xp));

  return (
    <div className="dashboard-container">
      <div className="particles-bg"></div>

      {showAbortConfirm && (
        <div className="abort-overlay" style={{zIndex: 1000}}>
          <div className="abort-card">
            <h1 className="abort-title">⚠️ ABORT QUEST?</h1>
            <p className="abort-desc">Abort your quest? Progress will be lost.</p>
            <div className="abort-actions">
              <button className="btn-confirm-abort" onClick={handleAbort}>Abort Mission</button>
              <button className="btn-cancel-abort" onClick={() => setShowAbortConfirm(false)}>Continue Mission</button>
            </div>
          </div>
        </div>
      )}

      <header className="dash-header">
        <h1 className="dash-title">COMMAND CENTER</h1>
        <p className="dash-subtitle">Welcome back, Commander.</p>
      </header>

      <div className="dash-grid">
        
        {/* SECTION 1: HERO EVOLUTION */}
        <div className="hero-evolution-wrapper">
          <HeroEvolution currentStreak={analytics.streak} />
        </div>

        {/* SECTION 2: DAILY PERFORMANCE */}
        <div className="dash-card performance-card">
          <h3 className="card-heading"><Activity size={18} /> DAILY REPORT</h3>
          <div className="perf-grid">
            <div className="perf-item glow-blue">
              <Target size={24} className="perf-icon" />
              <div className="perf-data">
                <span className="perf-value">{analytics.missions}</span>
                <span className="perf-label">MISSIONS DONE</span>
              </div>
            </div>
            <div className="perf-item glow-orange">
              <Flame size={24} className="perf-icon" />
              <div className="perf-data">
                <span className="perf-value">{analytics.streak} Day</span>
                <span className="perf-label">ACTIVE STREAK</span>
              </div>
            </div>
            <div className="perf-item glow-green">
              <Zap size={24} className="perf-icon" />
              <div className="perf-data">
                <span className="perf-value">{analytics.xpToday}</span>
                <span className="perf-label">XP EARNED</span>
              </div>
            </div>
            <div className="perf-item glow-purple">
              <Clock size={24} className="perf-icon" />
              <div className="perf-data">
                <span className="perf-value">{analytics.focusTime}m</span>
                <span className="perf-label">FOCUS TIME</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: WEEKLY ANALYTICS */}
        <div className="dash-card analytics-card">
          <h3 className="card-heading"><CalendarDays size={18} /> 7-DAY TACTICAL RECORD</h3>
          <div className="chart-container">
            <div className="bars-wrap">
              {weekData.map((data, idx) => {
                const height = (data.xp / maxXP) * 100;
                return (
                  <div key={idx} className="chart-bar-group">
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ height: `${height}%`, animationDelay: `${idx * 0.1}s` }}>
                        <span className="bar-tooltip">{data.xp} XP</span>
                      </div>
                    </div>
                    <span className="bar-label">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: ACHIEVEMENTS */}
        <div className="dash-card achievements-card">
          <h3 className="card-heading"><Trophy size={18} /> UNLOCKED MEDALS</h3>
          <div className="achievements-list">
            <div className="achievement-item">
              <div className="ach-icon bg-gold"><Trophy size={20} /></div>
              <div className="ach-info">
                <h4>First Blood</h4>
                <p>Completed first mission</p>
              </div>
            </div>
            <div className="achievement-item">
              <div className="ach-icon bg-orange"><Flame size={20} /></div>
              <div className="ach-info">
                <h4>Ignition</h4>
                <p>Hit a 3-day streak</p>
              </div>
            </div>
            <div className="achievement-item">
              <div className="ach-icon bg-blue"><Shield size={20} /></div>
              <div className="ach-info">
                <h4>Focus Warrior</h4>
                <p>Logged 1 hr total focus</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: CURRENT QUEST OR NEXT QUEST */}
        {activeQuest ? (
          <div className="dash-card next-quest-card active-quest-mode">
            <div className="next-quest-content">
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <Shield size={40} className="rocket-icon text-green" />
                <div className="nq-info">
                  <h3 style={{color: '#10b981'}}>🔒 Mission in Progress</h3>
                  <p>Habit name: <strong>{activeQuest.name}</strong></p>
                  <p>Progress: <strong>Day {activeQuest.currentDayProgress} / {activeQuest.totalDays}</strong></p>
                  <p>Status: <strong className="text-orange">Mission Active 🔥</strong></p>
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
                <div style={{display: 'flex', gap: '15px'}}>
                  <button className="btn-abort-mission" style={{fontSize: '0.9rem', padding: '10px 20px'}} onClick={() => setShowAbortConfirm(true)}>
                    Abort Mission
                  </button>
                  <button className="btn-launch-quest" style={{background: 'linear-gradient(90deg, #10b981, #0ea5e9)'}} onClick={() => navigate('/mission')}>
                    ⚡ CONTINUE NEXT DAY
                  </button>
                </div>
                <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>Day {activeQuest.currentDayProgress} of {activeQuest.totalDays} — Stay consistent, hero</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="dash-card next-quest-card">
            <div className="next-quest-content">
              <Rocket size={40} className="rocket-icon" />
              <div className="nq-info">
                <h3>RECOMMENDED NEXT MISSION</h3>
                <p>System analysis suggests a <strong>Physical Discipline</strong> quest to balance your stats.</p>
              </div>
              <button className="btn-launch-quest" onClick={() => navigate('/quest-builder')}>
                INITIATE LAUNCH <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
