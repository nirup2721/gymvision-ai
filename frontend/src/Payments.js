import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API } from '../App';

const PLANS = [
  { id: 'basic', name: 'Basic', price: 9.99, features: ['Workout Tracking', 'Nutrition Logging', 'Progress Charts', 'Equipment Management'], color: 'var(--blue)' },
  { id: 'pro', name: 'Pro', price: 19.99, features: ['Everything in Basic', 'AI Workout Plans', 'AI Nutrition Coach', 'Advanced Analytics', 'Priority Support'], color: 'var(--accent)', popular: true },
  { id: 'elite', name: 'Elite', price: 39.99, features: ['Everything in Pro', 'Personal AI Coach', '1-on-1 Consultations', 'Custom Meal Plans', 'Video Analysis'], color: 'var(--purple)' },
];

export default function Payments() {
  const { token } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API}/api/payments`, { headers });
      const data = res.data;
      setSubscription(data?.subscription || null);
      setHistory(data?.history || []);
    } catch { setSubscription(null); setHistory([]); }
    finally { setLoading(false); }
  };

  const handleSubscribe = async (planId) => {
    try {
      await axios.post(`${API}/api/payments/subscribe`, { plan: planId }, { headers });
      showToast('Subscription activated! 🎉', 'success');
      fetchPayments();
    } catch { showToast('Payment processing failed. Try again.', 'error'); }
  };

  const handleCancel = async () => {
    try {
      await axios.post(`${API}/api/payments/cancel`, {}, { headers });
      showToast('Subscription cancelled.', 'success');
      fetchPayments();
    } catch { showToast('Failed to cancel.', 'error'); }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const statusColors = { active: '#4ade80', cancelled: 'var(--red)', expired: 'var(--orange)', pending: 'var(--blue)' };

  return (
    <div>
      <div className="page-header">
        <h1>Payments 💳</h1>
        <p>Manage your subscription and billing</p>
      </div>

      {/* Current subscription */}
      {!loading && subscription && (
        <div className="card" style={{ marginBottom: 32, padding: '24px 28px', background: 'linear-gradient(135deg, var(--bg-card), rgba(232,255,71,0.03))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Plan</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{subscription.plan_name || 'Pro'} Plan</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span className="tag" style={{ background: `${statusColors[subscription.status] || '#4ade80'}20`, color: statusColors[subscription.status] || '#4ade80' }}>
                  ● {subscription.status || 'Active'}
                </span>
                {subscription.next_billing && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Renews {new Date(subscription.next_billing).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button onClick={handleCancel} className="btn btn-danger">Cancel Subscription</button>
          </div>
        </div>
      )}

      {/* Plans */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'var(--text-secondary)' }}>
        {subscription ? 'Change Plan' : 'Choose a Plan'}
      </h2>
      <div className="grid-3" style={{ marginBottom: 40 }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{
            position: 'relative',
            border: plan.popular ? `1px solid ${plan.color}` : '1px solid var(--border)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!plan.popular) e.currentTarget.style.borderColor = plan.color; }}
            onMouseLeave={e => { if (!plan.popular) e.currentTarget.style.borderColor = 'var(--border)'; }}>
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: plan.color, color: '#0a0a0f', padding: '3px 14px',
                borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              }}>MOST POPULAR</div>
            )}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', color: plan.color, fontFamily: 'var(--font-display)' }}>{plan.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: 8 }}>
                ${plan.price}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: 24 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                border: plan.popular ? 'none' : `1px solid ${plan.color}`,
                background: plan.popular ? plan.color : 'transparent',
                color: plan.popular ? '#0a0a0f' : plan.color,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!plan.popular) { e.currentTarget.style.background = `${plan.color}18`; } }}
              onMouseLeave={e => { if (!plan.popular) { e.currentTarget.style.background = 'transparent'; } }}
            >
              {subscription?.plan_id === plan.id ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-secondary)' }}>Payment History</h2>
      {loading ? <div className="spinner" /> : (
        history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
            <p style={{ color: 'var(--text-muted)' }}>No payment history yet</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h._id || i}>
                      <td>{h.date ? new Date(h.date).toLocaleDateString() : '--'}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{h.description || 'Subscription'}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>${h.amount?.toFixed(2) || '--'}</td>
                      <td><span className="tag" style={{ background: `${statusColors[h.status] || '#4ade80'}18`, color: statusColors[h.status] || '#4ade80' }}>{h.status || 'Paid'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}