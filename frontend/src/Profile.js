import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API } from '../App';

const FITNESS_GOALS = ['Lose Weight', 'Build Muscle', 'Improve Endurance', 'Stay Active', 'Athletic Performance', 'Flexibility', 'Other'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];

export default function Profile() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', age: '', height: '', weight: '', fitness_goal: '', activity_level: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/api/user/me`, { headers });
      const u = res.data;
      setForm({
        name: u.name || '',
        email: u.email || '',
        age: u.age || '',
        height: u.height || '',
        weight: u.weight || '',
        fitness_goal: u.fitness_goal || '',
        activity_level: u.activity_level || '',
        bio: u.bio || '',
      });
    } catch {
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        age: '', height: '', weight: '', fitness_goal: '', activity_level: '', bio: '',
      });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API}/api/user/me`, form, { headers });
      login(res.data, token);
      showToast('Profile updated! ✅', 'success');
    } catch { showToast('Failed to update.', 'error'); }
    setSaving(false);
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      <div className="page-header">
        <h1>Profile 👤</h1>
        <p>Manage your personal information and fitness goals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }} className="profile-grid">
        {/* Avatar card */}
        <div>
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#0a0a0f',
              margin: '0 auto 16px', fontFamily: 'var(--font-display)',
            }}>{initials}</div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{form.name || 'Athlete'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{form.email}</p>
            {form.fitness_goal && (
              <div style={{ marginTop: 12 }}>
                <span className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>🎯 {form.fitness_goal}</span>
              </div>
            )}
          </div>

          {!loading && (
            <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 14, color: 'var(--text-secondary)' }}>Quick Stats</h4>
              {[
                { label: 'Age', value: form.age ? `${form.age} yrs` : '--' },
                { label: 'Height', value: form.height ? `${form.height} cm` : '--' },
                { label: 'Weight', value: form.weight ? `${form.weight} kg` : '--' },
                { label: 'Activity', value: form.activity_level || '--' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 500 }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ marginBottom: 24 }}>Edit Profile</h3>
          {loading ? <div className="spinner" /> : (
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" className="form-control" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="28" />
                </div>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" className="form-control" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} placeholder="175" />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.1" className="form-control" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="75" />
                </div>
                <div className="form-group">
                  <label>Fitness Goal</label>
                  <select className="form-control" value={form.fitness_goal} onChange={e => setForm({ ...form, fitness_goal: e.target.value })}>
                    <option value="">Select goal...</option>
                    {FITNESS_GOALS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Activity Level</label>
                <select className="form-control" value={form.activity_level} onChange={e => setForm({ ...form, activity_level: e.target.value })}>
                  <option value="">Select activity level...</option>
                  {ACTIVITY_LEVELS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about your fitness journey..." style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 28px' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>

      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      <style>{`@media(max-width:900px){.profile-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}