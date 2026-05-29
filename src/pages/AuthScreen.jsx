import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { initialUsers } from '../data/mockData';
import { 
  Megaphone, 
  Users, 
  GraduationCap, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Lock, 
  CheckCircle 
} from 'lucide-react';
import './AuthScreen.css';

const AuthScreen = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Very simple mock auth check against mock data
      const user = initialUsers.find(u => u.email === email);
      if (user) {
        // Assume password is 'password' for all mock users
        if (password === 'password' || password === '') {
          login(user);
        } else {
          setError('Invalid password. (Hint: use "password")');
        }
      } else {
        setError('Account not found. Try student@nst.edu, faculty@nst.edu, or admin@nst.edu');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleMockLogin = (role) => {
    const mockUserEmail = `${role}@nst.edu`;
    setEmail(mockUserEmail);
    setPassword('password');
  };

  return (
    <div className="auth-split-container">
      
      {/* LEFT COLUMN - BRANDING & PILlARS */}
      <div className="auth-left-column">
        <header className="auth-column-header">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
              <circle cx="12" cy="7" r="4.5" stroke="#3D6B4A" strokeWidth="2.5" fill="none" />
              <circle cx="6" cy="16" r="4.5" stroke="#3D6B4A" strokeWidth="2.5" fill="none" />
              <circle cx="18" cy="16" r="4.5" stroke="#3D6B4A" strokeWidth="2.5" fill="none" />
              <line x1="12" y1="11.5" x2="8.5" y2="13.5" stroke="#3D6B4A" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="11.5" x2="15.5" y2="13.5" stroke="#3D6B4A" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="logo-text">UniSphere</span>
          </div>
        </header>

        <main className="auth-column-main">
          <h1 className="hero-title">
            The Operating System <br />for <span className="italic-green">Modern Campus Communities</span>
          </h1>
          <p className="hero-description">
            Bring announcements, student communities, faculty communication, events, clubs, and placements into one unified campus platform.
          </p>

          <div className="pillar-tags-grid">
            <div className="pillar-tag">
              <Megaphone size={16} className="pillar-icon" />
              <span>Announcements</span>
            </div>
            <div className="pillar-tag">
              <Users size={16} className="pillar-icon" />
              <span>Student Communities</span>
            </div>
            <div className="pillar-tag">
              <GraduationCap size={16} className="pillar-icon" />
              <span>Faculty Comm.</span>
            </div>
            <div className="pillar-tag">
              <Calendar size={16} className="pillar-icon" />
              <span>Events</span>
            </div>
            <div className="pillar-tag">
              <Briefcase size={16} className="pillar-icon" />
              <span>Placements</span>
            </div>
            <div className="pillar-tag">
              <MessageSquare size={16} className="pillar-icon" />
              <span>Real-Time Discussions</span>
            </div>
          </div>

          <div className="browser-mockup-wrapper">
            <div className="browser-mockup-header">
              <div className="browser-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="browser-mockup-url">unisphere.app/dashboard</div>
            </div>
            <div className="browser-mockup-body">
              <div className="browser-mockup-content">
                Dashboard Preview Available
              </div>
            </div>
          </div>
        </main>

        <footer className="auth-column-footer">
          <span>© 2024 UniSphere. All rights reserved.</span>
        </footer>
      </div>

      {/* RIGHT COLUMN - AUTHENTICATION FORM */}
      <div className="auth-right-column">
        <header className="auth-column-header right-align">
          <button type="button" className="btn-create-account-outline">Create Account</button>
        </header>

        <main className="auth-column-main">
          <div className="login-card-wrapper">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to access your campus network.</p>

            {/* MOCK CREDENTIALS PANEL */}
            <div className="mock-credentials-panel">
              <span className="mock-credentials-label">Demo Quick-fill:</span>
              <div className="mock-credentials-buttons">
                <button type="button" onClick={() => handleMockLogin('student')} className="btn-demo-quick">Student</button>
                <button type="button" onClick={() => handleMockLogin('faculty')} className="btn-demo-quick">Faculty</button>
                <button type="button" onClick={() => handleMockLogin('admin')} className="btn-demo-quick">Admin</button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="login-form-element">
              {error && <div className="form-error-banner">{error}</div>}
              
              <div className="form-field-group">
                <label className="form-field-label">COLLEGE EMAIL</label>
                <input 
                  type="email" 
                  placeholder="student@university.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-field-input"
                />
              </div>

              <div className="form-field-group">
                <div className="form-field-label-row">
                  <label className="form-field-label">PASSWORD</label>
                  <a href="#" className="form-forgot-password-link">Forgot Password?</a>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-field-input"
                />
              </div>

              <button type="submit" className="btn-login-submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="form-or-divider">
              <span>OR</span>
            </div>

            <button type="button" className="btn-google-oauth">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="google-icon-svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.29C21.38 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.72 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.82 14.11H2.13V16.97C3.95 20.59 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.82 14.11C5.6 13.45 5.47 12.74 5.47 12C5.47 11.26 5.6 10.55 5.82 9.89V7.03H2.13C1.38 8.52 0.95 10.21 0.95 12C0.95 13.79 1.38 15.48 2.13 16.97L5.82 14.11Z" fill="#FBBC05"/>
                <path d="M12 5.37C13.62 5.37 15.06 5.93 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.7 1 3.95 3.41 2.13 7.03L5.82 9.89C6.7 7.31 9.13 5.37 12 5.37Z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="login-trust-indicators">
              <div className="login-trust-item">
                <Lock size={14} className="trust-icon" />
                <span>Secure Authentication</span>
              </div>
              <div className="login-trust-item">
                <CheckCircle size={14} className="trust-icon" />
                <span>Institution Verified</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="auth-column-footer">
          <div className="policy-links-wrapper">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
            <a href="#">Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthScreen;
