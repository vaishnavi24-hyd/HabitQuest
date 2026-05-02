const fs = require('fs');

let content = fs.readFileSync('src/pages/Squad.jsx', 'utf8');

// 1. Add states
const stateTarget = `  const [showAbortModal, setShowAbortModal] = useState(false);`;
const stateReplacement = `  const [showAbortModal, setShowAbortModal] = useState(false);
  const [showEarlyWarningModal, setShowEarlyWarningModal] = useState(false);
  const [earlyWarningData, setEarlyWarningData] = useState(null);`;

content = content.replace(stateTarget, stateReplacement);

// 2. Replace handleCompleteClick
const fnTarget = `  const handleCompleteClick = async () => {
    setIsProcessing(true);
    try {
      // Step 1 & 2: Async processing & calculate
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Save data
      executeCompletion();
      
      // Step 4: Success -> Navigate
      navigate('/command-center');
    } catch (error) {
      addSystemMessage('⚠️ Mission sync failed. Try again.');
      setIsProcessing(false);
    }
  };`;

const fnReplacement = `  const playWarningBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // Low warning buzz
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
  };

  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
  };

  const processCompletionAndNavigate = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      executeCompletion();
      navigate('/command-center');
    } catch (error) {
      addSystemMessage('⚠️ Mission sync failed. Try again.');
      setIsProcessing(false);
    }
  };

  const handleCompleteClick = () => {
    const elapsedTime = totalTime - timeLeft;
    const completionRatio = totalTime > 0 ? elapsedTime / totalTime : 0;
    
    if (completionRatio < 0.95) {
      setTimerActive(false); // Pause timer
      playWarningBeep();
      let earnedXP = completionRatio >= 0.50 ? 18 : 5;
      setEarlyWarningData({
         elapsedTime,
         earnedXP,
         ratio: completionRatio
      });
      setShowEarlyWarningModal(true);
    } else {
      playSuccessChime();
      processCompletionAndNavigate();
    }
  };

  const handleConfirmEarlyExit = () => {
    setShowEarlyWarningModal(false);
    processCompletionAndNavigate();
  };

  const handleCancelEarlyExit = () => {
    setShowEarlyWarningModal(false);
    setTimerActive(true); // Resume timer
  };`;

content = content.replace(fnTarget, fnReplacement);

// 3. Add the modal below abort modal
const modalTarget = `      {/* --- ABORT MODAL --- */}
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
      )}`;

const modalReplacement = modalTarget + `

      {/* --- EARLY EXIT GAMIFIED WARNING MODAL --- */}
      {showEarlyWarningModal && earlyWarningData && (
        <div className="abort-overlay" style={{zIndex: 300}}>
          <div className="abort-card" style={{ border: '1px solid #ef4444', boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)', animation: 'shake 0.4s ease-in-out' }}>
            <h1 className="abort-title text-glitch" style={{ color: '#ef4444', textShadow: '0 0 10px #ef4444' }}>⚠️ MISSION NOT COMPLETE</h1>
            <p className="abort-desc" style={{ color: '#fca5a5' }}>You are exiting early. Rewards will be reduced.</p>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '8px', margin: '20px 0', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <span style={{ color: '#94a3b8' }}>Time Completed:</span>
                 <strong style={{ color: '#fff' }}>{formatTime(earlyWarningData.elapsedTime)} / {formatTime(totalTime)} mins</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: '#94a3b8' }}>XP You'll Get:</span>
                 <strong style={{ color: '#f59e0b' }}>+{earlyWarningData.earnedXP} XP <span style={{fontSize: '0.8rem', opacity: 0.8}}>(reduced)</span></strong>
               </div>
            </div>

            <div className="abort-actions" style={{ flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-cancel-abort" 
                onClick={handleCancelEarlyExit}
                style={{ width: '100%', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold' }}
              >
                ⚡ Continue Mission
              </button>
              <button 
                className="btn-confirm-abort" 
                onClick={handleConfirmEarlyExit}
                style={{ width: '100%', padding: '12px', opacity: 0.8 }}
              >
                🚪 Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(modalTarget, modalReplacement);

fs.writeFileSync('src/pages/Squad.jsx', content);
console.log('Done rewriting Squad.jsx for early warning');
