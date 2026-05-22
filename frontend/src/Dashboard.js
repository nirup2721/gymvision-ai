import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API } from '../App';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      background: `${color}18`, borderRadius: '50%',
    }} />
    <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const QuickAction = ({ to, icon, label, desc, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20, marginBottom: 12
      }}>{icon}</div>
      <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
    </div>
  </Link>
);

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ workouts: 0, calories: 0, streak: 0, weight: '--' });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/api/workout`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API}/api/progress`, { headers }).catch(() => ({ data: [] })),
    ]).then(([workoutsRes, progressRes]) => {
      const workouts = Array.isArray(workoutsRes.data) ? workoutsRes.data : workoutsRes.data?.workouts || [];
      const progress = Array.isArray(progressRes.data) ? progressRes.data : progressRes.data?.entries || [];
      setStats({
        workouts: workouts.length,
        calories: workouts.reduce((s, w) => s + (w.calories_burned || 0), 0),
        streak: Math.min(workouts.length, 7),
        weight: progress.length > 0 ? `${progress[progress.length - 1]?.weight || '--'} kg` : '-- kg',
      });
      setRecentWorkouts(workouts.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(232,255,71,0.04) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{greeting} 👋</p>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>{user?.name || 'Athlete'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Ready to crush today's workout? Your AI coach is here.
            </p>
          </div>
          <Link to="/workouts" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
            + Log Workout
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? <div className="spinner" /> : (
        <>
          <div className="grid-4" style={{ marginBottom: 28 }}>
            <StatCard label="Total Workouts" value={stats.workouts} sub="All time" color="var(--accent)" icon="🏋️" />
            <StatCard label="Calories Burned" value={stats.calories.toLocaleString()} sub="Total" color="var(--red)" icon="🔥" />
            <StatCard label="Day Streak" value={`${stats.streak}d`} sub="Keep it up!" color="var(--blue)" icon="⚡" />
            <StatCard label="Current Weight" value={stats.weight} sub="Latest log" color="var(--purple)" icon="📊" />
          </div>

          {/* Quick actions */}
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            Quick Actions
          </h2>
          <div className="grid-3" style={{ marginBottom: 36 }}>
            <QuickAction to="/workouts" icon="🏋️" label="Log Workout" desc="Track your training session" color="var(--accent)" />
            <QuickAction to="/nutrition" icon="🥗" label="Log Meal" desc="Track calories & macros" color="var(--orange)" />
            <QuickAction to="/progress" icon="📈" label="Update Progress" desc="Log weight & measurements" color="var(--blue)" />
          </div>

          {/* Recent workouts */}
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            Recent Workouts
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {recentWorkouts.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
                <p>No workouts yet. <Link to="/workouts" style={{ color: 'var(--accent)' }}>Log your first one!</Link></p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Workout</th>
                      <th>Duration</th>
                      <th>Calories</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkouts.map((w, i) => (
                      <tr key={w._id || i}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{w.name || w.type || 'Workout'}</td>
                        <td>{w.duration ? `${w.duration} min` : '--'}</td>
                        <td>{w.calories_burned ? `${w.calories_burned} kcal` : '--'}</td>
                        <td>{w.date ? new Date(w.date).toLocaleDateString() : '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}