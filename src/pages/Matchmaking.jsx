import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Matchmaking.css';

const FAKE_WARRIORS = [
  { id: 'w1', name: 'ShadowNinja', level: 14, avatar: 'SN', class: 'Rogue', color: 'purple' },
  { id: 'w2', name: 'IronTank', level: 22, avatar: 'IT', class: 'Warrior', color: 'orange' },
  { id: 'w3', name: 'ZenMaster', level: 31, avatar: 'ZM', class: 'Monk', color: 'green' },
  { id: 'w4', name: 'StarWeaver', level: 19, avatar: 'SW', class: 'Mage', color: 'blue' }
];

export default function Matchmaking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joinedWarriors, setJoinedWarriors] = useState([]);
  const [statusText, setStatusText] = useState('Initiating scan...');

  useEffect(() => {
    const analytics = JSON.parse(localStorage.getItem('userAnalytics')) || { streak: 0 };
    
    // Current user is always first
    const currentUser = {
      id: user?.id || 'u1',
      name: user?.username || 'You',
      level: user?.level || 1,
      avatar: user?.username ? user.username.substring(0, 2).toUpperCase() : 'ME',
      class: user?.heroClass || 'Novice',
      color: 'pink',
      isMe: true,
      completedToday: false,
      streak: analytics.streak
    };

    setJoinedWarriors([currentUser]);

    const timeouts = [];
    
    const activeQuest = JSON.parse(localStorage.getItem('activeQuest')) || { name: 'Focus', duration: '15 min' };
    
    const INITIAL_DB = [
      { id: 'u2', username: 'ShadowNinja', avatar: 'SN', level: 24, weeklyXP: 850, currentStreak: 12, missionsCompleted: 45 },
      { id: 'u3', username: 'IronTank', avatar: 'IT', level: 32, weeklyXP: 1200, currentStreak: 21, missionsCompleted: 88 },
      { id: 'u4', username: 'ZenMaster', avatar: 'ZM', level: 41, weeklyXP: 1050, currentStreak: 15, missionsCompleted: 102 },
      { id: 'u5', username: 'StarWeaver', avatar: 'SW', level: 19, weeklyXP: 600, currentStreak: 5, missionsCompleted: 24 },
      { id: 'u6', username: 'VoidRanger', avatar: 'VR', level: 28, weeklyXP: 920, currentStreak: 8, missionsCompleted: 56 },
      { id: 'u7', username: 'NovaStriker', avatar: 'NS', level: 15, weeklyXP: 450, currentStreak: 3, missionsCompleted: 15 },
    ];

    // Fetch from the real "database" of users
    let allUsers = JSON.parse(localStorage.getItem('globalLeaderboard'));
    if (!allUsers) {
      allUsers = INITIAL_DB;
      localStorage.setItem('globalLeaderboard', JSON.stringify(allUsers));
    }
    const myLvl = user?.level || 1;
    
    // Match criteria: level diff <= 2. In a real app we'd also match habit and duration.
    let matchedUsers = allUsers.filter(u => Math.abs(u.level - myLvl) <= 5);
    // Shuffle and pick up to 3
    matchedUsers = matchedUsers.sort(() => 0.5 - Math.random()).slice(0, 3);

    if (matchedUsers.length === 0) {
      timeouts.push(setTimeout(() => {
        setStatusText('🔍 Searching for squad...');
      }, 1500));
      timeouts.push(setTimeout(() => {
        setStatusText('No matching warriors found. Deploying solo...');
      }, 4000));
      timeouts.push(setTimeout(() => {
        localStorage.setItem('currentSquad', JSON.stringify({
          name: 'Lone Wolf',
          members: [currentUser]
        }));
        navigate('/squad');
      }, 6000));
    } else {
      matchedUsers.forEach((mu, i) => {
        timeouts.push(setTimeout(() => {
          if (i === 0) setStatusText('Locating nearby signals...');
          else if (i === 1) setStatusText(`Syncing ${activeQuest.name} objectives...`);
          else setStatusText('Assembling squad for ' + activeQuest.duration + ' mission...');
          
          setJoinedWarriors(prev => [...prev, { 
            id: mu.id, name: mu.username, level: mu.level, avatar: mu.avatar, 
            class: 'Warrior', color: 'blue', completedToday: Math.random() > 0.5, streak: mu.currentStreak 
          }]);
        }, 1500 * (i + 1)));
      });

      timeouts.push(setTimeout(() => {
        setStatusText('Squad successfully formed!');
        
        setJoinedWarriors(prev => {
          localStorage.setItem('currentSquad', JSON.stringify({
            name: `${activeQuest.name.substring(0, 8)} Vanguard`,
            members: prev
          }));
          return prev;
        });
        
      }, 1500 * (matchedUsers.length + 1)));

      timeouts.push(setTimeout(() => {
        navigate('/squad');
      }, 1500 * (matchedUsers.length + 2)));
    }

    return () => timeouts.forEach(clearTimeout);
  }, [navigate, user]);

  return (
    <div className="matchmaking-screen">
      <div className="radar-bg">
        <div className="radar-circle circle-1"></div>
        <div className="radar-circle circle-2"></div>
        <div className="radar-circle circle-3"></div>
        <div className="radar-sweep"></div>
      </div>

      <div className="matchmaking-content">
        <div className="searching-icon-container">
          <Search size={40} className="pulse-search" />
        </div>
        
        <h1 className="matchmaking-title glitch-glow">Finding Your Squad...</h1>
        <p className="matchmaking-subtitle">Searching for warriors on the same path</p>
        
        <div className="status-terminal">
          <span className="terminal-prefix">&gt;</span> {statusText}
          <span className="cursor-blink">_</span>
        </div>

        <div className="warriors-grid">
          {/* Render 4 slots */}
          {[0, 1, 2, 3].map((index) => {
            const warrior = joinedWarriors[index];
            if (warrior) {
              return (
                <div key={warrior.id} className="warrior-slot filled fade-in-scale">
                  <div className={`avatar-hex glow-${warrior.color}`}>
                    {warrior.avatar}
                  </div>
                  <div className="warrior-info">
                    <span className="warrior-name">{warrior.name}</span>
                    <span className="warrior-level">
                      <Zap size={10} /> Lvl {warrior.level}
                    </span>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={`empty-${index}`} className="warrior-slot empty">
                  <div className="avatar-hex empty-hex">
                    <Shield size={24} className="empty-icon" />
                  </div>
                  <div className="warrior-info">
                    <span className="empty-text">Awaiting...</span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
