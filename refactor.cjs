const fs = require('fs');
const file = 'src/pages/Squad.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove squadMomentum state
content = content.replace(/const \[squadMomentum, setSquadMomentum\] = useState\(50\);\n/g, '');

// 2. Remove showGroupVictoryModal & showIncompleteModal state, add resultModalData
content = content.replace(/const \[showIncompleteModal, setShowIncompleteModal\] = useState\(false\);\n/g, '');
content = content.replace(/const \[showGroupVictoryModal, setShowGroupVictoryModal\] = useState\(false\);\n/g, 'const [resultModalData, setResultModalData] = useState(null);\n');

// 3. Remove Momentum Calculation in useEffect
const momentumStart = content.indexOf('// Momentum Calculation');
if (momentumStart > -1) {
  const momentumEnd = content.indexOf('}, 5000);', momentumStart);
  if (momentumEnd > -1) {
    content = content.substring(0, momentumStart) + content.substring(momentumEnd);
  }
}

// 4. Remove MOMENTUM BAR UI
const barStart = content.indexOf('{/* --- MOMENTUM BAR --- */}');
if (barStart > -1) {
  const barEnd = content.indexOf('{/* DUAL PANELS */}');
  if (barEnd > -1) {
    content = content.substring(0, barStart) + content.substring(barEnd);
  }
}

// 5. Replace handleCompleteClick through executeCompletion to handleProceedToResults
const handleCompleteClickStart = content.indexOf('const handleCompleteClick = () => {');
const handleAbortMissionStart = content.indexOf('const handleAbortMission = () => {');

const newCompleteLogic = `const handleCompleteClick = () => {
    executeCompletion();
  };

  const executeCompletion = () => {
    setTimerActive(false);
    setIsFocusMode(false);
    
    // XP rules
    const elapsedTime = totalTime - timeLeft;
    const completionRatio = totalTime > 0 ? elapsedTime / totalTime : 0;
    
    let resultType = '';
    let title = '';
    let message = '';
    let earnedXP = 0;

    if (completionRatio >= 0.95) {
      resultType = 'legendary';
      title = 'LEGENDARY COMPLETION!';
      message = 'Outstanding focus! Full reward unlocked.';
      earnedXP = 30;
    } else if (completionRatio >= 0.50) {
      resultType = 'good';
      title = 'GOOD EFFORT!';
      message = 'Mission extracted partially. Keep pushing!';
      earnedXP = 18;
    } else {
      resultType = 'aborted';
      title = 'MISSION ABORTED EARLY';
      message = 'You left before making significant progress.';
      earnedXP = 5;
    }

    setResultModalData({ type: resultType, title, message, xp: earnedXP });

    setSquadData(prev => {
      const updatedMembers = prev.members.map(m => {
        if (m.isMe) {
          return { ...m, completedToday: true, streak: m.streak + (resultType === 'legendary' ? 1 : 0), status: 'completed', progress: 100 };
        }
        return m;
      });
      return { ...prev, members: updatedMembers };
    });

    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active) {
      if (resultType === 'legendary') active.currentDayProgress += 1;
      
      if (active.currentDayProgress >= active.totalDays) {
         active.status = 'completed';
         localStorage.removeItem('activeQuest');
      } else {
         localStorage.setItem('activeQuest', JSON.stringify(active));
      }
      
      const existingQuests = JSON.parse(localStorage.getItem('habitQuests') || '[]');
      const updatedQuests = existingQuests.map(q => q.id === active.id ? active : q);
      localStorage.setItem('habitQuests', JSON.stringify(updatedQuests));
    }

    const analytics = JSON.parse(localStorage.getItem('userAnalytics') || '{"xpToday":0,"focusTime":0,"missions":0,"streak":0}');
    analytics.xpToday += earnedXP;
    analytics.focusTime += Math.floor(elapsedTime / 60);
    analytics.missions += 1;
    analytics.streak = active ? active.currentDayProgress : (analytics.streak + 1);
    localStorage.setItem('userAnalytics', JSON.stringify(analytics));
  };

  `;

if (handleCompleteClickStart > -1 && handleAbortMissionStart > -1) {
  content = content.substring(0, handleCompleteClickStart) + newCompleteLogic + content.substring(handleAbortMissionStart);
}

// 6. Update COMPLETE MISSION button and add hint
const completeBtnRegex = /<button[\s\S]*?className="btn-complete-epic"[\s\S]*?<\/button>/;
const newCompleteBtn = `<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                  <button 
                    className="btn-complete-epic" 
                    onClick={handleCompleteClick}
                    disabled={totalTime - timeLeft < 5}
                    style={{ opacity: totalTime - timeLeft < 5 ? 0.5 : 1, cursor: totalTime - timeLeft < 5 ? 'not-allowed' : 'pointer' }}
                  >
                    <Zap size={20} className="zap-icon" /> COMPLETE MISSION
                  </button>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1', opacity: 0.8}}>Finish full session for max XP</span>
                </div>`;
content = content.replace(completeBtnRegex, newCompleteBtn);

// 7. Replace INCOMPLETE & GROUP VICTORY Modals with RESULT MODAL
const incompleteModalStart = content.indexOf('{/* --- INCOMPLETE MODAL --- */}');
const iceBreakerModalStart = content.indexOf('{/* --- ICE Breaker Modal (FULL SCREEN) --- */}'); // Might have typo, let's just find ICE BREAKER MODAL
const realIceBreakerModalStart = content.indexOf('{/* --- ICE BREAKER MODAL (FULL SCREEN) --- */}');

const newResultModal = `{/* --- RESULT MODAL --- */}
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
            
            <button className="btn-launch-quest" style={{marginTop: '20px', width: '100%'}} onClick={() => navigate('/command-center')}>
              CONTINUE TO COMMAND CENTER <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      `;

if (incompleteModalStart > -1 && realIceBreakerModalStart > -1) {
  content = content.substring(0, incompleteModalStart) + newResultModal + content.substring(realIceBreakerModalStart);
}

fs.writeFileSync(file, content);
console.log('Done refactoring');
