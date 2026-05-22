import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { path: '/workouts', label: 'Workouts', icon: '🏋️' },
  { path: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { path: '/equipment', label: 'Equipment', icon: '🔧' },
  { path: '/progress', label: 'Progress', icon: '📈' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          position: 'fixed', top: 16, left: 16,
          zIndex: 1001,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px',
          color: 'var(--text-primary)', fontSize: 18,
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 999, display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}

      <aside style={{
        width: 260,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'fixed',
        left: 0, top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38,
              background: 'var(--accent)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>⚡</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
                GymVision
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                AI
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflow: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 12px 10px', fontFamily: 'var(--font-display)' }}>
            Main Menu
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {item.path === '/workouts' && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--accent)', color: '#0a0a0f',
                  borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700
                }}>New</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 10,
            background: 'var(--bg-card)', marginBottom: 8
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#0a0a0f',
              flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Athlete'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 14px', borderRadius: 10, border: 'none',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: block !important; }
          aside { transform: translateX(${mobileOpen ? '0' : '-100%'}); transition: transform 0.25s; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
}