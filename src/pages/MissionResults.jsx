import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Flame, Clock, Target, ArrowRight, ShieldAlert, Trophy } from 'lucide-react';
import './MissionResults.css';

export default function MissionResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const status = params.get('status') || 'complete';
  
  const isComplete = status === 'complete';
  const isPartial = status === 'partial';
  const isAborted = status === 'aborted';
  const ratio = parseFloat(params.get('ratio')) || 1.0;
  const noBreaks = params.get('noBreaks') === 'true';
  
  // If status is complete but activeQuest is missing, the whole quest is done!
  const [isFullQuestComplete, setIsFullQuestComplete] = useState(false);
  
  useEffect(() => {
    const active = localStorage.getItem('activeQuest');
    if ((isComplete || isPartial) && !active) {
      setIsFullQuestComplete(true);
    }
  }, [isComplete, isPartial]);
  
  const baseXP = isFullQuestComplete ? 100 : ((isComplete || isPartial) ? 30 : 10);
  const earnedBaseXP = isPartial ? Math.max(0, Math.floor(baseXP * ratio)) : baseXP;
  let bonusXP = isFullQuestComplete ? 50 : (isComplete ? 10 : 0);
  if (noBreaks && isComplete) {
    bonusXP += 5;
  }
  const totalXP = earnedBaseXP + bonusXP;
  
  const [xpCounter, setXpCounter] = useState(0);
  const [barWidth, setBarWidth] = useState(40); // Previous XP

  useEffect(() => {
    // Animate XP
    let start = 0;
    const duration = 1500;
    const interval = 30;
    const steps = duration / interval;
    const increment = totalXP / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= totalXP) {
        setXpCounter(totalXP);
        clearInterval(timer);
        // After XP counts up, fill the bar
        setTimeout(() => setBarWidth(40 + (totalXP/2)), 500); 
      } else {
        setXpCounter(Math.floor(start));
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [totalXP]);

  return (
    <div className={`results-screen ${isComplete ? 'theme-success' : 'theme-warn'}`}>
      <div className="results-bg"></div>
      
      <div className="results-content">
        <div className="results-header">
          {isFullQuestComplete ? (
            <h1 className="results-title title-glitch-green" style={{color: '#eab308'}}>QUEST COMPLETED 🏆</h1>
          ) : isComplete ? (
            <h1 className="results-title title-glitch-green">MISSION COMPLETE ⚔️</h1>
          ) : isPartial ? (
            <h1 className="results-title title-glitch-orange" style={{color: '#f97316'}}>MISSION COMPLETE (PARTIAL) ⚠️</h1>
          ) : (
            <h1 className="results-title title-glitch-red">MISSION ABORTED <ShieldAlert size={40} className="inline-icon" /></h1>
          )}
          <p className="results-subtitle">
            {isFullQuestComplete ? 'A legendary path comes to an end. Massive rewards granted.' 
            : isComplete ? 'Outstanding performance. Rewards registered.' 
            : isPartial ? 'Mission ended early. Rewards have been reduced.'
            : 'Extraction confirmed. Partial rewards recovered.'}
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card fade-up delay-1">
            <Zap size={32} className={`stat-icon ${isComplete ? 'text-green' : isPartial ? 'text-orange' : 'text-red'}`} />
            <div className="stat-info">
              <h3>XP EARNED</h3>
              <span className="stat-value">+{xpCounter} XP</span>
            </div>
          </div>

          <div className="stat-card fade-up delay-2">
            <Flame size={32} className={`stat-icon ${(isComplete || isPartial) ? 'text-orange' : 'text-gray'}`} />
            <div className="stat-info">
              <h3>STREAK STATUS</h3>
              <span className="stat-value">{(isComplete || isPartial) ? 'Day Maintained' : 'Streak Broken'}</span>
            </div>
          </div>

          <div className="stat-card fade-up delay-3">
            <Clock size={32} className="stat-icon text-blue" />
            <div className="stat-info">
              <h3>TIME LOGGED</h3>
              <span className="stat-value">{isComplete ? 'Full Session' : isPartial ? `~${Math.round(ratio * 100)}% Session` : 'Partial Session'}</span>
            </div>
          </div>

          <div className="stat-card fade-up delay-4">
            <Target size={32} className="stat-icon text-purple" />
            <div className="stat-info">
              <h3>MISSION TYPE</h3>
              <span className="stat-value">Discipline</span>
            </div>
          </div>
        </div>

        <div className="bonus-banner fade-up delay-5">
          {isFullQuestComplete ? (
            <span style={{color: '#eab308'}}><Trophy size={20} className="inline-zap" /> EPIC COMPLETION BONUS +{bonusXP} XP</span>
          ) : isComplete ? (
            <span style={{color: '#10b981'}}>
              <Flame size={20} className="inline-zap" /> PERFECT EXECUTION 🔥 +10 XP
              {noBreaks && <span style={{marginLeft: '15px', color: '#0ea5e9'}}>| DISCIPLINE BONUS 🔥 +5 XP</span>}
            </span>
          ) : isPartial ? (
            <span style={{color: '#f97316'}}><ShieldAlert size={20} className="inline-warn" /> PARTIAL COMPLETION: REWARDS REDUCED</span>
          ) : (
            <span><ShieldAlert size={20} className="inline-warn" /> MISSION ABORTED: MINIMAL REWARDS</span>
          )}
        </div>

        <div className="level-progress-container fade-up delay-6">
          <div className="level-labels">
            <span className="level-tag">LEVEL 4</span>
            <span className="level-status">{40 + totalXP} / 100 XP → LEVEL UP READY</span>
            <span className="level-tag">LEVEL 5</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${barWidth}%`, backgroundColor: isComplete ? '#10b981' : isPartial ? '#f97316' : '#ef4444' }}
            ></div>
          </div>
        </div>

        <div className="action-area fade-up delay-7">
          <button className="btn-continue" onClick={() => navigate(isFullQuestComplete ? '/quest-builder' : '/command-center')}>
            {isFullQuestComplete ? 'Start New Quest' : 'CONTINUE'} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
