import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import './Register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [toast, setToast] = useState(null);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in, unless we are currently registering
  useEffect(() => {
    if (user && !isRegistering) {
      navigate('/', { replace: true });
    }
  }, [user, navigate, isRegistering]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    if (password !== confirmPassword) {
      setToast({
        type: 'error',
        message: '⚠️ Summoning Failed',
        subtext: 'Your secure keys do not match.'
      });
      return;
    }
    
    setIsLoading(true);
    setIsRegistering(true);
    try {
      await register(username, email, password);
      setToast({
        type: 'success',
        message: '🔥 Hero Registered Successfully!',
        subtext: 'Your legend begins now...'
      });
      setTimeout(() => {
        navigate('/avatar');
      }, 1500);
    } catch (err) {
      setToast({
        type: 'error',
        message: '⚠️ Summoning Failed',
        subtext: 'Something went wrong. Retry.'
      });
      setIsLoading(false);
      setIsRegistering(false);
    }
  };

  return (
    <div className="register-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      {/* Animated Grid Background */}
      <div className="register-grid-background"></div>
      
      {/* Background Particles layer */}
      <div className="particles-layer">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`}></div>
        ))}
      </div>

      <div className="register-card-wrapper fade-in-up">
        {/* Glow Effects behind card */}
        <div className="register-glow register-glow-orange"></div>
        <div className="register-glow register-glow-blue"></div>

        <div className="register-card">
          <Link to="/" className="back-link">← Retreat</Link>
          
          <div className="register-header">
            <h1 className="register-title">FORGE YOUR LEGEND</h1>
            <p className="register-subtitle">Every hero begins somewhere. Define your identity.</p>
          </div>

          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-row">
              <div className="input-group">
                <label>Hero Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your legend name" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Communication Portal</label>
                <input 
                  type="email" 
                  placeholder="Enter your transmission ID" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row split-row">
              <div className="input-group">
                <label>Secret Code</label>
                <input 
                  type="password" 
                  placeholder="Create secure key" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Verify Code</label>
                <input 
                  type="password" 
                  placeholder="Re-enter secure key" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-begin-journey" disabled={isLoading}>
              {isLoading ? 'Summoning...' : '🚀 BEGIN YOUR JOURNEY'}
            </button>
          </form>

          <div className="social-register-section">
            <div className="register-divider">
              <span>or awaken using</span>
            </div>
            
            <div className="social-buttons">
              <button className="btn-social">Google</button>
              <button className="btn-social">Apple</button>
              <button className="btn-social btn-discord">Discord</button>
            </div>
          </div>

          <div className="register-footer">
            <p>Already a hero? <Link to="/login" className="login-link">Enter the Game</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
