import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Flame, Target, Crown, Zap, Activity } from 'lucide-react';
import './Leaderboard.css';

const INITIAL_DB = [
  { id: 'u2', username: 'ShadowNinja', avatar: 'SN', level: 24, weeklyXP: 850, currentStreak: 12, missionsCompleted: 45 },
  { id: 'u3', username: 'IronTank', avatar: 'IT', level: 32, weeklyXP: 1200, currentStreak: 21, missionsCompleted: 88 },
  { id: 'u4', username: 'ZenMaster', avatar: 'ZM', level: 41, weeklyXP: 1050, currentStreak: 15, missionsCompleted: 102 },
  { id: 'u5', username: 'StarWeaver', avatar: 'SW', level: 19, weeklyXP: 600, currentStreak: 5, missionsCompleted: 24 },
  { id: 'u6', username: 'VoidRanger', avatar: 'VR', level: 28, weeklyXP: 920, currentStreak: 8, missionsCompleted: 56 },
  { id: 'u7', username: 'NovaStriker', avatar: 'NS', level: 15, weeklyXP: 450, currentStreak: 3, missionsCompleted: 15 },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    // 1. Fetch "Real" Database Users
    let dbUsers = JSON.parse(localStorage.getItem('globalLeaderboard'));
    if (!dbUsers) {
      dbUsers = INITIAL_DB;
      localStorage.setItem('globalLeaderboard', JSON.stringify(dbUsers));
    }

    // 2. Fetch Real Current User Analytics
    const analytics = JSON.parse(localStorage.getItem('userAnalytics')) || { xpToday: 0, focusTime: 0, missions: 0, streak: 0 };
    
    // Convert 'xpToday' to 'weeklyXP' for the sake of the leaderboard, or assume xpToday is cumulative for the week
    const me = {
      id: user?.id || 'me',
      username: user?.username || 'You',
      avatar: user?.username ? user.username.substring(0,2).toUpperCase() : 'ME',
      level: user?.level || 1,
      weeklyXP: analytics.xpToday || 0,
      currentStreak: analytics.streak || 0,
      missionsCompleted: analytics.missions || 0,
      isMe: true
    };

    setMyStats(me);

    // 3. Combine & Rank
    const combined = [...dbUsers, me];
    
    // Sort logic: Weekly XP -> Current Streak -> Missions Completed
    combined.sort((a, b) => {
      if (b.weeklyXP !== a.weeklyXP) return b.weeklyXP - a.weeklyXP;
      if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
      return b.missionsCompleted - a.missionsCompleted;
    });

    // Assign ranks
    const ranked = combined.map((u, index) => ({ ...u, rank: index + 1 }));
    setLeaderboardData(ranked);
    
  }, [user]);

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);
  const myRankData = leaderboardData.find(u => u.isMe);

  return (
    <div className="leaderboard-page fade-in">
      <div className="leaderboard-bg"></div>

      <div className="leaderboard-content">
        <div className="lb-header fade-up delay-1">
          <h1 className="lb-title">GLOBAL RANKINGS</h1>
          <p className="lb-subtitle">Legends are forged in the fires of discipline.</p>
        </div>

        <div className="lb-tabs fade-up delay-2">
          <button className={`lb-tab ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>🌍 Global</button>
          <button className={`lb-tab ${activeTab === 'squad' ? 'active' : ''}`} onClick={() => setActiveTab('squad')}>👥 Squad</button>
          <button className={`lb-tab ${activeTab === 'guild' ? 'active' : ''}`} onClick={() => setActiveTab('guild')}>🏰 Guild</button>
        </div>

        {/* Podium */}
        {top3.length >= 3 && (
          <div className="podium-container fade-up delay-3">
            {/* Rank 2 */}
            <div className={`podium-card rank-2 ${top3[1].isMe ? 'is-me' : ''}`}>
              <div className="podium-avatar">{top3[1].avatar}</div>
              <div className="podium-name">{top3[1].username}</div>
              <div className="podium-xp">{top3[1].weeklyXP} XP</div>
              <div className="podium-streak"><Flame size={14} className="inline-icon"/> {top3[1].currentStreak} Day Streak</div>
            </div>

            {/* Rank 1 */}
            <div className={`podium-card rank-1 ${top3[0].isMe ? 'is-me' : ''}`}>
              <Crown size={40} className="podium-crown" />
              <div className="podium-avatar">{top3[0].avatar}</div>
              <div className="podium-name">{top3[0].username}</div>
              <div className="podium-xp">{top3[0].weeklyXP} XP</div>
              <div className="podium-streak"><Flame size={14} className="inline-icon"/> {top3[0].currentStreak} Day Streak</div>
            </div>

            {/* Rank 3 */}
            <div className={`podium-card rank-3 ${top3[2].isMe ? 'is-me' : ''}`}>
              <div className="podium-avatar">{top3[2].avatar}</div>
              <div className="podium-name">{top3[2].username}</div>
              <div className="podium-xp">{top3[2].weeklyXP} XP</div>
              <div className="podium-streak"><Flame size={14} className="inline-icon"/> {top3[2].currentStreak} Day Streak</div>
            </div>
          </div>
        )}

        <div className="lb-main-grid fade-up delay-4">
          
          {/* List Column */}
          <div className="lb-list-col">
            {rest.map((u, i) => (
              <div key={u.id} className={`lb-row ${u.isMe ? 'is-me' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="row-rank">#{u.rank}</div>
                <div className="row-avatar">{u.avatar}</div>
                <div className="row-info">
                  <div className="row-name">
                    {u.username} {u.isMe && <span className="you-badge">YOU</span>}
                  </div>
                  <div className="row-class">Lvl {u.level}</div>
                </div>
                <div className="row-stats">
                  <span className="stat-xp">{u.weeklyXP} XP</span>
                  <span className="stat-streak"><Flame size={16}/> {u.currentStreak}</span>
                  <div className="action-buttons">
                    {!u.isMe && <button className="btn-action" title="Send Motivation"><Zap size={14} color="#0ea5e9"/></button>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Stats Column */}
          <div className="lb-side-col">
            {myStats && myRankData && (
              <div className="personal-stats-card">
                <div className="ps-header">
                  <Activity size={20} /> YOUR RECORD
                </div>
                <div className="ps-grid">
                  <div className="ps-item rank">
                    <span className="ps-value">#{myRankData.rank}</span>
                    <span className="ps-label">Global Rank</span>
                  </div>
                  <div className="ps-item xp">
                    <span className="ps-value">{myStats.weeklyXP}</span>
                    <span className="ps-label">Weekly XP</span>
                  </div>
                  <div className="ps-item">
                    <span className="ps-value">{myStats.currentStreak}</span>
                    <span className="ps-label">Day Streak</span>
                  </div>
                  <div className="ps-item">
                    <span className="ps-value">{myStats.missionsCompleted}</span>
                    <span className="ps-label">Missions</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
