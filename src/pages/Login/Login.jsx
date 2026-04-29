import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: false, password: false });
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      email: !email.trim(),
      password: !password.trim(),
    };
    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="logo-name" onClick={() => navigate('/dashboard')}>
        <img src="/assets/Logo.svg" className="logo" alt="TerraNote" />
        <span className="name">TerraNote</span>
      </div>

      <div className="login">
        <div className={`login-container ${shake ? 'shake' : ''}`}>
          <div className="sign-txt">Sign In</div>
          <div className="welcome-txt">Ground your ideas. Grow your knowledge.</div>

          <form className="inputs" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className={`email-input ${errors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: false }));
              }}
            />
            <input
              type="password"
              placeholder="Password"
              className={`password-input ${errors.password ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: false }));
              }}
            />
            <a href="#" className="login-forgot">Forgot password?</a>
            <button type="submit" className="login-btn">
              <img src="/assets/Login.svg" className="login-btn-img" alt="" />
              Sign In
            </button>
            <p className="login-disc">
              By Continuing, you agree to TerraNotes{' '}
              <a className="login-links" href="#">User Agreement,</a>{' '}
              <a href="#" className="login-links">Privacy Policy</a> and{' '}
              <a href="#" className="login-links">Cookie Policy</a>
            </p>
            <p className="login-new">
              New to TerraNote?{' '}
              <span className="login-links login-get-started" onClick={() => navigate('/dashboard')}>
                Get Started
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
