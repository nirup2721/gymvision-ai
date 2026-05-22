import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API } from '../App';

const CATEGORIES = ['Cardio', 'Strength', 'Flexibility', 'Free Weights', 'Machines', 'Accessories', 'Other'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Repair'];
const conditionColors = { Excellent: '#4ade80', Good: 'var(--accent)', Fair: 'var(--orange)', 'Needs Repair': 'var(--red)' };

function EquipmentModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: '', category: 'Strength', brand: '', condition: 'Good', location: '', notes: '', purchase_date: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        <h2 style={{ marginBottom: 24 }}>{initial ? 'Edit Equipment' : 'Add Equipment 🔧'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Equipment Name</label>
              <input className="form-control" placeholder="e.g. Treadmill X200" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input className="form-control" placeholder="e.g. Rogue, Life Fitness" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select className="form-control" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-control" placeholder="e.g. Main floor, Room B" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" className="form-control" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" rows={2} placeholder="Any additional info..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
            {loading ? 'Saving...' : initial ? 'Update Equipment' : 'Add Equipment'}
          </button>
        </form>
      </div>
    </div>
  );
}



export default function Equipment() {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchEquipment(); }, []);

  const fetchEquipment = async () => {
    try {
      const res = await axios.get(`${API}/api/equipment`, { headers });
      const data = Array.isArray(res.data) ? res.data : res.data?.equipment || [];
      setEquipment(data);
    } catch { setEquipment([]); } finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await axios.put(`${API}/api/equipment/${editing._id}`, data, { headers });
        showToast('Equipment updated!');
      } else {
        await axios.post(`${API}/api/equipment`, data, { headers });
        showToast('Equipment added! 🔧');
      }
      setShowModal(false); setEditing(null);
      fetchEquipment();
    } catch { showToast('Failed to save.'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/equipment/${id}`, { headers });
      setEquipment(prev => prev.filter(e => e._id !== id));
      showToast('Removed.');
    } catch {}
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = equipment.filter(e => {
    const matchCat = filter === 'All' || e.category === filter;
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.brand?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catIcons = { Cardio: '🏃', Strength: '🏋️', Flexibility: '🧘', 'Free Weights': '💪', Machines: '⚙️', Accessories: '🎽', Other: '🔧' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div><h1>Equipment 🔧</h1><p>Manage your gym equipment inventory</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Equipment</button>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Items', value: equipment.length, color: 'var(--accent)' },
          { label: 'Excellent', value: equipment.filter(e => e.condition === 'Excellent').length, color: '#4ade80' },
          { label: 'Needs Repair', value: equipment.filter(e => e.condition === 'Needs Repair').length, color: 'var(--red)' },
          { label: 'Categories', value: [...new Set(equipment.map(e => e.category))].length, color: 'var(--blue)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <input className="form-control" placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, padding: '8px 12px' }} />
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 13, border: filter === c ? 'none' : '1px solid var(--border)',
            background: filter === c ? 'var(--accent)' : 'transparent', color: filter === c ? '#0a0a0f' : 'var(--text-secondary)', cursor: 'pointer',
          }}>{c}</button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔧</div>
            <h3 style={{ marginBottom: 8 }}>No equipment found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Add your gym equipment to track it</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Equipment</button>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((e, i) => {
              const condColor = conditionColors[e.condition] || 'var(--text-muted)';
              return (
                <div key={e._id || i} className="card" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 28 }}>{catIcons[e.category] || '🔧'}</div>
                    <span className="tag" style={{ background: `${condColor}18`, color: condColor }}>{e.condition}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{e.name}</h3>
                  {e.brand && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>{e.brand}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <span className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{e.category}</span>
                    {e.location && <span className="tag" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>📍 {e.location}</span>}
                  </div>
                  {e.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>{e.notes}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setEditing(e); setShowModal(true); }} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(e._id)} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: 12 }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showModal && <EquipmentModal onClose={() => { setShowModal(false); setEditing(null); }} onSave={handleSave} initial={editing} />}
      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}