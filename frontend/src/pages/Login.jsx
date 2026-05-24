import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { API } from '../App';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>
      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#fff', marginBottom: '8px' }}>🏋️ GymVision AI</h1>
        <p style={{ color: '#888', marginBottom: '24px' }}>Sign in to your account</p>
        {error && <div style={{ background: '#ff444420', color: '#ff4444', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }} required />
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#6c63ff', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ color: '#888', textAlign: 'center', marginTop: '16px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6c63ff' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}