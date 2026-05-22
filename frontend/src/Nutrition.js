import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API } from '../App';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout'];

function MealModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', meal_type: 'Breakfast', calories: '', protein: '', carbs: '', fat: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...form,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
    });
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        <h2 style={{ marginBottom: 24 }}>Log Meal 🥗</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Food / Meal Name</label>
              <input className="form-control" placeholder="e.g. Oatmeal with Banana" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Meal Type</label>
              <select className="form-control" value={form.meal_type} onChange={e => setForm({ ...form, meal_type: e.target.value })}>
                {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Calories (kcal)</label>
              <input type="number" className="form-control" placeholder="350" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input type="number" className="form-control" placeholder="25" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input type="number" className="form-control" placeholder="45" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Fat (g)</label>
              <input type="number" className="form-control" placeholder="10" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
            {loading ? 'Saving...' : 'Log Meal'}
          </button>
        </form>
      </div>
    </div>
  );
}

const MacroBar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{value}g</span>
    </div>
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
    </div>
  </div>
);

export default function Nutrition() {
  const { token } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchMeals(); }, []);

  const fetchMeals = async () => {
    try {
      const res = await axios.get(`${API}/api/nutrition`, { headers });
      const data = Array.isArray(res.data) ? res.data : res.data?.meals || [];
      setMeals(data.reverse());
    } catch { setMeals([]); } finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    try {
      await axios.post(`${API}/api/nutrition`, data, { headers });
      setToast('Meal logged! 🥗');
      setShowModal(false);
      fetchMeals();
    } catch { setToast('Failed to save.'); }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/nutrition/${id}`, { headers });
      setMeals(prev => prev.filter(m => m._id !== id));
    } catch {}
  };

  const todayMeals = meals.filter(m => m.date && m.date.startsWith(selectedDate));
  const totals = todayMeals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const mealTypeColors = { Breakfast: 'var(--orange)', Lunch: 'var(--accent)', Dinner: 'var(--purple)', Snack: 'var(--blue)', 'Pre-workout': 'var(--red)', 'Post-workout': '#4ade80' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Nutrition 🥗</h1>
          <p>Track your daily food intake and macros</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: 'auto', padding: '8px 12px' }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Meal</button>
        </div>
      </div>

      {/* Daily summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginBottom: 28 }} className="nutrition-grid">
        <div className="card">
          <h3 style={{ marginBottom: 6, fontSize: '1rem' }}>Daily Totals</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--orange)', marginBottom: 4 }}>
            {totals.calories.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>calories consumed</div>
          <MacroBar label="Protein" value={totals.protein} max={200} color="var(--blue)" />
          <MacroBar label="Carbohydrates" value={totals.carbs} max={300} color="var(--orange)" />
          <MacroBar label="Fat" value={totals.fat} max={80} color="var(--purple)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Protein', value: `${totals.protein}g`, color: 'var(--blue)', icon: '💪' },
            { label: 'Carbs', value: `${totals.carbs}g`, color: 'var(--orange)', icon: '🍚' },
            { label: 'Fat', value: `${totals.fat}g`, color: 'var(--purple)', icon: '🥑' },
          ].map(m => (
            <div key={m.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal list */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-secondary)' }}>Meals</h2>
      {loading ? <div className="spinner" /> : (
        todayMeals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥗</div>
            <h3 style={{ marginBottom: 8 }}>No meals logged</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Start tracking your nutrition</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Meal</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayMeals.map((m, i) => {
              const color = mealTypeColors[m.meal_type] || 'var(--text-muted)';
              return (
                <div key={m._id || i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🍽️</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span className="tag" style={{ background: `${color}18`, color }}>{m.meal_type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, color: 'var(--text-muted)', fontSize: 12, flexWrap: 'wrap' }}>
                      <span>🔥 {m.calories} kcal</span>
                      {m.protein > 0 && <span>P: {m.protein}g</span>}
                      {m.carbs > 0 && <span>C: {m.carbs}g</span>}
                      {m.fat > 0 && <span>F: {m.fat}g</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(m._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}>Delete</button>
                </div>
              );
            })}
          </div>
        )
      )}

      {showModal && <MealModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      {toast && <div className="toast success">{toast}</div>}

      <style>{`@media(max-width:768px){.nutrition-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}