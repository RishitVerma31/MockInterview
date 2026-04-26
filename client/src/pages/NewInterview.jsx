import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startInterview } from '../api/interview';

const ROLES = ['Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','DevOps Engineer','Mobile Developer','ML Engineer','Product Manager'];
const LEVELS = [
  { label:'Junior', years:'0–2 yrs', color:'#4ade80', icon:'🌱' },
  { label:'Mid-level', years:'2–5 yrs', color:'#22d3ee', icon:'⚡' },
  { label:'Senior', years:'5–8 yrs', color:'#a78bfa', icon:'🔥' },
  { label:'Lead', years:'8–12 yrs', color:'#fb923c', icon:'🚀' },
  { label:'Principal', years:'12+ yrs', color:'#f87171', icon:'👑' },
];
const STACKS = ['React','Vue','Angular','Node.js','Python','Java','Go','TypeScript','AWS','Kubernetes','Django','Spring Boot','Flutter','Rust','GraphQL','Redis'];

export default function NewInterview() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [level, setLevel] = useState('');
  const [stack, setStack] = useState([]);
  const [customStack, setCustomStack] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const toggleStack = s => setStack(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const finalRole = role === 'custom' ? customRole.trim() : role;
  const stackList = [...stack, ...(customStack.trim() ? customStack.split(',').map(s => s.trim()).filter(Boolean) : [])];
  const canGo = s => s === 1 ? !!finalRole : s === 2 ? !!level : stackList.length > 0;

  const handleStart = async () => {
    if (!finalRole || !level || !stackList.length) { setError('Please complete all steps'); return; }
    setError(''); setLoading(true);
    try {
      const { sessionId } = await startInterview({ role: finalRole, level, techStack: stackList.join(', ') }, getToken);
      navigate(`/interview/${sessionId}`);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Floating decorations */}
      <div style={{ position: 'fixed', top: '15%', right: '5%', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(124,106,247,0.08)', animation: 'spinSlow 25s linear infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '15%', right: '5%', width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(34,211,238,0.06)', animation: 'spinSlow 15s linear infinite reverse', pointerEvents: 'none' }} />

      <div style={s.container}>
        <div style={s.header}>
          <div style={s.badge}>Configure Interview</div>
          <h1 style={s.title}>Build Your<br /><span style={s.titleGrad}>Perfect Interview</span></h1>
          <p style={s.sub}>AI generates questions tailored to your exact role and experience</p>
        </div>

        {/* Steps */}
        <div style={s.steps}>
          {['Job Role','Experience','Tech Stack'].map((lbl, i) => {
            const n = i + 1, done = step > n, active = step === n;
            return (
              <React.Fragment key={n}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor: done ? 'pointer' : 'default' }} onClick={() => done && setStep(n)}>
                  <div style={{ width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, position:'relative', transition:'all 0.3s',
                    background: active ? 'linear-gradient(135deg,#7c6af7,#5b4fd4)' : done ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                    border: active ? 'none' : done ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: active ? '#fff' : done ? '#4ade80' : 'var(--text3)',
                    boxShadow: active ? '0 0 24px rgba(124,106,247,0.5)' : 'none',
                  }}>
                    {done ? '✓' : n}
                    {active && <div style={{ position:'absolute', inset:-5, borderRadius:'50%', border:'1px solid rgba(124,106,247,0.4)', animation:'glow 2s ease-in-out infinite' }} />}
                  </div>
                  <span style={{ fontSize:12, fontWeight:500, color: active ? '#fff' : done ? 'var(--accent2)' : 'var(--text3)', transition:'color 0.3s' }}>{lbl}</span>
                </div>
                {i < 2 && <div style={{ flex:1, height:1, background: done ? 'linear-gradient(90deg,#4ade80,#22d3ee)' : 'rgba(255,255,255,0.06)', marginBottom:24, transition:'background 0.5s' }} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Panel */}
        <div style={s.panel}>
          <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:'linear-gradient(90deg,transparent,rgba(124,106,247,0.6),rgba(34,211,238,0.4),transparent)' }} />

          {step === 1 && (
            <div style={{ animation:'slideUp 0.35s ease' }}>
              <h2 className="step-title" style={s.stepTitle}>What role are you interviewing for?</h2>
              <div style={s.chipGrid}>
                {ROLES.map(r => <Chip key={r} label={r} active={role===r} onClick={() => { setRole(r); setCustomRole(''); }} />)}
                <Chip label="✏️ Custom" active={role==='custom'} onClick={() => setRole('custom')} />
              </div>
              {role === 'custom' && (
                <input autoFocus style={s.input} placeholder="e.g. Site Reliability Engineer" value={customRole} onChange={e => setCustomRole(e.target.value)} />
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ animation:'slideUp 0.35s ease' }}>
              <h2 className="step-title" style={s.stepTitle}>What's your experience level?</h2>
              <div style={s.levelGrid}>
                {LEVELS.map(l => (
                  <div key={l.label} onClick={() => setLevel(l.label)}
                    onMouseEnter={e => { if (level !== l.label) { e.currentTarget.style.borderColor = l.color + '50'; e.currentTarget.style.transform = 'translateY(-4px)'; }}}
                    onMouseLeave={e => { if (level !== l.label) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
                    style={{ position:'relative', padding:'22px 16px', borderRadius:18, border:`1px solid ${level===l.label ? l.color+'60' : 'rgba(255,255,255,0.07)'}`, background: level===l.label ? l.color+'0d' : 'rgba(255,255,255,0.03)', cursor:'pointer', textAlign:'center', transition:'all 0.2s', overflow:'hidden',
                      boxShadow: level===l.label ? `0 0 30px ${l.color}20, 0 8px 24px rgba(0,0,0,0.3)` : 'none',
                      transform: level===l.label ? 'translateY(-4px)' : 'translateY(0)',
                    }}>
                    {level===l.label && <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 0%,${l.color}18,transparent 70%)`, pointerEvents:'none' }} />}
                    {level===l.label && <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:`linear-gradient(90deg,transparent,${l.color},transparent)` }} />}
                    <div style={{ fontSize:24, marginBottom:8 }}>{l.icon}</div>
                    <div style={{ fontSize:15, fontWeight:700, color: level===l.label ? '#fff' : 'var(--text2)', marginBottom:4 }}>{l.label}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{l.years}</div>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:l.color, margin:'10px auto 0', boxShadow:`0 0 8px ${l.color}`, opacity: level===l.label ? 1 : 0.4 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation:'slideUp 0.35s ease' }}>
              <h2 className="step-title" style={s.stepTitle}>Select your tech stack <span style={{ fontSize:14, color:'var(--text3)', fontWeight:400 }}>({stack.length} selected)</span></h2>
              <div style={s.chipGrid}>
                {STACKS.map(t => <Chip key={t} label={t} active={stack.includes(t)} onClick={() => toggleStack(t)} />)}
              </div>
              <input style={{ ...s.input, marginTop:12 }} placeholder="Add more (comma-separated): Redis, GraphQL..." value={customStack} onChange={e => setCustomStack(e.target.value)} />
            </div>
          )}

          {/* Summary */}
          {(finalRole || level || stack.length > 0) && (
            <div style={s.summary}>
              <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Summary:</span>
              {finalRole && <Tag label={finalRole} color="#7c6af7" />}
              {level && <Tag label={level} color="#22d3ee" />}
              {stack.map(t => <Tag key={t} label={t} color="#4ade80" />)}
            </div>
          )}

          {error && <div style={s.error}><span>⚠️</span>{error}</div>}

          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s-1)}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 20px', color:'var(--text2)', fontSize:14, fontWeight:500, transition:'all 0.2s' }}>
                ← Back
              </button>
            )}
            <div style={{ flex:1 }} />
            {step < 3 ? (
              <button onClick={() => canGo(step) && setStep(s => s+1)}
                onMouseEnter={e => { if (canGo(step)) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(124,106,247,0.5)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(124,106,247,0.3)'; }}
                style={{ position:'relative', border:'none', borderRadius:12, padding:'13px 32px', fontSize:15, fontWeight:600, color:'#fff', cursor: canGo(step) ? 'pointer' : 'not-allowed', overflow:'hidden', opacity: canGo(step) ? 1 : 0.4, boxShadow:'0 8px 24px rgba(124,106,247,0.3)', transition:'all 0.2s' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#7c6af7,#5b4fd4,#7c6af7)', backgroundSize:'200% 100%', animation:'gradShift 3s ease infinite' }} />
                <span style={{ position:'relative', zIndex:1 }}>Continue →</span>
              </button>
            ) : (
              <button onClick={handleStart} disabled={loading || !canGo(3)}
                onMouseEnter={e => { if (!loading && canGo(3)) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(124,106,247,0.5)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(124,106,247,0.3)'; }}
                style={{ position:'relative', border:'none', borderRadius:12, padding:'13px 32px', fontSize:15, fontWeight:600, color:'#fff', cursor: (!loading && canGo(3)) ? 'pointer' : 'not-allowed', overflow:'hidden', opacity: (!loading && canGo(3)) ? 1 : 0.5, boxShadow:'0 8px 24px rgba(124,106,247,0.3)', transition:'all 0.2s' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#7c6af7,#5b4fd4,#7c6af7)', backgroundSize:'200% 100%', animation:'gradShift 3s ease infinite' }} />
                <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8 }}>
                  {loading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />Generating...</> : '🚀 Start Interview'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(124,106,247,0.3)}50%{box-shadow:0 0 50px rgba(124,106,247,0.6)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        
        @media (max-width: 768px) {
          .step-title { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position:'relative', padding:'8px 16px', borderRadius:20, border:`1px solid ${active ? 'rgba(124,106,247,0.5)' : hov ? 'rgba(124,106,247,0.3)' : 'rgba(255,255,255,0.08)'}`, background: active ? 'rgba(124,106,247,0.15)' : hov ? 'rgba(124,106,247,0.08)' : 'rgba(255,255,255,0.04)', color: active ? '#fff' : hov ? 'var(--accent3)' : 'var(--text2)', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.18s ease', transform: hov && !active ? 'translateY(-1px)' : 'translateY(0)', boxShadow: active ? '0 0 16px rgba(124,106,247,0.2)' : 'none', overflow:'hidden' }}>
      {active && <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(124,106,247,0.2),rgba(34,211,238,0.1))', borderRadius:20 }} />}
      <span style={{ position:'relative', zIndex:1 }}>{label}</span>
    </button>
  );
}

function Tag({ label, color }) {
  return <span style={{ background: color + '20', color, border: `1px solid ${color}30`, padding:'3px 10px', borderRadius:6, fontSize:12, fontWeight:600 }}>{label}</span>;
}

const s = {
  page: { minHeight:'calc(100vh - 68px)', padding:'24px 16px', position:'relative', zIndex:1 },
  container: { maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:32 },
  header: { textAlign:'center', display:'flex', flexDirection:'column', gap:10, alignItems:'center' },
  badge: { display:'inline-flex', background:'rgba(124,106,247,0.12)', border:'1px solid rgba(124,106,247,0.25)', borderRadius:20, padding:'5px 16px', fontSize:12, fontWeight:600, color:'var(--accent2)', letterSpacing:'0.5px', textTransform:'uppercase' },
  title: { fontSize:40, fontWeight:900, color:'#fff', lineHeight:1.15, letterSpacing:'-0.5px' },
  titleGrad: { background:'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  sub: { fontSize:15, color:'var(--text2)', maxWidth:400 },
  steps: { display:'flex', alignItems:'center', justifyContent:'center', gap:0 },
  panel: { position:'relative', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, padding:'24px 20px', overflow:'hidden' },
  stepTitle: { fontSize:20, fontWeight:700, color:'#fff', marginBottom:20 },
  chipGrid: { display:'flex', flexWrap:'wrap', gap:8 },
  levelGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:12 },
  input: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 16px', color:'#fff', fontSize:14, outline:'none', width:'100%', transition:'border-color 0.2s' },
  summary: { display:'flex', flexWrap:'wrap', gap:6, padding:'14px 16px', background:'rgba(124,106,247,0.05)', border:'1px solid rgba(124,106,247,0.12)', borderRadius:10, marginTop:20, alignItems:'center' },
  error: { background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'10px 14px', color:'#fca5a5', fontSize:13, display:'flex', gap:8, marginTop:12 },
};
