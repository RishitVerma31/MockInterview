import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (p) => location.pathname === p;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '⚡' },
    { to: '/interview/new', label: 'New Interview', icon: '🎤' },
    { to: '/history', label: 'History', icon: '📋' },
  ];

  return (
    <nav ref={navRef} style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(3,3,10,0.85)' : 'rgba(3,3,10,0.3)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'transparent'}`,
      backdropFilter: 'blur(28px)',
      transition: 'all 0.3s ease',
    }}>
      {/* Top shimmer line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent 0%,rgba(124,106,247,0.8) 30%,rgba(34,211,238,0.6) 60%,transparent 100%)', animation: 'gradShift 4s ease infinite', backgroundSize: '200% 100%' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 68, display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.querySelector('.logo-icon').style.transform = 'rotate(15deg) scale(1.1)'}
          onMouseLeave={e => e.currentTarget.querySelector('.logo-icon').style.transform = 'rotate(0) scale(1)'}>
          <div className="logo-icon" style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(34,211,238,0.2))', border: '1px solid rgba(124,106,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'transform 0.3s ease', boxShadow: '0 0 20px rgba(124,106,247,0.2)' }}>🎯</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              MockInterview<span style={{ background: 'linear-gradient(135deg,#7c6af7,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginLeft: 3 }}>AI</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Powered by Groq</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }} className="desktop-nav">
          {links.map(({ to, label, icon }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to}
                onMouseEnter={() => setHovered(to)}
                onMouseLeave={() => setHovered('')}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 15px', borderRadius: 10, textDecoration: 'none',
                  color: active ? '#fff' : hovered === to ? '#fff' : 'var(--text2)',
                  fontSize: 13, fontWeight: 500,
                  background: active ? 'rgba(124,106,247,0.15)' : hovered === to ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(124,106,247,0.3)' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}>
                {active && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(124,106,247,0.1),rgba(34,211,238,0.05))', borderRadius: 10 }} />}
                <span style={{ fontSize: 14, position: 'relative', zIndex: 1, transition: 'transform 0.2s', transform: hovered === to ? 'scale(1.2)' : 'scale(1)' }}>{icon}</span>
                <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
                {active && <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 16, height: 2, borderRadius: 1, background: 'linear-gradient(90deg,#7c6af7,#22d3ee)' }} />}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn"
          style={{ display: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px', color: '#fff', fontSize: 20, cursor: 'pointer', marginLeft: 'auto' }}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }} className="desktop-user">
          {/* Status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '4px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Online</span>
          </div>

          {/* Avatar */}
          <div style={{ position: 'relative', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.querySelector('.av-ring').style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.querySelector('.av-ring').style.opacity = '0.5'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(124,106,247,0.4)' }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</div>
              }
            </div>
            <div className="av-ring" style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '1.5px solid rgba(124,106,247,0.5)', opacity: 0.5, transition: 'opacity 0.2s', animation: 'glow 3s ease-in-out infinite' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.5px' }}>Candidate</span>
          </div>

          <button onClick={handleLogout}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text2)'; }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', color: 'var(--text2)', fontSize: 12, fontWeight: 500, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>↩</span> Sign out
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          background: 'rgba(3,3,10,0.98)', backdropFilter: 'blur(28px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'slideDown 0.3s ease'
        }}>
          {links.map(({ to, label, icon }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 10, textDecoration: 'none',
                  color: active ? '#fff' : 'var(--text2)',
                  fontSize: 14, fontWeight: 500,
                  background: active ? 'rgba(124,106,247,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? 'rgba(124,106,247,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(124,106,247,0.4)' }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</div>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>Candidate</div>
            </div>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '6px 12px', color: '#f87171', fontSize: 12, fontWeight: 500 }}>
              Sign out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-user { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
