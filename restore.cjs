const fs = require('fs');
let content = fs.readFileSync('src/pages/Squad.jsx', 'utf8');

const brokenStart = content.indexOf('<div className="abort-actions">');
const brokenEnd = content.indexOf('{/* RIGHT: COMMS (CHAT) */}');

const restoredSegment = `<div className="abort-actions">
              <button className="btn-confirm-abort" onClick={confirmAbort}>Abort Mission</button>
              <button className="btn-cancel-abort" onClick={cancelAbort}>Continue Mission</button>
            </div>
          </div>
        </div>
      )}

      {/* --- RESULT MODAL --- */}
      {resultModalData && (
        <div className="abort-overlay" style={{zIndex: 200}}>
          <div className="victory-card">
            <h1 className={\`victory-title \${resultModalData.type === 'legendary' ? 'text-glitch' : ''}\`} style={resultModalData.type === 'legendary' ? {color: '#f59e0b', textShadow: '0 0 20px #f59e0b'} : {color: '#cbd5e1'}}>
              {resultModalData.type === 'legendary' && '🏆 '}
              {resultModalData.type === 'good' && '⚡ '}
              {resultModalData.type === 'aborted' && '⚠️ '}
              {resultModalData.title}
            </h1>
            <p className="victory-desc">{resultModalData.message}</p>
            
            <div className="victory-stats" style={{ justifyContent: 'center', margin: '20px 0' }}>
              <div className="v-stat" style={{ padding: '15px 30px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '5px' }}>XP Earned</span>
                <strong style={{ color: '#10b981', fontSize: '1.8rem', textShadow: resultModalData.type === 'legendary' ? '0 0 15px rgba(16, 185, 129, 0.6)' : 'none' }}>+{resultModalData.xp} XP</strong>
              </div>
            </div>
            
            <button className="btn-launch-quest" style={{marginTop: '20px', width: '100%'}} onClick={() => window.location.href = '/command-center'}>
              CONTINUE TO COMMAND CENTER
            </button>
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
                      className={\`minigame-neon-card glow-\${game.color}\`}
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
                <div className="sp-bar-fill" style={{ width: \`\${completionPercentage}%\` }}></div>
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
                  className={\`btn-power-break \${showLimitWarning ? 'limit-warning' : ''}\`}
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
              {squadData.members.map((member) => {
                const prog = member.isMe ? completionPercentage : Math.round(member.progress || 0);
                const isMemberCompleted = member.status === 'completed' || member.completedToday;
                const isMemberPaused = member.status === 'paused';
                const isMemberAborted = member.status === 'aborted';
                
                let statusIcon = <Circle size={18} className="icon-dim" />;
                let statusText = 'Idle';
                let statusColor = '#64748b';
                
                if (isMemberCompleted) {
                   statusIcon = <CheckCircle2 size={18} className="icon-green" />;
                   statusText = '✅ Completed';
                   statusColor = '#10b981';
                } else if (isMemberAborted) {
                   statusIcon = <Crosshair size={18} style={{color: '#ef4444'}} />;
                   statusText = '❌ Aborted';
                   statusColor = '#ef4444';
                } else if (isMemberPaused) {
                   statusIcon = <Pause size={18} style={{color: '#f59e0b'}} />;
                   statusText = '⏸ On Break';
                   statusColor = '#f59e0b';
                } else if (member.status === 'active') {
                   statusIcon = <Activity size={18} style={{color: '#0ea5e9'}} className="pulse-icon" />;
                   statusText = '🟢 In Mission';
                   statusColor = '#0ea5e9';
                }

                return (
                  <div key={member.id} className={\`roster-row \${member.isMe ? 'is-current-user' : ''}\`}>
                    <div className={\`avatar-ring ring-\${member.color}\`}>
                      {member.avatar}
                      <div className="status-dot" style={{ backgroundColor: statusColor, boxShadow: \`0 0 8px \${statusColor}\` }}></div>
                    </div>
                    
                    <div className="roster-info">
                      <span className="roster-name">
                        {member.name} {member.isMe && <span className="you-tag">YOU</span>}
                        {member.isLate && <span className="late-tag">Joined Late</span>}
                      </span>
                      <span className="roster-status" style={{color: statusColor, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'}}>
                        {statusText} • Lvl {member.level}
                      </span>
                      
                      {/* Live Progress Bar for Member */}
                      <div className="member-prog-wrap" style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px'}}>
                         <div style={{flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden'}}>
                            <div style={{width: \`\${prog}%\`, height: '100%', background: statusColor, transition: 'width 1s ease'}}></div>
                         </div>
                         <span style={{fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, minWidth: '30px'}}>{prog}%</span>
                      </div>
                    </div>

                    <div className="roster-stats">
                      <div className="stat-fire">
                        <Flame size={16} className={member.streak > 0 ? 'fire-on' : 'fire-off'} />
                        <span>{member.streak}</span>
                      </div>
                      <div className="stat-check" style={{marginLeft: '10px'}}>
                        {statusIcon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="panel-footer">
              <button className="btn-abort-mission" onClick={handleAbortMission}>
                Abort Mission
              </button>
              {!isComplete ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                  <button 
                    className="btn-complete-epic" 
                    onClick={handleCompleteClick}
                    disabled={totalTime - timeLeft < 5}
                    style={{ opacity: totalTime - timeLeft < 5 ? 0.5 : 1, cursor: totalTime - timeLeft < 5 ? 'not-allowed' : 'pointer' }}
                  >
                    <Zap size={20} className="zap-icon" /> COMPLETE MISSION
                  </button>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1', opacity: 0.8}}>Finish full session for max XP</span>
                </div>
              ) : (
                <div className="mission-done-badge">
                  <Award size={20} /> MISSION ACCOMPLISHED
                </div>
              )}
            </div>
          </div>

          `;

if (brokenStart > -1 && brokenEnd > -1) {
  content = content.substring(0, brokenStart) + restoredSegment + content.substring(brokenEnd);
  fs.writeFileSync('src/pages/Squad.jsx', content);
  console.log('Restored left panel successfully!');
} else {
  console.log('Could not find boundaries.');
}
