import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchHistory } from '../api/interview';

const TIPS = [
  'Use the STAR method — Situation, Task, Action, Result.',
  'Think out loud so interviewers can follow your reasoning.',
  'Ask clarifying questions before diving into a problem.',
  'Practice explaining complex concepts in simple terms.',
  'Review past reports to identify patterns in weak areas.',
];

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    fetchHistory(getToken).then(d => setInterviews(d.interviews || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Parallax hero
  useEffect(() => {
    const fn = (e) => {
      if (!heroRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      heroRef.current.style.backgroundPosition = `${50 + x * 0.5}% ${50 + y * 0.5}%`;
    };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length > 0 ? (completed.reduce((s, i) => s + (i.report?.overallScore || 0), 0) / completed.length).toFixed(1) : null;
  const tip = TIPS[new Date().getDay() % TIPS.length];
  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Hero */}
        <div ref={heroRef} style={s.hero}>
          {/* Animated orbs inside hero */}
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,106,247,0.15) 0%,transparent 70%)', top: '-50px', right: '10%', animation: 'orbDrift 8s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,0.1) 0%,transparent 70%)', bottom: '-30px', left: '20%', animation: 'orbDrift 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />

          <div style={s.heroInner}>
            <div style={s.heroLeft}>
              <div style={s.greetBadge}>
                <span style={{ animation: 'float 2s ease-in-out infinite', display: 'inline-block' }}>👋</span>
                <span>{greeting}</span>
              </div>
              <h1 style={s.heroTitle}>
                Welcome back,<br />
                <span style={s.heroName}>{firstName}</span>
              </h1>
              <p style={s.heroSub}>Your AI interviewer is ready. Let's sharpen those skills today.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/interview/new" style={s.heroCta}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(124,106,247,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,106,247,0.3)'; }}>
                  <div style={s.heroCtaBg} />
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>🎤 Start Interview</span>
                </Link>
                <Link to="/history" style={s.heroSecondary}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  📋 View History
                </Link>
              </div>
            </div>

            {/* 3D floating card */}
            <div className="hero-card" style={s.heroCard}
              onMouseEnter={e => { e.currentTarget.style.transform = 'perspective(800px) rotateY(-8deg) rotateX(4deg) translateY(-8px)'; e.currentTarget.style.boxShadow = '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,106,247,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'perspective(800px) rotateY(-4deg) rotateX(2deg)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(124,106,247,0.1)'; }}>
              <div style={s.heroCardGlow} />
              <div style={{ fontSize: 36, marginBottom: 8, animation: 'float 4s ease-in-out infinite' }}>🎯</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>AI Mock Interview</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Voice · Video · Proctored</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['React','Node.js','Python'].map((t, i) => (
                  <span key={t} style={{ background: 'rgba(124,106,247,0.2)', color: 'var(--accent2)', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, animationDelay: i * 0.2 + 's' }}>{t}</span>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `dotBounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: 'Total', value: interviews.length, icon: '📋', color: '#7c6af7', sub: 'interviews' },
            { label: 'Completed', value: completed.length, icon: '✅', color: '#4ade80', sub: 'finished' },
            { label: 'Avg Score', value: avgScore ? `${avgScore}/10` : '—', icon: '⭐', color: '#fb923c', sub: 'performance' },
            { label: 'In Progress', value: interviews.filter(i => i.status === 'in_progress').length, icon: '⏳', color: '#22d3ee', sub: 'ongoing' },
          ].map((st, i) => <StatCard key={i} {...st} delay={i * 0.07} />)}
        </div>

        {/* Tip */}
        <div style={s.tip}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,106,247,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          <div style={s.tipGlow} />
          <div style={{ fontSize: 24 }}>💡</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>Daily Tip</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{tip}</div>
          </div>
        </div>

        {/* Recent */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Recent Interviews</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>{interviews.length} sessions recorded</p>
            </div>
            {interviews.length > 3 && <Link to="/history" style={{ fontSize: 13, color: 'var(--accent2)', fontWeight: 500 }}>View all →</Link>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 76, borderRadius: 14, background: 'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
            </div>
          ) : interviews.length === 0 ? <EmptyState /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {interviews.slice(0, 5).map((iv, i) => <IvCard key={iv.sessionId} iv={iv} delay={i * 0.06} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes orbDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-15px)}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1.1);opacity:1}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(124,106,247,0.3)}50%{box-shadow:0 0 50px rgba(124,106,247,0.6)}}
        
        @media (max-width: 768px) {
          .hero-card { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, color, sub, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: `1px solid ${hov ? color + '30' : 'rgba(255,255,255,0.06)'}`, borderRadius: 20, padding: '22px 20px', overflow: 'hidden', animation: `slideUp 0.5s ${delay}s ease forwards`, opacity: 0, transition: 'all 0.25s ease', transform: hov ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hov ? `0 16px 40px rgba(0,0,0,0.4), 0 0 30px ${color}15` : 'none', cursor: 'default' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${color}12, transparent 65%)`, transition: 'opacity 0.3s', opacity: hov ? 1 : 0.5 }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14, boxShadow: hov ? `0 0 20px ${color}30` : 'none', transition: 'box-shadow 0.3s' }}>{icon}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1, animation: 'countUp 0.5s ease' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function IvCard({ iv, delay }) {
  const [hov, setHov] = useState(false);
  const done = iv.status === 'completed';
  const link = done ? `/interview/${iv.sessionId}/report` : `/interview/${iv.sessionId}`;
  const score = iv.report?.overallScore;
  const sc = score >= 8 ? '#4ade80' : score >= 5 ? '#fb923c' : '#f87171';
  const date = new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <Link to={link} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hov ? 'rgba(124,106,247,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', gap: 16, overflow: 'hidden', animation: `slideUp 0.4s ${delay}s ease forwards`, opacity: 0, transition: 'all 0.2s ease', transform: hov ? 'translateX(4px)' : 'translateX(0)', boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.3)' : 'none' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg,#7c6af7,#22d3ee)`, borderRadius: '14px 0 0 14px', opacity: hov ? 1 : 0.5, transition: 'opacity 0.2s' }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{iv.role}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(124,106,247,0.15)', color: 'var(--accent2)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{iv.level}</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{iv.techStack}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{date}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        {score && <div style={{ fontSize: 22, fontWeight: 800, color: sc, lineHeight: 1 }}>{score}<span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>/10</span></div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: done ? '#4ade80' : '#fb923c' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: done ? '#4ade80' : '#fb923c', animation: 'pulse 2s ease-in-out infinite' }} />
          {done ? 'Completed' : 'In Progress'}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div style={{ position: 'relative', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 20, padding: '64px 24px', textAlign: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,106,247,0.07) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
      <div style={{ fontSize: 52, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>🎤</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No interviews yet</div>
      <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>Start your first AI mock interview and get detailed feedback</div>
      <Link to="/interview/new"
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,106,247,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,106,247,0.25)'; }}
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#7c6af7,#5b4fd4)', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', boxShadow: '0 8px 24px rgba(124,106,247,0.25)', transition: 'all 0.2s' }}>
        🚀 Start Interview
      </Link>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 68px)', padding: '32px 16px', position: 'relative', zIndex: 1 },
  container: { maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },
  hero: { position: 'relative', borderRadius: 28, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '32px 24px', transition: 'background-position 0.1s ease' },
  heroInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, position: 'relative', zIndex: 1, flexWrap: 'wrap' },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: 16 },
  greetBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: 'var(--text2)', fontWeight: 500, alignSelf: 'flex-start' },
  heroTitle: { fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px' },
  heroName: { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: 15, color: 'var(--text2)', maxWidth: 380 },
  heroCta: { position: 'relative', display: 'inline-flex', alignItems: 'center', background: 'transparent', border: 'none', borderRadius: 12, padding: '13px 26px', fontSize: 15, fontWeight: 600, color: '#fff', textDecoration: 'none', overflow: 'hidden', boxShadow: '0 8px 32px rgba(124,106,247,0.3)', transition: 'all 0.2s ease' },
  heroCtaBg: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#7c6af7,#5b4fd4,#7c6af7)', backgroundSize: '200% 100%', animation: 'gradShift 3s ease infinite' },
  heroSecondary: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 500, color: 'var(--text2)', textDecoration: 'none', transition: 'all 0.2s' },
  heroCard: { width: 220, height: 240, background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.25)', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, backdropFilter: 'blur(12px)', transform: 'perspective(800px) rotateY(-4deg) rotateX(2deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(124,106,247,0.1)', transition: 'all 0.3s ease', cursor: 'default', flexShrink: 0, position: 'relative', overflow: 'hidden' },
  heroCardGlow: { position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(124,106,247,0.8),transparent)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 },
  tip: { position: 'relative', background: 'rgba(124,106,247,0.05)', border: '1px solid rgba(124,106,247,0.15)', borderRadius: 16, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'flex-start', overflow: 'hidden', transition: 'all 0.2s ease', cursor: 'default' },
  tipGlow: { position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(124,106,247,0.6),transparent)' },
};
