import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Settings, Shield, Zap, Hexagon, Crosshair, Terminal, 
  Activity, EyeOff, Moon, Target, Wind, Flame, Crown, Flag, LayoutDashboard, 
  CloudLightning, Wand2, Hourglass, Hash, Eye, Star, Compass, 
  Circle, Sun, Sparkles, Rocket, Trophy
} from 'lucide-react';
import './TopNav.css';

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

export default function TopNav() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [hasActiveQuest, setHasActiveQuest] = useState(false);

  useEffect(() => {
    const checkActive = () => {
      setHasActiveQuest(!!localStorage.getItem('activeQuest'));
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
    navigate('/');
  };

  const renderAvatarIcon = () => {
    if (!user || !user.avatar) return <User size={20} />;
    const IconComponent = ICON_MAP[user.avatar] || User;
    return <IconComponent size={20} />;
  };

  return (
    <header className="top-navbar">
      <div className="navbar-logo">
        <span className="logo-text">HABIT<span className="logo-accent">QUEST</span></span>
      </div>

      <div className="navbar-actions">
        {user?.isLoggedIn ? (
          <div className="profile-container">
            <div 
              className="profile-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="profile-info">
                <span className="hero-name-display">{user?.heroName || 'Hero'}</span>
                <span className="hero-class-display">Lvl {user?.level || 1} {user?.avatar ? `[${user.avatar}]` : '[Hero]'}</span>
              </div>
              <div className={`avatar-wrapper level-1-glow glow-cyber`}>
                <div className="avatar-circle">
                  {renderAvatarIcon()}
                </div>
              </div>
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown fade-in">
                <div className="dropdown-header">
                  <h4>{user?.heroName || 'Hero'}</h4>
                  <span className="level-badge">Lvl {user?.level || 1} {user?.avatar ? `[${user.avatar}]` : '[Hero]'}</span>
                </div>
                <div className="dropdown-menu">
                  {!hasActiveQuest && (
                    <Link to="/start-adventure" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={16} /> Start Adventure
                    </Link>
                  )}
                  <Link to="/leaderboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Trophy size={16} /> Leaderboard
                  </Link>
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/avatar');
                    }}
                  >
                    <Settings size={16} /> Change Hero
                  </button>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-auth-group">
            <Link to="/login" className="btn-neon-outline">Login</Link>
            <Link to="/register" className="btn-neon-outline">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
}
