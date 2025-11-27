import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Для разработки
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.herokuapp.com' 
  : 'http://localhost:8000';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await axios.post(`${API_BASE}/auth/login`, formData);
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    navigate('/admin');
  } catch (err: any) {
    setError(err.response?.data?.detail || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-form">
      <h2>Login to Auth System</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className={loading ? 'loading' : ''}>
        <div className="form-group">
          <label>Username or Email:</label>
          <input
            type="text"
            value={formData.username_or_email}
            onChange={(e) => setFormData({...formData, username_or_email: e.target.value})}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="nav-links">
        <Link to="/register">Don't have an account? Register</Link>
      </div>
    </div>
  );
};

export default Login;