import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    const fn = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  // 3D card tilt on mouse move
  const handleCardMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / rect.height) * -10;
    const ry = ((e.clientX - cx) / rect.width) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
  };
  const handleCardMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try { await loginWithGoogle(); navigate('/dashboard'); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') await loginWithEmail(email, password);
      else { if (!name.trim()) { setError('Name is required'); setLoading(false); return; } await registerWithEmail(email, password, name); }
      navigate('/dashboard');
    } catch (e) { setError(e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim()); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Floating 3D shapes */}
      <div style={{ ...s.shape, width: 120, height: 120, top: '10%', left: '8%', animationDelay: '0s', background: 'linear-gradient(135deg,rgba(124,106,247,0.15),rgba(34,211,238,0.1))', borderRadius: 24, animation: 'float 6s ease-in-out infinite, glow 4s ease-in-out infinite' }} />
      <div style={{ ...s.shape, width: 80, height: 80, top: '20%', right: '10%', animationDelay: '1s', background: 'linear-gradient(135deg,rgba(34,211,238,0.12),rgba(167,139,250,0.1))', borderRadius: '50%', animation: 'floatR 5s ease-in-out infinite' }} />
      <div style={{ ...s.shape, width: 60, height: 60, bottom: '15%', left: '12%', animationDelay: '2s', background: 'rgba(244,114,182,0.1)', borderRadius: 16, animation: 'float 7s ease-in-out infinite', border: '1px solid rgba(244,114,182,0.2)' }} />
      <div style={{ ...s.shape, width: 100, height: 100, bottom: '20%', right: '8%', animationDelay: '0.5s', background: 'rgba(74,222,128,0.08)', borderRadius: 20, animation: 'floatR 8s ease-in-out infinite', border: '1px solid rgba(74,222,128,0.15)' }} />
      {/* Spinning rings */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(124,106,247,0.04)', animation: 'spinSlow 30s linear infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(34,211,238,0.04)', animation: 'spinSlow 20s linear infinite reverse', pointerEvents: 'none' }} />

      <div className="login-layout" style={s.layout}>
        {/* Left */}
        <div className="login-left" style={s.left}>
          <div style={s.leftInner}>
            <div style={s.logoWrap}>
              <div style={s.logoBox}>
                <span style={{ fontSize: 36 }}>🎯</span>
                <div style={s.logoRing1} />
                <div style={s.logoRing2} />
                <div style={s.logoRing3} />
              </div>
            </div>
            <h1 style={s.bigTitle}>
              <span style={s.bigTitleLine1}>Mock</span>
              <span style={s.bigTitleLine2}>Interview</span>
              <span style={s.bigTitleAI}>AI</span>
            </h1>
            <p style={s.tagline}>The smartest way to prepare for your next big role.</p>

            <div style={s.features}>
              {[
                { icon: '🤖', label: 'AI Questions', desc: 'Tailored to your role & stack', color: '#7c6af7' },
                { icon: '🎙', label: 'Voice Answers', desc: 'Speak naturally, get transcribed', color: '#22d3ee' },
                { icon: '👁', label: 'Gaze Proctoring', desc: 'Real-time eye tracking', color: '#f472b6' },
                { icon: '📊', label: 'Smart Reports', desc: 'Detailed AI feedback & scores', color: '#4ade80' },
              ].map((f, i) => (
                <div key={i} style={{ ...s.feat, animationDelay: i * 0.12 + 's' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.borderColor = f.color + '40'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                  <div style={{ ...s.featIcon, background: f.color + '18', border: `1px solid ${f.color}30`, boxShadow: `0 0 12px ${f.color}20` }}>{f.icon}</div>
                  <div>
                    <div style={s.featLabel}>{f.label}</div>
                    <div style={s.featDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div style={s.statsRow}>
              {[['10K+','Interviews'], ['98%','Accuracy'], ['4.9★','Rating']].map(([v, l]) => (
                <div key={l} style={s.stat}>
                  <div style={s.statVal}>{v}</div>
                  <div style={s.statLbl}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — card */}
        <div style={s.right}>
          <div ref={cardRef} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave} className="login-card" style={s.card}>
            {/* Animated border */}
            <div style={s.cardBorderGlow} />
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(124,106,247,0.9),rgba(34,211,238,0.6),transparent)' }} />

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {mode === 'login' ? 'Welcome back 👋' : 'Join the platform ✨'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>
                {mode === 'login' ? 'Sign in to continue your practice' : 'Create your free account'}
              </p>
            </div>

            {/* Tabs */}
            <div style={s.tabs}>
              {['login','register'].map(t => (
                <button key={t} onClick={() => { setMode(t); setError(''); }}
                  style={{ ...s.tab, ...(mode === t ? s.tabOn : {}) }}>
                  {mode === t && <div style={s.tabBg} />}
                  <span style={{ position: 'relative', zIndex: 1 }}>{t === 'login' ? 'Sign In' : 'Sign Up'}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'register' && <FancyInput label="Full Name" type="text" placeholder="John Doe" value={name} onChange={setName} focused={focused === 'name'} onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />}
              <FancyInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
              <FancyInput label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} focused={focused === 'pass'} onFocus={() => setFocused('pass')} onBlur={() => setFocused('')} />

              {error && <div style={s.error}><span>⚠️</span>{error}</div>}

              <button type="submit" disabled={loading}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,106,247,0.5)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,106,247,0.3)'; }}
                style={s.submitBtn}>
                <div style={s.submitBg} />
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? <><Spinner /><span>Please wait...</span></> : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                </span>
              </button>
            </form>

            <div style={s.divider}><span style={s.divLine} /><span style={s.divText}>or</span><span style={s.divLine} /></div>

            <button onClick={handleGoogle} disabled={loading}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              style={s.googleBtn}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}
        @keyframes floatR{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-10px) rotate(-1deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(124,106,247,0.2)}50%{box-shadow:0 0 40px rgba(124,106,247,0.5)}}
        @keyframes spinSlow{to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        
        @media (min-width: 769px) {
          .login-layout { grid-template-columns: 1fr 1fr !important; gap: 60px !important; }
        }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-card { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

function FancyInput({ label, type, placeholder, value, onChange, focused, onFocus, onBlur }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: focused ? 'var(--accent2)' : 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', transition: 'color 0.2s' }}>{label}</label>
      <div style={{ position: 'relative', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${focused ? 'rgba(124,106,247,0.6)' : 'rgba(255,255,255,0.07)'}`, boxShadow: focused ? '0 0 0 3px rgba(124,106,247,0.1), 0 0 20px rgba(124,106,247,0.1)' : 'none', transition: 'all 0.2s' }}>
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} required
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '12px 16px', color: '#fff', fontSize: 14 }} />
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />;
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' },
  shape: { position: 'fixed', pointerEvents: 'none', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.06)' },
  layout: { display: 'grid', gridTemplateColumns: '1fr', maxWidth: 1040, width: '100%', gap: 40, alignItems: 'center', position: 'relative', zIndex: 1 },
  left: { display: 'flex', flexDirection: 'column' },
  leftInner: { display: 'flex', flexDirection: 'column', gap: 28 },
  logoWrap: { display: 'flex' },
  logoBox: { position: 'relative', width: 72, height: 72, background: 'linear-gradient(135deg,rgba(124,106,247,0.2),rgba(34,211,238,0.1))', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(124,106,247,0.3)' },
  logoRing1: { position: 'absolute', inset: -6, borderRadius: 26, border: '1px solid rgba(124,106,247,0.2)', animation: 'glow 3s ease-in-out infinite' },
  logoRing2: { position: 'absolute', inset: -14, borderRadius: 34, border: '1px solid rgba(124,106,247,0.1)' },
  logoRing3: { position: 'absolute', inset: -22, borderRadius: 42, border: '1px solid rgba(124,106,247,0.05)' },
  bigTitle: { display: 'flex', flexDirection: 'column', lineHeight: 1 },
  bigTitleLine1: { fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-2px' },
  bigTitleLine2: { fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-2px' },
  bigTitleAI: { fontSize: 56, fontWeight: 900, letterSpacing: '-2px', background: 'linear-gradient(135deg,#7c6af7,#22d3ee,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 100%', animation: 'gradShift 4s ease infinite' },
  tagline: { fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 380 },
  features: { display: 'flex', flexDirection: 'column', gap: 10 },
  feat: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, transition: 'all 0.2s ease', animation: 'slideUp 0.5s ease forwards', opacity: 0, cursor: 'default' },
  featIcon: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  featLabel: { fontSize: 13, fontWeight: 600, color: '#fff' },
  featDesc: { fontSize: 12, color: 'var(--text3)' },
  statsRow: { display: 'flex', gap: 24 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statVal: { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  statLbl: { fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  right: { display: 'flex', justifyContent: 'center' },
  card: { position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '36px 32px', width: '100%', maxWidth: 420, backdropFilter: 'blur(24px)', overflow: 'hidden', transition: 'transform 0.15s ease', transformStyle: 'preserve-3d' },
  cardBorderGlow: { position: 'absolute', inset: 0, borderRadius: 28, background: 'linear-gradient(135deg,rgba(124,106,247,0.05),transparent,rgba(34,211,238,0.03))', pointerEvents: 'none' },
  tabs: { display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 22 },
  tab: { flex: 1, padding: '9px', border: 'none', background: 'transparent', color: 'var(--text2)', fontSize: 14, fontWeight: 500, borderRadius: 9, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'color 0.2s' },
  tabOn: { color: '#fff' },
  tabBg: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(124,106,247,0.25),rgba(34,211,238,0.1))', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 9 },
  error: { background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
  submitBtn: { position: 'relative', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 8px 24px rgba(124,106,247,0.3)', marginTop: 4 },
  submitBg: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#7c6af7,#5b4fd4,#7c6af7)', backgroundSize: '200% 100%', animation: 'gradShift 3s ease infinite' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' },
  divLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' },
  divText: { fontSize: 12, color: 'var(--text3)' },
  googleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', transition: 'all 0.2s' },
};
