import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Moon, Shield, Sparkles, Rocket,
  Cpu, Hexagon, Crosshair, Terminal, Activity,
  EyeOff, Target, Wind,
  Flame, Crown, Flag, CloudLightning,
  Wand2, Hourglass, Hash, Eye,
  Star, Compass, Circle, Sun
} from 'lucide-react';
import './AvatarSelection.css';

const REALMS = [
  { id: 'cyber', name: 'CYBER TECH ⚡', desc: 'Advanced armor, intelligence, and innovation', colorClass: 'glow-cyber', icon: Zap },
  { id: 'shadow', name: 'SHADOW CITY 🖤', desc: 'Stealth, discipline, and silent strength', colorClass: 'glow-shadow', icon: Moon },
  { id: 'mythic', name: 'MYTHIC KINGDOM ⚔️', desc: 'Honor, power, and legendary warriors', colorClass: 'glow-mythic', icon: Shield },
  { id: 'mystic', name: 'MYSTIC FORCE 🌌', desc: 'Energy, wisdom, and supernatural mastery', colorClass: 'glow-mystic', icon: Sparkles },
  { id: 'galactic', name: 'GALACTIC WARRIORS 🚀', desc: 'Exploration, chaos, and cosmic power', colorClass: 'glow-galactic', icon: Rocket }
];

const HEROES = {
  cyber: [
    { id: 'c1', name: 'Tech Titan', subtext: 'Master of advanced armor', icon: Shield },
    { id: 'c2', name: 'Arc Commander', subtext: 'Leads with electric force', icon: Zap },
    { id: 'c3', name: 'Neon Guardian', subtext: 'Protects the cyber grid', icon: Hexagon },
    { id: 'c4', name: 'Quantum Soldier', subtext: 'Precision through dimensions', icon: Crosshair },
    { id: 'c5', name: 'Cyber Knight', subtext: 'Code is his weapon', icon: Terminal },
    { id: 'c6', name: 'Pulse Engineer', subtext: 'Maintains city lifeblood', icon: Activity }
  ],
  shadow: [
    { id: 's1', name: 'Night Vigilante', subtext: 'Unseen protector', icon: EyeOff },
    { id: 's2', name: 'Dark Sentinel', subtext: 'Watches from darkness', icon: Moon },
    { id: 's3', name: 'Silent Blade', subtext: 'Strikes without a sound', icon: Crosshair },
    { id: 's4', name: 'Shadow Hunter', subtext: 'Never loses the prey', icon: Target },
    { id: 's5', name: 'Phantom Ranger', subtext: 'Moves like a breeze', icon: Wind },
    { id: 's6', name: 'Ghost Enforcer', subtext: 'Underworld law enforcer', icon: Activity }
  ],
  mythic: [
    { id: 'm1', name: 'Lion Warrior', subtext: 'Fierce and unstoppable', icon: Flame },
    { id: 'm2', name: 'Arena Champion', subtext: 'Undefeated in combat', icon: Crown },
    { id: 'm3', name: 'Royal Guardian', subtext: 'Protects the throne', icon: Shield },
    { id: 'm4', name: 'Blade Emperor', subtext: 'Master of all weapons', icon: Crosshair },
    { id: 'm5', name: 'War General', subtext: 'Leads army to victory', icon: Flag },
    { id: 'm6', name: 'Storm Knight', subtext: 'Commands the tempest', icon: CloudLightning }
  ],
  mystic: [
    { id: 'my1', name: 'Arcane Master', subtext: 'Wields ancient magic', icon: Wand2 },
    { id: 'my2', name: 'Time Bender', subtext: 'Controls the flow of time', icon: Hourglass },
    { id: 'my3', name: 'Energy Sage', subtext: 'Channels raw power', icon: Sparkles },
    { id: 'my4', name: 'Rune Caster', subtext: 'Inscribes powerful spells', icon: Hash },
    { id: 'my5', name: 'Spirit Walker', subtext: 'Travels between realms', icon: Eye },
    { id: 'my6', name: 'Elemental Monk', subtext: 'Master of the elements', icon: Flame }
  ],
  galactic: [
    { id: 'g1', name: 'Star Raider', subtext: 'Plunders the cosmos', icon: Star },
    { id: 'g2', name: 'Cosmic Captain', subtext: 'Navigates the universe', icon: Compass },
    { id: 'g3', name: 'Void Ranger', subtext: 'Explores the unknown', icon: Moon },
    { id: 'g4', name: 'Astro Knight', subtext: 'Defends the galaxy', icon: Rocket },
    { id: 'g5', name: 'Nova Striker', subtext: 'Force of a supernova', icon: Sun },
    { id: 'g6', name: 'Orbit Commander', subtext: 'Controls planetary rings', icon: Circle }
  ]
};

export default function AvatarSelection() {
  const [step, setStep] = useState(1);
  const [selectedRealm, setSelectedRealm] = useState(null);
  const [selectedHero, setSelectedHero] = useState(null);
  const [heroName, setHeroName] = useState('');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (user?.avatar) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  const handleNextStep = () => {
    if (selectedRealm) {
      setStep(2);
    }
  };

  const handleBegin = () => {
    if (selectedHero && heroName) {
      const avatarData = {
        isLoggedIn: true,
        heroName: heroName.trim(),
        avatar: selectedHero.name, // The hero type
        level: 1,
        xp: 0
      };
      
      updateUser(avatarData);
      
      // Store flag for entry animation
      sessionStorage.setItem('justSelectedAvatar', 'true');
      
      navigate('/');
    }
  };

  return (
    <div className={`avatar-container bg-${selectedRealm ? selectedRealm.id : 'default'}`}>
      {/* Background Ambience */}
      <div className="ambience-overlay"></div>
      
      {/* Step 1: Realm Selection */}
      <div className={`step-container ${step === 1 ? 'active' : 'hidden-left'}`}>
        <div className="selection-header fade-in">
          <h1 className="epic-title glitch-text">CHOOSE YOUR REALM</h1>
          <p className="epic-subtitle">Every legend begins with a choice</p>
        </div>

        <div className="realm-grid">
          {REALMS.map((realm, index) => {
            const RealmIcon = realm.icon;
            return (
              <div 
                key={realm.id} 
                className={`realm-card ${realm.colorClass} ${selectedRealm?.id === realm.id ? 'selected' : ''} slide-up-delay-${index}`}
                onClick={() => setSelectedRealm(realm)}
              >
                <div className="realm-content">
                  <div className="realm-icon-wrapper">
                    <RealmIcon size={40} className="realm-icon" />
                  </div>
                  <h3 className="realm-name">{realm.name}</h3>
                  <p className="realm-desc">{realm.desc}</p>
                </div>
                {selectedRealm?.id === realm.id && <div className="selected-badge">SELECTED</div>}
              </div>
            );
          })}
        </div>

        <div className={`action-bar ${selectedRealm ? 'visible' : ''}`}>
          <button className="btn-epic-next" onClick={handleNextStep}>
            CONTINUE TO HERO ➔
          </button>
        </div>
      </div>

      {/* Step 2: Hero Selection */}
      <div className={`step-container ${step === 2 ? 'active' : 'hidden-right'}`}>
        <div className="selection-header fade-in">
          <button className="btn-back" onClick={() => setStep(1)}>← Change Realm</button>
          <h1 className="epic-title">SELECT YOUR HERO</h1>
          <p className="epic-subtitle">Your identity defines your journey</p>
        </div>

        {selectedRealm && (
          <div className="hero-grid fade-in-delay-1">
            {HEROES[selectedRealm.id].map((hero, index) => {
              const HeroIcon = hero.icon;
              return (
                <div 
                  key={hero.id} 
                  className={`hero-card ${selectedRealm.colorClass} ${selectedHero?.id === hero.id ? 'selected' : ''}`}
                  onClick={() => setSelectedHero(hero)}
                >
                  <div className="hero-icon-container">
                    <HeroIcon size={48} className="hero-vector-icon" />
                  </div>
                  <h3 className="hero-name">{hero.name}</h3>
                  <p className="hero-subtext">{hero.subtext}</p>
                  {selectedHero?.id === hero.id && <div className="selected-badge">SELECTED</div>}
                </div>
              );
            })}
          </div>
        )}

        <div className={`hero-details fade-in-delay-2 ${selectedHero ? 'visible' : ''}`}>
          <div className="name-input-group">
            <label>Hero Name</label>
            <input 
              type="text" 
              placeholder="Enter your legend name" 
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
            />
          </div>

          <button 
            className="btn-begin-adventure" 
            disabled={!selectedHero || !heroName.trim()}
            onClick={handleBegin}
          >
            🚀 BEGIN ADVENTURE
          </button>
        </div>
      </div>
    </div>
  );
}
