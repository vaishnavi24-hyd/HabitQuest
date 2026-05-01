import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [toast, setToast] = useState(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in, unless currently logging in
  useEffect(() => {
    if (user && !isLoggingIn) {
      const activeMission = localStorage.getItem('activeQuest');
      if (activeMission) {
        navigate('/squad', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, isLoggingIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoading(true);
    setIsLoggingIn(true);
    try {
      await login(username, password);
      setToast({
        type: 'success',
        message: '⚡ Hero Logged In Successfully!',
        subtext: 'Your journey continues...'
      });
      setTimeout(() => {
        const activeMission = localStorage.getItem('activeQuest');
        if (activeMission) {
          navigate('/squad');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setToast({
        type: 'error',
        message: '❌ Access Denied, Hero',
        subtext: 'Invalid credentials. Try again.'
      });
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      {/* Animated Grid Background */}
      <div className="grid-background"></div>
      
      {/* Background Particles layer */}
      <div className="particles-layer">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`}></div>
        ))}
      </div>

      <div className="login-card-wrapper fade-in-up">
        {/* Glow Effects behind card */}
        <div className="card-glow card-glow-pink"></div>
        <div className="card-glow card-glow-purple"></div>

        <div className="login-card">
          <Link to="/" className="back-link">← Back</Link>
          
          <div className="login-header">
            <h1 className="login-title">WELCOME BACK, HERO</h1>
            <p className="login-subtitle">Your journey awaits. Continue your quest.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email / Username</label>
              <input 
                type="text" 
                placeholder="Enter your player name" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your secret key" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="forgot-password">
                <a href="#forgot">Forgot Password?</a>
              </div>
            </div>

            <button type="submit" className="btn-enter-game" disabled={isLoading}>
              {isLoading ? 'Entering Realm...' : '⚡ ENTER THE GAME'}
            </button>
          </form>

          <div className="social-login-section">
            <div className="divider">
              <span>or continue with</span>
            </div>
            
            <div className="social-buttons">
              <button className="btn-social">Google</button>
              <button className="btn-social">Apple</button>
              <button className="btn-social btn-discord">Discord</button>
            </div>
          </div>

          <div className="login-footer">
            <p>New here? <Link to="#signup" className="signup-link">Start your journey</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
