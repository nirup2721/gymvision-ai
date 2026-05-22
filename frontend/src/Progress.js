import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth, API } from '../App';

function LogModal({ onClose, onSave }) {
  const [form, setForm] = useState({ weight: '', body_fat: '', chest: '', waist: '', hips: '', arms: '', legs: '', notes: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {};
    Object.entries(form).forEach(([k, v]) => { payload[k] = v && k !== 'notes' && k !== 'date' ? Number(v) : v; });
    await onSave(payload);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        <h2 style={{ marginBottom: 24 }}>Log Progress 📈</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" step="0.1" className="form-control" placeholder="75.5" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Body Fat (%)</label>
              <input type="number" step="0.1" className="form-control" placeholder="18.5" value={form.body_fat} onChange={e => setForm({ ...form, body_fat: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Chest (cm)</label>
              <input type="number" step="0.1" className="form-control" placeholder="95" value={form.chest} onChange={e => setForm({ ...form, chest: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Waist (cm)</label>
              <input type="number" step="0.1" className="form-control" placeholder="80" value={form.waist} onChange={e => setForm({ ...form, waist: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Arms (cm)</label>
              <input type="number" step="0.1" className="form-control" placeholder="36" value={form.arms} onChange={e => setForm({ ...form, arms: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Legs (cm)</label>
              <input type="number" step="0.1" className="form-control" placeholder="58" value={form.legs} onChange={e => setForm({ ...form, legs: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" rows={2} placeholder="How are you feeling?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
            {loading ? 'Saving...' : 'Log Progress'}
          </button>
        </form>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Progress() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [activeMetric, setActiveMetric] = useState('weight');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchProgress(); }, []);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${API}/api/progress`, { headers });
      const data = Array.isArray(res.data) ? res.data : res.data?.entries || [];
      setEntries(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch { setEntries([]); } finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    try {
      await axios.post(`${API}/api/progress`, data, { headers });
      setToast('Progress logged! 📈');
      setShowModal(false);
      fetchProgress();
    } catch { setToast('Failed to save.'); }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/progress/${id}`, { headers });
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch {}
  };

  const chartData = entries.map(e => ({
    date: e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    weight: e.weight, body_fat: e.body_fat, waist: e.waist, chest: e.chest, arms: e.arms, legs: e.legs,
  }));

  const latest = entries[entries.length - 1] || {};
  const prev = entries[entries.length - 2] || {};
  const weightChange = latest.weight && prev.weight ? (latest.weight - prev.weight).toFixed(1) : null;

  const metrics = [
    { key: 'weight', label: 'Weight', color: 'var(--accent)', unit: 'kg' },
    { key: 'body_fat', label: 'Body Fat', color: 'var(--red)', unit: '%' },
    { key: 'waist', label: 'Waist', color: 'var(--orange)', unit: 'cm' },
    { key: 'chest', label: 'Chest', color: 'var(--blue)', unit: 'cm' },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div><h1>Progress 📈</h1><p>Track your body composition over time</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Progress</button>
      </div>

      {/* Latest stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            {latest.weight ? `${latest.weight} kg` : '--'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Current Weight</div>
          {weightChange && (
            <div style={{ fontSize: 12, marginTop: 6, color: Number(weightChange) < 0 ? '#4ade80' : 'var(--red)', fontWeight: 600 }}>
              {Number(weightChange) > 0 ? '▲' : '▼'} {Math.abs(weightChange)} kg vs last
            </div>
          )}
        </div>
        {[
          { key: 'body_fat', label: 'Body Fat', unit: '%', color: 'var(--red)' },
          { key: 'waist', label: 'Waist', unit: 'cm', color: 'var(--orange)' },
          { key: 'arms', label: 'Arms', unit: 'cm', color: 'var(--purple)' },
        ].map(m => (
          <div key={m.key} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: m.color }}>
              {latest[m.key] ? `${latest[m.key]} ${m.unit}` : '--'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {entries.length > 1 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ fontSize: '1rem' }}>Progress Chart</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {metrics.map(m => (
                <button key={m.key} onClick={() => setActiveMetric(m.key)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  border: activeMetric === m.key ? 'none' : '1px solid var(--border)',
                  background: activeMetric === m.key ? m.color : 'transparent',
                  color: activeMetric === m.key ? '#0a0a0f' : 'var(--text-secondary)',
                }}>{m.label}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={activeMetric} stroke={metrics.find(m => m.key === activeMetric)?.color || 'var(--accent)'} strokeWidth={2.5} dot={{ fill: 'var(--bg-card)', stroke: 'var(--accent)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name={metrics.find(m => m.key === activeMetric)?.label} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-secondary)' }}>History</h2>
      {loading ? <div className="spinner" /> : (
        entries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
            <h3 style={{ marginBottom: 8 }}>No progress logged</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Start tracking your body composition</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Progress</button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Body Fat</th>
                    <th>Waist</th>
                    <th>Arms</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().map((e, i) => (
                    <tr key={e._id || i}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.date ? new Date(e.date).toLocaleDateString() : '--'}</td>
                      <td style={{ color: 'var(--accent)' }}>{e.weight ? `${e.weight} kg` : '--'}</td>
                      <td>{e.body_fat ? `${e.body_fat}%` : '--'}</td>
                      <td>{e.waist ? `${e.waist} cm` : '--'}</td>
                      <td>{e.arms ? `${e.arms} cm` : '--'}</td>
                      <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.notes || '--'}</td>
                      <td><button onClick={() => handleDelete(e._id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16 }}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {showModal && <LogModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}