import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Dumbbell, Sparkles, ShieldAlert, Target, Clock, Zap, Flame, Check, Rocket, ArrowLeft, ChevronRight } from 'lucide-react';
import './QuestBuilder.css';

const CATEGORIES = [
  { id: 'mind', label: 'Mind', icon: Brain, description: 'Focus, Study, Learning', color: 'blue' },
  { id: 'body', label: 'Body', icon: Dumbbell, description: 'Workout, Fitness', color: 'orange' },
  { id: 'soul', label: 'Soul', icon: Sparkles, description: 'Meditation, Calm', color: 'purple' },
  { id: 'discipline', label: 'Discipline', icon: ShieldAlert, description: 'No distractions', color: 'green' },
  { id: 'custom', label: 'Custom', icon: Target, description: 'Forge your own path', color: 'pink' }
];

const MOTIVATIONS = [
  'Become stronger',
  'Improve focus',
  'Build discipline',
  'Reduce distractions',
  'Custom'
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', xp: 10, icon: Zap, color: 'green' },
  { id: 'medium', label: 'Medium', xp: 20, icon: Zap, color: 'orange' },
  { id: 'hard', label: 'Hard', xp: 40, icon: Zap, color: 'red' }
];

const TIME_OPTIONS = ['15 min', '30 min', '60 min', 'Custom'];
const STREAK_OPTIONS = [3, 7, 14, 30];

export default function QuestBuilder() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [animatingStep, setAnimatingStep] = useState(false);
  
  // Form State
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [motivations, setMotivations] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState('15 min');
  const [frequency, setFrequency] = useState('daily');
  const [streakTarget, setStreakTarget] = useState(7);
  
  // Active Quest Lock
  const [hasActiveQuest, setHasActiveQuest] = useState(false);
  
  useEffect(() => {
    const active = JSON.parse(localStorage.getItem('activeQuest'));
    if (active && active.status === 'active') {
      setHasActiveQuest(true);
      navigate('/command-center', { replace: true });
    }
  }, [navigate]);
  
  // XP Calculation
  const selectedDifficultyData = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[1];
  const streakBonus = Math.floor(selectedDifficultyData.xp * 0.5 * (streakTarget / 7));
  const totalXp = selectedDifficultyData.xp + streakBonus;

  const handleCategorySelect = (id) => {
    setCategory(id);
    goToStep(2);
  };

  const goToStep = (stepNumber) => {
    setAnimatingStep(true);
    setTimeout(() => {
      setActiveStep(stepNumber);
      setAnimatingStep(false);
    }, 400);
  };

  const handleBack = () => {
    if (activeStep > 1) {
      goToStep(activeStep - 1);
    }
  };

  const toggleMotivation = (mot) => {
    if (motivations.includes(mot)) {
      setMotivations(motivations.filter(m => m !== mot));
    } else {
      setMotivations([...motivations, mot]);
    }
  };

  const handleSaveQuest = (e) => {
    const btn = e.currentTarget;
    btn.classList.add('burst-click');
    
    setTimeout(() => {
      if (!name || !category) {
        alert("Please enter a name for your quest!");
        btn.classList.remove('burst-click');
        return;
      }

      const newQuest = {
        id: Date.now(),
        name,
        category,
        difficulty,
        duration,
        frequency,
        reason: motivations,
        totalDays: streakTarget,
        currentDayProgress: 0,
        status: 'active',
        xpReward: selectedDifficultyData.xp,
        createdAt: new Date().toISOString()
      };

      // Set as active quest globally
      localStorage.setItem('activeQuest', JSON.stringify(newQuest));
      
      // Also add to history/all quests
      const existingQuests = JSON.parse(localStorage.getItem('habitQuests') || '[]');
      localStorage.setItem('habitQuests', JSON.stringify([...existingQuests, newQuest]));
      
      navigate('/matchmaking');
    }, 600);
  };

  return (
    <div className="quest-builder-screen">
      <div className="ambient-background">
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
      </div>

      <div className="wizard-container">
        {/* HEADER */}
        <header className="quest-header">
          {activeStep > 1 && !hasActiveQuest && (
            <button className="btn-back-absolute" onClick={handleBack}>
              <ArrowLeft size={24} />
            </button>
          )}
          {hasActiveQuest ? (
            <h1 className="quest-title glitch-glow">MISSION LOCKED</h1>
          ) : (
            <h1 className="quest-title glitch-glow">INITIATE YOUR QUEST</h1>
          )}
          <p className="quest-subtitle">
            {hasActiveQuest ? 'Complete your current mission first.' : 'Every habit is a mission. Define yours.'}
          </p>
        </header>

        {hasActiveQuest ? (
          <div className="lockout-panel">
            <ShieldAlert size={80} className="lock-icon" />
            <h2>🔒 Mission in Progress</h2>
            <p>You must complete your current quest before starting a new one.</p>
            <button className="btn-continue" style={{marginTop: '30px'}} onClick={() => navigate('/command-center')}>
              Return to Command Center
            </button>
          </div>
        ) : (
        <div className={`step-content-area ${animatingStep ? 'fade-out' : 'fade-in'}`}>
          
          {/* STEP 1: CATEGORY */}
          {activeStep === 1 && (
            <div className="step-panel step-1">
              <div className="category-grid-centered">
                {CATEGORIES.map((cat, index) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <div 
                      key={cat.id} 
                      className={`cat-card card-${cat.color} ${isSelected ? 'cat-selected' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <div className="card-inner">
                        <div className="icon-ring">
                          <Icon size={40} className="glow-icon" />
                        </div>
                        <h3 className="cat-name">{cat.label}</h3>
                        
                        {isSelected && (
                          <div className="selected-badge">
                            <Check size={14} /> SELECTED
                          </div>
                        )}
                        <div className="energy-ring"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: QUEST DETAILS */}
          {activeStep === 2 && (
            <div className="step-panel step-2">
              <div className="centered-form">
                
                {/* Name */}
                <div className="form-group">
                  <h2 className="form-label">Name Your Mission</h2>
                  <div className="input-glow-box">
                    <Target className="input-icon" size={24} />
                    <input 
                      type="text" 
                      className="neon-input" 
                      placeholder="e.g. Deep Work Session"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Motivation */}
                <div className="form-group">
                  <h2 className="form-label">Select Motivation</h2>
                  <div className="pills-center-container">
                    {MOTIVATIONS.map(mot => {
                      const isActive = motivations.includes(mot);
                      return (
                        <button 
                          key={mot}
                          className={`neon-pill ${isActive ? 'pill-active' : ''}`}
                          onClick={() => toggleMotivation(mot)}
                        >
                          {mot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="form-group">
                  <h2 className="form-label">Difficulty</h2>
                  <div className="diff-cards-center">
                    {DIFFICULTIES.map(diff => {
                      const isActive = difficulty === diff.id;
                      return (
                        <div 
                          key={diff.id}
                          className={`diff-card diff-${diff.color} ${isActive ? 'diff-active' : ''}`}
                          onClick={() => setDifficulty(diff.id)}
                        >
                          <h3 className="diff-name">{diff.label}</h3>
                          <div className="diff-xp">
                            <diff.icon size={16} /> +{diff.xp} XP
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button className="btn-continue" onClick={() => goToStep(3)}>
                  CONTINUE <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TIME + STREAK */}
          {activeStep === 3 && (
            <div className="step-panel step-3">
              <div className="centered-form">
                
                {/* Time & Frequency */}
                <div className="form-group">
                  <h2 className="form-label">Time & Frequency</h2>
                  
                  <div className="neon-toggle">
                    <button 
                      className={`toggle-side ${frequency === 'daily' ? 'active' : ''}`}
                      onClick={() => setFrequency('daily')}
                    >DAILY</button>
                    <button 
                      className={`toggle-side ${frequency === 'weekly' ? 'active' : ''}`}
                      onClick={() => setFrequency('weekly')}
                    >WEEKLY</button>
                  </div>

                  <div className="time-cards-center">
                    {TIME_OPTIONS.map(time => (
                      <button 
                        key={time}
                        className={`time-card ${duration === time ? 'time-active' : ''}`}
                        onClick={() => setDuration(time)}
                      >
                        <Clock size={18} />
                        <span>{time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Streak Goal */}
                <div className="form-group" style={{ marginTop: '30px' }}>
                  <h2 className="form-label">Streak Goal</h2>
                  <div className="streak-badges-center">
                    {STREAK_OPTIONS.map(days => (
                      <button 
                        key={days}
                        className={`streak-badge ${streakTarget === days ? 'streak-active' : ''}`}
                        onClick={() => setStreakTarget(days)}
                      >
                        <Flame size={24} className="flame-icon" />
                        <span className="streak-days">{days} Days</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn-continue" onClick={() => goToStep(4)}>
                  CONTINUE <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REWARD PREVIEW & FINAL CTA */}
          {activeStep === 4 && (
            <div className="step-panel step-4">
              <div className="reward-arena">
                <div className="xp-orb-container">
                  <div className="xp-orb">
                    <div className="orb-core"></div>
                    <div className="orb-ring ring-1"></div>
                    <div className="orb-ring ring-2"></div>
                    <div className="orb-content">
                      <Zap size={40} className="orb-icon" />
                      <span className="orb-number">+{totalXp}</span>
                      <span className="orb-label">XP</span>
                    </div>
                  </div>
                </div>
                
                <h2 className="reward-text">You will gain <span className="text-glow">+{totalXp} XP</span> upon completion</h2>
                <p className="reward-subtext">Base: {selectedDifficultyData.xp} XP | Streak Bonus: {streakBonus} XP</p>

                <div className="final-cta-container">
                  <button className="btn-start-epic" onClick={handleSaveQuest}>
                    <Rocket size={24} className="btn-icon" />
                    <span>START QUEST</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        )}
      </div>
    </div>
  );
}
