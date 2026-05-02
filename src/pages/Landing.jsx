import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { 
  Shield, Zap, Hexagon, Crosshair, Terminal, Activity, EyeOff, Moon, 
  Target, Wind, Flame, Crown, Flag, CloudLightning, Wand2, Hourglass, 
  Hash, Eye, Star, Compass, Circle, Sun, Sparkles, Rocket 
} from 'lucide-react';
import './Landing.css';

const ICON_MAP = {
  'Tech Titan': Shield,
  'Arc Commander': Zap,
  'Neon Guardian': Hexagon,
  'Quantum Soldier': Crosshair,
  'Cyber Knight': Terminal,
  'Pulse Engineer': Activity,
  'Night Vigilante': EyeOff,
  'Dark Sentinel': Moon,
  'Silent Blade': Crosshair,
  'Shadow Hunter': Target,
  'Phantom Ranger': Wind,
  'Ghost Enforcer': Activity,
  'Lion Warrior': Flame,
  'Arena Champion': Crown,
  'Royal Guardian': Shield,
  'Blade Emperor': Crosshair,
  'War General': Flag,
  'Storm Knight': CloudLightning,
  'Arcane Master': Wand2,
  'Time Bender': Hourglass,
  'Energy Sage': Sparkles,
  'Rune Caster': Hash,
  'Spirit Walker': Eye,
  'Elemental Monk': Flame,
  'Star Raider': Star,
  'Cosmic Captain': Compass,
  'Void Ranger': Moon,
  'Astro Knight': Rocket,
  'Nova Striker': Sun,
  'Orbit Commander': Circle
};

export default function Landing() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [hasActiveQuest, setHasActiveQuest] = useState(false);
  const [missionInProgress, setMissionInProgress] = useState(false);

  useEffect(() => {
    const checkActive = () => {
      const active = JSON.parse(localStorage.getItem('activeQuest'));
      if (active) {
         setHasActiveQuest(true);
         setMissionInProgress(active.missionStatus === 'in_progress' || active.missionStatus === 'paused');
      } else {
         setHasActiveQuest(false);
         setMissionInProgress(false);
      }
    };
    checkActive();
    window.addEventListener('storage', checkActive);
    const interval = setInterval(checkActive, 1000);
    return () => {
      window.removeEventListener('storage', checkActive);
      clearInterval(interval);
    };
  }, []);


  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const renderAvatarIcon = () => {
    if (!user || !user.avatar) return <User size={20} />;
    const IconComponent = ICON_MAP[user.avatar] || User;
    return <IconComponent size={20} />;
  };
  return (
    <div className="landing-container">
      {/* Background Particles layer */}
      <div className="particles-layer">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`}></div>
        ))}
      </div>

      {/* Navigation */}
      <header className="landing-header">
        <div className="logo-text">HabitQuest</div>
        <nav className="top-nav">
          {!user?.isLoggedIn ? (
            <div className="nav-auth-group">
              <Link to="/login" className="btn-neon-outline">Login</Link>
              <Link to="/register" className="btn-neon-outline">Sign Up</Link>
            </div>
          ) : (
            <div className="profile-container" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="profile-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className="hero-name-display" style={{ fontWeight: 'bold', color: 'white', fontSize: '0.95rem' }}>{user?.heroName || 'Hero'}</span>
                  <span className="hero-class-display" style={{ color: 'var(--accent-blue)', fontSize: '0.75rem' }}>Lvl {user?.level || 1} {user?.avatar ? `[${user.avatar}]` : '[Hero]'}</span>
                </div>
                <div className={`avatar-wrapper level-1-glow glow-cyber`} style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', border: '2px solid rgba(255,255,255,0.2)' }}>
                  {renderAvatarIcon()}
                </div>
              </div>

              {dropdownOpen && (
                <div className="profile-dropdown fade-in" style={{ position: 'absolute', top: '100%', right: '0', width: '220px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139, 92, 246, 0.5)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)', borderRadius: '12px', overflow: 'hidden', zIndex: 9999, marginTop: '10px' }}>
                  <div className="dropdown-menu" style={{ display: 'flex', flexDirection: 'column' }}>
                    {!missionInProgress ? (
                      <Link to="/quest-builder" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }}>
                        <LayoutDashboard size={16} /> Start Adventure
                      </Link>
                    ) : (
                      <Link to="/mission" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#10b981', textDecoration: 'none', transition: 'background 0.2s' }}>
                        <Zap size={16} /> Continue Mission
                      </Link>
                    )}
                    <button className="dropdown-item logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-headline">LEVEL UP<br />YOUR LIFE</h1>
          <p className="hero-subtext">
            Turn your daily habits into epic quests. Build streaks, earn XP, and become your best self.
          </p>
          <div className="cta-group">
            <Link to={user?.isLoggedIn ? (missionInProgress ? "/mission" : "/quest-builder") : "/register"} className="cta-primary">
              {hasActiveQuest ? "⚡ Continue Mission" : "🚀 Start Adventure"}
            </Link>
            <Link to="/leaderboard" className="cta-secondary">🏆 Leaderboard</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="glow-circle glow-pink"></div>
          <div className="glow-circle glow-purple"></div>
          <div className="glow-circle glow-orange"></div>
          <img src="/hero.png" alt="Futuristic Hero" className="hero-image" />
        </div>
      </main>
      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-header">
          <h2 className="section-title">WHY HABITQUEST?</h2>
          <p className="section-subtitle">Turn discipline into a game and unlock your full potential</p>
        </div>
        
        <div className="features-grid">
          {[
            { icon: '⚔️', title: 'EPIC QUESTS', text: 'Transform daily habits into exciting missions', glow: 'glow-purple-card' },
            { icon: '⚡', title: 'LEVEL UP', text: 'Earn XP and unlock new levels', glow: 'glow-blue-card' },
            { icon: '🔥', title: 'BUILD STREAKS', text: 'Maintain your streak and grow your power', glow: 'glow-orange-card' },
            { icon: '🧑‍🤝‍🧑', title: 'GUILD SYSTEM', text: 'Team up with others and stay accountable', glow: 'glow-pink-card' },
            { icon: '🏆', title: 'ACHIEVEMENTS', text: 'Unlock rewards and showcase your progress', glow: 'glow-gold-card' },
            { icon: '🎮', title: 'GAME EXPERIENCE', text: "Feel like you're playing, not tracking", glow: 'glow-green-card' },
          ].map((feature, index) => (
            <div key={index} className={`feature-card fade-in-delay-${index} ${feature.glow}`}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-text">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="features-header">
          <h2 className="section-title">HOW IT WORKS</h2>
          <p className="section-subtitle">Your journey from zero to legendary</p>
        </div>

        <div className="steps-container">
          {[
            { icon: '⚔️', title: 'CHOOSE YOUR QUESTS', text: 'Pick habits you want to build and turn them into missions', delay: 0 },
            { icon: '✅', title: 'COMPLETE QUESTS', text: 'Finish your daily missions and stay consistent', delay: 1 },
            { icon: '⚡', title: 'EARN XP & REWARDS', text: 'Gain XP, coins, and power-ups for progress', delay: 2 },
            { icon: '🏆', title: 'LEVEL UP', text: 'Unlock new levels, avatars, and achievements', delay: 3 },
          ].map((step, index) => (
            <div key={index} className={`step-card fade-in-delay-${step.delay}`}>
              <div className="step-glow-backdrop"></div>
              <div className="step-content">
                <div className="step-number">0{index + 1}</div>
                <div className="step-icon pulse-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-text">{step.text}</p>
              </div>
              {index < 3 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta-section">
        <h3 className="bottom-cta-text">Your adventure is waiting...</h3>
        <Link to={user?.isLoggedIn ? (missionInProgress ? "/mission" : "/quest-builder") : "/register"} className="cta-primary pulse-animation">
          {hasActiveQuest ? "⚡ Continue Mission" : "🚀 Start Adventure"}
        </Link>
      </section>
    </div>
  );
}
