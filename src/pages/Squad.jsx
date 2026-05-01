import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, Send, CheckCircle2, Circle, Flame, 
  Users, Zap, Award, Play, Pause, RotateCcw, Crosshair, HelpCircle, BrainCircuit, Activity, Trophy
} from 'lucide-react';
import './Squad.css';

const ALL_GAMES = [
  { id: 'memory', title: 'Memory Match', desc: 'Flip and find the matching symbols.', icon: BrainCircuit, color: 'blue' },
  { id: 'riddle', title: 'Riddle Challenge', desc: 'Solve the ancient enigma.', icon: HelpCircle, color: 'purple' },
  { id: 'reaction', title: 'Reaction Tap', desc: 'Test your lightning reflexes.', icon: Zap, color: 'orange' },
  { id: 'pattern', title: 'Pattern Sequence', desc: 'Repeat the visual pattern exactly.', icon: Crosshair, color: 'pink' },
];

const RIDDLES = [
  { q: "I speak without a mouth and hear without ears. What am I?", options: ["Wind", "Echo", "Shadow"], a: "Echo" },
  { q: "The more of this there is, the less you see. What is it?", options: ["Darkness", "Fog", "Light"], a: "Darkness" },
  { q: "I have keys but open no doors. I have space but no room. What am I?", options: ["Map", "Keyboard", "Piano"], a: "Keyboard" }
];

export default function Squad() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Basic Squad & Chat State
  const [squadData, setSquadData] = useState({ name: 'Loading...', members: [] });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'System', text: 'Squad assembled. Mission started.', time: '10:00', type: 'sys' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Timer & Focus State
  const getTotalTime = () => {
    try {
      const activeQuest = JSON.parse(localStorage.getItem('activeQuest'));
      if (activeQuest) {
        const durationStr = activeQuest.duration || '15 min';
        if (durationStr === 'Custom') return 25 * 60;
        const parsedMins = parseInt(durationStr);
        return isNaN(parsedMins) ? 15 * 60 : parsedMins * 60;
      }
    } catch (e) {}
    return 15 * 60;
  };

  const getInitialTime = () => {
    try {
      const activeQuest = JSON.parse(localStorage.getItem('activeQuest'));
      if (activeQuest) {
        if (activeQuest.missionStatus === 'in_progress' && activeQuest.lastTickAt && activeQuest.remainingTime !== undefined) {
           const now = Date.now();
           const deltaSeconds = Math.floor((now - activeQuest.lastTickAt) / 1000);
           const newRemaining = Math.max(0, activeQuest.remainingTime - deltaSeconds);
           return newRemaining;
        } else if (activeQuest.remainingTime !== undefined) {
           return activeQuest.remainingTime;
        }
        return getTotalTime();
      }
    } catch (e) {}
    return 15 * 60;
  };

  const [totalTime, setTotalTime] = useState(getTotalTime);
  const [timeLeft, setTimeLeft] = useState(getInitialTime);
  const [timerActive, setTimerActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [breakPoints, setBreakPoints] = useState([]);
  
  // Ice Breaker State
  const [showIcebreaker, setShowIcebreaker] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState(null);
  const [miniGameState, setMiniGameState] = useState('select'); // select, playing, won
  const [gameOptions, setGameOptions] = useState([]);
  
  const [powerBreaksUsed, setPowerBreaksUsed] = useState(0);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Load Squad Data
  useEffect(() => {
    const savedData = localStorage.getItem('currentSquad');
    if (savedData) {
      setSquadData(JSON.parse(savedData));
    } else {
      navigate('/start-adventure');
    }
  }, [navigate]);



  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Timer Logic
  useEffect(() => {
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active && active.missionStatus === 'in_progress') {
       setTimerActive(true);
       setIsFocusMode(true);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (timerActive) {
      const active = JSON.parse(localStorage.getItem('activeQuest'));
      if (active) {
        active.remainingTime = timeLeft;
        active.lastTickAt = Date.now();
        active.missionStatus = 'in_progress';
        localStorage.setItem('activeQuest', JSON.stringify(active));
      }
    }
    if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      executeCompletion('complete');
    }
    
    // Auto chat messages based on percentage
    const percentage = Math.round(((totalTime - timeLeft) / totalTime) * 100);
    if (percentage === 50 && timerActive) {
      addSystemMessage('⚡ Squad halfway there! Keep pushing.');
      addSystemMessage('🚀 You reached 50%!');
    }
    if (percentage === 80 && timerActive) {
      setChatMessages(prev => [...prev, {
        id: Date.now(), sender: 'ShadowNinja', text: '🔥 Mission almost complete!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'user'
      }]);
    }
  }, [timeLeft, timerActive, totalTime]);

  const handlePowerBreakClick = () => {
    if (powerBreaksUsed >= 2) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 2000);
      return;
    }
    setPowerBreaksUsed(prev => prev + 1);
    setTimerActive(false);
    setIsFocusMode(false);
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active) {
      active.missionStatus = 'paused';
      localStorage.setItem('activeQuest', JSON.stringify(active));
    }
    
    // Select 3 random games
    const shuffled = [...ALL_GAMES].sort(() => 0.5 - Math.random());
    setGameOptions(shuffled.slice(0, 3));
    
    setShowIcebreaker(true);
    setMiniGameState('select');
  };

  const handleStartTimer = () => {
    setTimerActive(true);
    setIsFocusMode(true);
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active) {
      active.missionStatus = 'in_progress';
      localStorage.setItem('activeQuest', JSON.stringify(active));
    }
    addSystemMessage(`⚡ ${user?.username || 'You'} entered Focus Mode!`);
  };

  const handlePauseTimer = () => {
    setTimerActive(false);
    setIsFocusMode(false);
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active) {
      active.missionStatus = 'paused';
      localStorage.setItem('activeQuest', JSON.stringify(active));
    }
  };

  const addSystemMessage = (text) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: 'System', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'sys'
    }]);
  };

  const handleQuickChat = (msg) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: user?.username || 'You', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'user'
    }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'ShadowNinja', text: 'Roger that! ⚡', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'user'
      }]);
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: user?.username || 'You', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'user'
    }]);
    setNewMessage('');
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'IronTank', text: 'Stay focused! We got this.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'user'
      }]);
    }, 2500);
  };

  const handleCompleteClick = () => {
    setTimerActive(false);
    if (timeLeft > 0) {
      setShowIncompleteModal(true);
    } else {
      executeCompletion('complete');
    }
  };

  const confirmEarlyCompletion = () => {
    setShowIncompleteModal(false);
    executeCompletion('partial', timeLeft, totalTime);
  };

  const executeCompletion = (statusType, tLeft = 0, tTotal = 1) => {
    setTimerActive(false);
    setIsFocusMode(false);
    
    setSquadData(prev => {
      const updatedMembers = prev.members.map(m => {
        if (m.isMe) {
          return { ...m, completedToday: true, streak: m.streak + 1 };
        }
        return m;
      });
      return { ...prev, members: updatedMembers };
    });
    
    // Progress Active Quest
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active) {
      active.currentDayProgress += 1;
      if (active.currentDayProgress >= active.totalDays) {
        active.status = 'completed';
        localStorage.removeItem('activeQuest');
      } else {
        localStorage.setItem('activeQuest', JSON.stringify(active));
      }
      
      // Update in history as well
      const existingQuests = JSON.parse(localStorage.getItem('habitQuests') || '[]');
      const updatedQuests = existingQuests.map(q => q.id === active.id ? active : q);
      localStorage.setItem('habitQuests', JSON.stringify(updatedQuests));
    }
    
    // Update Analytics
    const elapsedRatio = statusType === 'complete' ? 1.0 : Math.max(0, (tTotal - tLeft) / tTotal);
    const timeSpentMinutes = Math.floor((tTotal - tLeft) / 60);
    const noBreaks = powerBreaksUsed === 0;
    
    let baseXP = 30;
    if (active && active.currentDayProgress >= active.totalDays) baseXP = 100;
    else if (statusType === 'partial') baseXP = 10;
    
    let earnedXP = statusType === 'partial' ? Math.max(0, Math.floor(baseXP * elapsedRatio)) : baseXP;
    let bonusXP = (active && active.currentDayProgress >= active.totalDays) ? 50 : (statusType === 'complete' ? 10 : 0);
    if (noBreaks && statusType === 'complete') bonusXP += 5;
    const totalXP = earnedXP + bonusXP;
    
    const analytics = JSON.parse(localStorage.getItem('userAnalytics') || '{"xpToday":0,"focusTime":0,"missions":0,"streak":0}');
    analytics.xpToday += totalXP;
    analytics.focusTime += timeSpentMinutes;
    analytics.missions += 1;
    analytics.streak = active ? active.currentDayProgress : (analytics.streak + 1);
    localStorage.setItem('userAnalytics', JSON.stringify(analytics));
    
    if (statusType === 'complete') {
      addSystemMessage(`🏆 ${user?.username || 'You'} COMPLETED THE MISSION PERFECTLY!`);
    } else {
      addSystemMessage(`⚠️ ${user?.username || 'You'} EXTRACTED EARLY.`);
    }



    // Redirect to results
    setTimeout(() => {
      navigate(`/results?status=${statusType}&ratio=${elapsedRatio.toFixed(2)}&noBreaks=${noBreaks}`);
    }, 500);
  };

  const handleAbortMission = () => {
    setTimerActive(false);
    setShowAbortModal(true);
  };

  const confirmAbort = () => {
    // Abort Active Quest
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active) {
      active.status = 'aborted';
      localStorage.removeItem('activeQuest');
      const existingQuests = JSON.parse(localStorage.getItem('habitQuests') || '[]');
      const updatedQuests = existingQuests.map(q => q.id === active.id ? active : q);
      localStorage.setItem('habitQuests', JSON.stringify(updatedQuests));
    }
    
    setShowAbortModal(false);
    navigate('/results?status=aborted');
  };

  const cancelAbort = () => {
    setShowAbortModal(false);
    setTimerActive(true);
  };

  const completeMiniGame = () => {
    setMiniGameState('won');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const completionPercentage = Math.round(((totalTime - timeLeft) / totalTime) * 100);
  const strokeDashoffset = 283 - (283 * (timeLeft / totalTime));
  const currentUser = squadData.members.find(m => m.isMe);
  const isComplete = currentUser?.completedToday;

  return (
    <div className={`mission-room ${isFocusMode ? 'focus-active' : ''}`}>
      <div className="hud-ambient-bg"></div>
      <div className="hud-grid-overlay"></div>

      {/* --- ABORT MODAL --- */}
      {showAbortModal && (
        <div className="abort-overlay">
          <div className="abort-card">
            <h1 className="abort-title">⚠️ ABORT MISSION?</h1>
            <p className="abort-desc">Abort your quest? Progress will be lost.</p>
            <div className="abort-actions">
              <button className="btn-confirm-abort" onClick={confirmAbort}>Abort Mission</button>
              <button className="btn-cancel-abort" onClick={cancelAbort}>Continue Mission</button>
            </div>
          </div>
        </div>
      )}

      {/* --- INCOMPLETE MODAL --- */}
      {showIncompleteModal && (
        <div className="abort-overlay">
          <div className="abort-card">
            <h1 className="abort-title" style={{color: '#f97316'}}>MISSION INCOMPLETE ⚠️</h1>
            <p className="abort-desc">You ended early. Rewards reduced.</p>
            <div className="stats-box" style={{background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '10px', margin: '20px 0', textAlign: 'left', color: '#cbd5e1'}}>
              <p style={{margin: '5px 0'}}>Time completed: <strong style={{color: '#fff'}}>{formatTime(totalTime - timeLeft)}</strong></p>
              <p style={{margin: '5px 0'}}>Time required: <strong style={{color: '#fff'}}>{formatTime(totalTime)}</strong></p>
              <p style={{margin: '5px 0'}}>XP earned: <strong style={{color: '#f97316'}}>~{completionPercentage}%</strong></p>
            </div>
            <div className="abort-actions">
              <button className="btn-confirm-abort" onClick={confirmEarlyCompletion} style={{background: '#f97316', borderColor: '#f97316', color: '#fff'}}>Accept Reduced Reward</button>
              <button className="btn-cancel-abort" onClick={() => {setShowIncompleteModal(false); setTimerActive(true);}}>Continue Mission</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ICE BREAKER MODAL (FULL SCREEN) --- */}
      {showIcebreaker && (
        <div className="icebreaker-overlay full-screen">
          <div className="icebreaker-card">
            
            {miniGameState === 'select' && (
              <div className="ice-select-view">
                <div className="ice-header">
                  <h1 className="ice-title text-glitch">⚡ POWER BREAK ACTIVATED</h1>
                  <h3 className="ice-subtitle">Recharge your mind, hero.</h3>
                </div>
                
                <div className="minigame-options-grid">
                  {gameOptions.map(game => (
                    <div 
                      key={game.id} 
                      className={`minigame-neon-card glow-${game.color}`}
                      onClick={() => { setActiveMiniGame(game.id); setMiniGameState('playing'); }}
                    >
                      <div className="mg-icon-wrap"><game.icon size={40} /></div>
                      <h2>{game.title}</h2>
                      <p>{game.desc}</p>
                    </div>
                  ))}
                </div>
                
                <button 
                  style={{marginTop: '40px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Orbitron', fontWeight: 'bold'}}
                  onClick={() => { setShowIcebreaker(false); setTimerActive(true); setIsFocusMode(true); }}
                >
                  🚀 RETURN TO MISSION
                </button>
              </div>
            )}

            {miniGameState === 'playing' && (
              <div className="ice-play-view">
                {activeMiniGame === 'riddle' && <RiddleGame onWin={completeMiniGame} />}
                {activeMiniGame === 'reaction' && <ReactionGame onWin={completeMiniGame} />}
                {activeMiniGame === 'memory' && <MemoryGame onWin={completeMiniGame} />}
                {activeMiniGame === 'pattern' && <PatternGame onWin={completeMiniGame} />}
              </div>
            )}

            {miniGameState === 'won' && (
              <div className="minigame-won">
                <div className="xp-reward-anim">
                  <span className="xp-text">MINI GAME COMPLETED! ⚡</span>
                </div>
                <button 
                  style={{marginTop: '40px', background: '#0ea5e9', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Orbitron', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(14,165,233,0.5)'}}
                  onClick={() => { setShowIcebreaker(false); setActiveMiniGame(null); setTimerActive(true); setIsFocusMode(true); }}
                >
                  🚀 RETURN TO MISSION
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MAIN HUD --- */}
      <div className="hud-container">
        
        {/* TOP HEADER & GAMIFIED PROGRESS BAR */}
        <header className="hud-header">
          <div className="header-left">
            <div className="squad-info">
              <h1 className="squad-name-glitch">{squadData.name}</h1>
              <div className="mission-status">
                <span className="live-dot"></span>
                MISSION ACTIVE • {squadData.members.filter(m => m.completedToday).length}/{squadData.members.length} COMPLETED
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="session-progress-wrapper">
              <div className="sp-text">
                Session Progress: {formatTime(totalTime - timeLeft)} / {formatTime(totalTime)}
              </div>
              <div className="sp-bar-bg">
                <div className="sp-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="timer-display-simple">
              {formatTime(timeLeft)}
            </div>
            <div className="header-controls">
              <div style={{display: 'flex', gap: '10px'}}>
                {!timerActive && timeLeft > 0 && (
                  <button className="btn-timer play" onClick={handleStartTimer}><Play size={16} /> START</button>
                )}
                {timerActive && (
                  <button className="btn-timer pause" onClick={handlePauseTimer}><Pause size={16} /> PAUSE</button>
                )}
                {timeLeft === 0 && (
                  <button className="btn-timer done"><CheckCircle2 size={16} /> DONE</button>
                )}
              </div>
              
              <div className="power-break-container-inline" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <button 
                  className="btn-power-break"
                  style={{padding: '6px 12px', fontSize: '0.85rem', background: 'rgba(234, 179, 8, 0.1)', borderColor: '#eab308', color: '#eab308'}}
                  onClick={() => navigate('/leaderboard')}
                >
                  <Trophy size={14} style={{marginRight: '4px'}}/> RANKINGS
                </button>
                <button 
                  className={`btn-power-break ${showLimitWarning ? 'limit-warning' : ''}`}
                  style={{padding: '6px 12px', fontSize: '0.85rem'}}
                  onClick={handlePowerBreakClick}
                  disabled={timeLeft === 0}
                >
                  ⚡ POWER BREAK
                </button>
                <div className="pb-count">
                  {powerBreaksUsed} / 2
                </div>
              </div>
              {showLimitWarning && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', animation: 'fadeIn 0.3s' }}>
                  ⚠️ LIMIT REACHED
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DUAL PANELS */}
        <div className="hud-body">
          
          {/* LEFT: SQUAD ROSTER */}
          <div className="hud-panel left-panel">
            <div className="panel-title-bar">
              <Users size={18} /> SQUAD ROSTER
            </div>
            
            <div className="roster-list">
              {squadData.members.map((member) => (
                <div key={member.id} className={`roster-row ${member.isMe ? 'is-current-user' : ''}`}>
                  <div className={`avatar-ring ring-${member.color}`}>
                    {member.avatar}
                    <div className={`status-dot ${member.completedToday ? 'completed' : (timerActive ? 'active' : 'idle')}`}></div>
                  </div>
                  
                  <div className="roster-info">
                    <span className="roster-name">{member.name} {member.isMe && <span className="you-tag">YOU</span>}</span>
                    <span className="roster-class">{member.class} • Lvl {member.level}</span>
                  </div>

                  <div className="roster-stats">
                    <div className="stat-fire">
                      <Flame size={16} className={member.streak > 0 ? 'fire-on' : 'fire-off'} />
                      <span>{member.streak}</span>
                    </div>
                    <div className="stat-check">
                      {member.completedToday ? <CheckCircle2 size={18} className="icon-green" /> : <Circle size={18} className="icon-dim" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="panel-footer">
              <button className="btn-abort-mission" onClick={handleAbortMission}>
                Abort Mission
              </button>
              {!isComplete ? (
                <button 
                  className="btn-complete-epic" 
                  onClick={handleCompleteClick}
                  disabled={completionPercentage < 30}
                  style={{ opacity: completionPercentage < 30 ? 0.5 : 1, cursor: completionPercentage < 30 ? 'not-allowed' : 'pointer' }}
                >
                  <Zap size={20} className="zap-icon" /> COMPLETE MISSION
                </button>
              ) : (
                <div className="mission-done-badge">
                  <Award size={20} /> MISSION ACCOMPLISHED
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: COMMS (CHAT) */}
          <div className="hud-panel right-panel">
            <div className="panel-title-bar">
              <MessageSquare size={18} /> SQUAD COMMS
            </div>
            
            <div className="chat-log">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.type} ${msg.sender === (user?.username || 'You') ? 'mine' : ''}`}>
                  {msg.type !== 'sys' && msg.sender !== (user?.username || 'You') && (
                    <div className="msg-author">{msg.sender}</div>
                  )}
                  <div className="msg-content">{msg.text}</div>
                  <div className="msg-timestamp">{msg.time}</div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-msg system">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="quick-chat-container">
              <button className="btn-quick-chat" onClick={() => handleQuickChat('🔥 Let\'s go!')}>🔥 Let's go!</button>
              <button className="btn-quick-chat" onClick={() => handleQuickChat('⚡ Stay focused!')}>⚡ Stay focused!</button>
              <button className="btn-quick-chat" onClick={() => handleQuickChat('💪 Push harder!')}>💪 Push harder!</button>
              <button className="btn-quick-chat" onClick={() => handleQuickChat('🚀 Almost there!')}>🚀 Almost there!</button>
              <button className="btn-quick-chat" onClick={() => handleQuickChat('👍')}>👍</button>
            </div>

            <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Transmit signal..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()}><Send size={18} /></button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// MINI GAME COMPONENTS
// ==========================================

function RiddleGame({ onWin }) {
  const [riddle, setRiddle] = useState(null);
  
  useEffect(() => {
    setRiddle(RIDDLES[Math.floor(Math.random() * RIDDLES.length)]);
  }, []);

  if (!riddle) return null;

  return (
    <div className="mg-container">
      <h2 className="mg-title"><HelpCircle className="mg-icon"/> Riddle Challenge</h2>
      <p className="riddle-q">"{riddle.q}"</p>
      <div className="riddle-options">
        {riddle.options.map(opt => (
          <button 
            key={opt} 
            className="btn-riddle-opt"
            onClick={() => {
              if (opt === riddle.a) onWin();
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReactionGame({ onWin }) {
  const [color, setColor] = useState('red');
  const [clickedEarly, setClickedEarly] = useState(false);
  
  useEffect(() => {
    const delay = Math.floor(Math.random() * 2000) + 1000;
    const timer = setTimeout(() => setColor('green'), delay);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (color === 'green') {
      onWin();
    } else {
      setClickedEarly(true);
      setTimeout(() => setClickedEarly(false), 1000);
    }
  };

  return (
    <div className="mg-container">
      <h2 className="mg-title"><Zap className="mg-icon"/> Reaction Tap</h2>
      <p className="mg-desc">Wait for the signal...</p>
      <div 
        className={`reaction-arena ${color}`} 
        onClick={handleClick}
      >
        <span className="reaction-text">
          {clickedEarly ? 'TOO EARLY!' : (color === 'red' ? 'HOLD...' : 'TAP NOW!')}
        </span>
      </div>
    </div>
  );
}

function MemoryGame({ onWin }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    const symbols = ['alpha', 'beta', 'gamma'];
    const deck = [...symbols, ...symbols]
      .sort(() => 0.5 - Math.random())
      .map((s, i) => ({ id: i, symbol: s }));
    setCards(deck);
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      if (cards[flipped[0]].symbol === cards[flipped[1]].symbol) {
        setMatched([...matched, ...flipped]);
        if (matched.length + 2 === cards.length) {
          setTimeout(onWin, 500);
        }
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped, cards, matched, onWin]);

  const handleFlip = (i) => {
    if (flipped.length < 2 && !flipped.includes(i) && !matched.includes(i)) {
      setFlipped([...flipped, i]);
    }
  };

  return (
    <div className="mg-container">
      <h2 className="mg-title"><BrainCircuit className="mg-icon"/> Memory Match</h2>
      <div className="memory-grid">
        {cards.map((c, i) => (
          <div 
            key={c.id} 
            className={`memory-card ${flipped.includes(i) || matched.includes(i) ? 'flipped' : ''}`}
            onClick={() => handleFlip(i)}
          >
            <div className="mem-front">?</div>
            <div className="mem-back"><img src={`/symbols/${c.symbol}.png`} alt={c.symbol} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerHTML=c.symbol.toUpperCase()}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternGame({ onWin }) {
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePad, setActivePad] = useState(null);

  useEffect(() => {
    const seq = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
    setSequence(seq);
    
    // Play sequence
    setIsPlaying(true);
    let i = 0;
    const playNext = () => {
      if (i < seq.length) {
        setActivePad(seq[i]);
        setTimeout(() => {
          setActivePad(null);
          setTimeout(playNext, 300);
        }, 500);
        i++;
      } else {
        setIsPlaying(false);
      }
    };
    setTimeout(playNext, 1000);
  }, []);

  const handlePad = (idx) => {
    if (isPlaying) return;
    const newSeq = [...playerSeq, idx];
    setPlayerSeq(newSeq);
    
    if (sequence[newSeq.length - 1] !== idx) {
      // Failed - reset
      setPlayerSeq([]);
    } else if (newSeq.length === sequence.length) {
      onWin();
    }
  };

  return (
    <div className="mg-container">
      <h2 className="mg-title"><Crosshair className="mg-icon"/> Pattern Sequence</h2>
      <p className="mg-desc">{isPlaying ? 'Watch closely...' : 'Your turn!'}</p>
      <div className="pattern-grid">
        {[0,1,2,3].map(i => (
          <div 
            key={i} 
            className={`pattern-pad pad-${i} ${activePad === i ? 'active' : ''}`}
            onClick={() => handlePad(i)}
          ></div>
        ))}
      </div>
    </div>
  );
}
