import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API } from '../App';

const WORKOUT_TYPES = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Crossfit', 'Swimming', 'Cycling', 'Running', 'Other'];

function WorkoutModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', type: 'Strength', duration: '', calories_burned: '', notes: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...form, duration: Number(form.duration), calories_burned: Number(form.calories_burned) });
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 20,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        <h2 style={{ marginBottom: 24 }}>Log Workout</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Workout Name</label>
              <input className="form-control" placeholder="e.g. Morning Run" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Duration (min)</label>
              <input type="number" className="form-control" placeholder="45" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Calories Burned</label>
              <input type="number" className="form-control" placeholder="300" value={form.calories_burned} onChange={e => setForm({ ...form, calories_burned: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" rows={3} placeholder="How was your workout?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
            {loading ? 'Saving...' : 'Save Workout'}
          </button>
        </form>
      </div>
    </div>
  );
}

const typeColors = { Strength: 'var(--accent)', Cardio: 'var(--red)', HIIT: 'var(--orange)', Yoga: 'var(--purple)', Crossfit: 'var(--blue)', Running: 'var(--red)', Swimming: 'var(--blue)', Cycling: 'var(--orange)', Other: 'var(--text-muted)' };

export default function Workouts() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('All');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get(`${API}/api/workout`, { headers });
      const data = Array.isArray(res.data) ? res.data : res.data?.workouts || [];
      setWorkouts(data.reverse());
    } catch { setWorkouts([]); } finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    try {
      await axios.post(`${API}/api/workout`, data, { headers });
      showToast('Workout logged! 💪');
      setShowModal(false);
      fetchWorkouts();
    } catch { showToast('Failed to save workout.'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/workout/${id}`, { headers });
      setWorkouts(prev => prev.filter(w => w._id !== id));
      showToast('Workout deleted.');
    } catch { showToast('Failed to delete.'); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = filter === 'All' ? workouts : workouts.filter(w => w.type === filter);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Workouts 🏋️</h1>
          <p>Track and analyze your training sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Workout</button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['All', ...WORKOUT_TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            border: filter === t ? 'none' : '1px solid var(--border)',
            background: filter === t ? 'var(--accent)' : 'transparent',
            color: filter === t ? '#0a0a0f' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
            <h3 style={{ marginBottom: 8 }}>No workouts yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Log your first workout to get started</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Workout</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((w, i) => {
              const color = typeColors[w.type] || 'var(--text-muted)';
              return (
                <div key={w._id || i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0
                  }}>
                    {w.type === 'Cardio' || w.type === 'Running' ? '🏃' : w.type === 'Yoga' ? '🧘' : w.type === 'Swimming' ? '🏊' : w.type === 'Cycling' ? '🚴' : '🏋️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{w.name || 'Workout'}</span>
                      <span className="tag" style={{ background: `${color}18`, color }}>{w.type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap' }}>
                      {w.duration && <span>⏱ {w.duration} min</span>}
                      {w.calories_burned && <span>🔥 {w.calories_burned} kcal</span>}
                      {w.date && <span>📅 {new Date(w.date).toLocaleDateString()}</span>}
                    </div>
                    {w.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>{w.notes}</div>}
                  </div>
                  <button onClick={() => handleDelete(w._id)} className="btn btn-danger" style={{ padding: '7px 14px', fontSize: 12 }}>Delete</button>
                </div>
              );
            })}
          </div>
        )
      )}

      {showModal && <WorkoutModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}