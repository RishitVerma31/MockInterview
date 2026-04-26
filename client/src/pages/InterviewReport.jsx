import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchInterview } from '../api/interview';

export default function InterviewReport() {
  const { sessionId } = useParams();
  const { getToken } = useAuth();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [scoreVisible, setScoreVisible] = useState(false);
  const scoreRef = useRef(null);

  useEffect(() => {
    fetchInterview(sessionId, getToken).then(d => setInterview(d.interview)).catch(console.error).finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (!loading && interview) setTimeout(() => setScoreVisible(true), 300);
  }, [loading, interview]);

  if (loading) return <Loader />;
  if (!interview) return <div style={{ padding:40, color:'var(--red)' }}>Not found</div>;

  const { report, answers = [], role, level, techStack } = interview;
  const date = new Date(interview.completedAt || interview.createdAt).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const recColor = { Hire:'#4ade80', Consider:'#fb923c', 'Not Ready':'#f87171' }[report?.recommendation] || 'var(--text2)';
  const sc = report?.overallScore >= 8 ? '#4ade80' : report?.overallScore >= 5 ? '#fb923c' : '#f87171';
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (scoreVisible ? (report?.overallScore / 10) * circumference : circumference);

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link to="/history" style={{ fontSize:13, color:'var(--accent2)' }}>History</Link>
          <span style={{ fontSize:13, color:'var(--text3)' }}>/</span>
          <span style={{ fontSize:13, color:'var(--text3)' }}>Report</span>
        </div>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={s.title}>{role} <span style={s.grad}>Report</span></h1>
            <p style={{ fontSize:14, color:'var(--text2)', marginTop:4 }}>{level} · {techStack} · {date}</p>
          </div>
          <Link to="/interview/new" style={s.newBtn}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(124,106,247,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(124,106,247,0.25)'; }}>
            <div style={s.newBtnBg} />
            <span style={{ position:'relative', zIndex:1 }}>+ New Interview</span>
          </Link>
        </div>

        {/* Score hero */}
        {report && (
          <div style={s.hero}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 80% at 5% 50%,rgba(124,106,247,0.1) 0%,transparent 60%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:1, background:'linear-gradient(90deg,transparent,rgba(124,106,247,0.6),rgba(34,211,238,0.4),transparent)' }} />

            {/* Animated SVG ring */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="65" cy="65" r="52" fill="none" stroke={sc} strokeWidth="10"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round" transform="rotate(-90 65 65)"
                  style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter:`drop-shadow(0 0 10px ${sc})` }} />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:32, fontWeight:900, color:sc, lineHeight:1 }}>{report.overallScore}</span>
                <span style={{ fontSize:12, color:'var(--text3)' }}>/10</span>
              </div>
            </div>

            <div style={{ width:1, height:80, background:'rgba(255,255,255,0.07)', flexShrink:0 }} />

            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'inline-flex', alignSelf:'flex-start', padding:'7px 18px', borderRadius:20, border:`1px solid ${recColor}40`, background:`${recColor}12`, color:recColor, fontSize:14, fontWeight:700, letterSpacing:'0.5px' }}>
                {report.recommendation === 'Hire' ? '🎉' : report.recommendation === 'Consider' ? '🤔' : '📚'} {report.recommendation}
              </div>
              <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.7 }}>{report.summary}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.03)', borderRadius:12, padding:4, alignSelf:'flex-start' }}>
          {[{ k:'overview', l:'📊 Overview' }, { k:'answers', l:'💬 Q&A Review' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ position:'relative', padding:'9px 22px', border:'none', background:'transparent', color: tab===t.k ? '#fff' : 'var(--text2)', fontSize:14, fontWeight:500, borderRadius:9, cursor:'pointer', overflow:'hidden', transition:'color 0.2s' }}>
              {tab===t.k && <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(124,106,247,0.2),rgba(34,211,238,0.1))', border:'1px solid rgba(124,106,247,0.3)', borderRadius:9 }} />}
              <span style={{ position:'relative', zIndex:1 }}>{t.l}</span>
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && report && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <GlassCard title="✅ Top Strengths">
              {(report.topStrengths||[]).map((str,i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', flexShrink:0, marginTop:6, boxShadow:'0 0 6px #4ade80' }} />
                  {str}
                </div>
              ))}
            </GlassCard>
            <GlassCard title="📈 Areas to Improve">
              {(report.areasToImprove||[]).map((a,i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#fb923c', flexShrink:0, marginTop:6, boxShadow:'0 0 6px #fb923c' }} />
                  {a}
                </div>
              ))}
            </GlassCard>
            <GlassCard title="🚀 Next Steps" full>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.7 }}>{report.nextSteps}</p>
            </GlassCard>
            <GlassCard title="📋 Question Scores" full>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {answers.map((a,i) => {
                  const sc2 = a.feedback?.score || 0;
                  const c = sc2 >= 8 ? '#4ade80' : sc2 >= 5 ? '#fb923c' : '#f87171';
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <span style={{ fontSize:12, color:'var(--text3)', fontWeight:700, width:24, flexShrink:0 }}>Q{i+1}</span>
                      <div style={{ flex:1, height:8, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width: sc2*10+'%', background:`linear-gradient(90deg,${c},${c}99)`, borderRadius:4, boxShadow:`0 0 8px ${c}60`, transition:'width 1s ease' }} />
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:c, width:36, textAlign:'right', flexShrink:0 }}>{sc2}/10</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Q&A */}
        {tab === 'answers' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {answers.map((a,i) => <QACard key={i} index={i} qa={a} />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      `}</style>
    </div>
  );
}

function GlassCard({ title, children, full }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position:'relative', background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)', border:`1px solid ${hov ? 'rgba(124,106,247,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius:20, padding:'22px', overflow:'hidden', gridColumn: full ? '1 / -1' : 'auto', transition:'all 0.2s ease', transform: hov ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.3)' : 'none' }}>
      <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:`linear-gradient(90deg,transparent,${hov ? 'rgba(124,106,247,0.6)' : 'rgba(124,106,247,0.3)'},transparent)`, transition:'all 0.3s' }} />
      <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:16 }}>{title}</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{children}</div>
    </div>
  );
}

function QACard({ index, qa }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);
  const score = qa.feedback?.score || 0;
  const sc = score >= 8 ? '#4ade80' : score >= 5 ? '#fb923c' : '#f87171';
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)', border:`1px solid ${hov ? 'rgba(124,106,247,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius:16, overflow:'hidden', transition:'all 0.2s ease', transform: hov ? 'translateY(-2px)' : 'translateY(0)' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:'100%', background:'transparent', border:'none', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', gap:16, textAlign:'left' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, flex:1 }}>
          <span style={{ background:'rgba(124,106,247,0.2)', color:'var(--accent2)', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700, flexShrink:0 }}>Q{index+1}</span>
          <span style={{ fontSize:14, color:'#fff', fontWeight:500, lineHeight:1.5 }}>{qa.question}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <span style={{ fontSize:16, fontWeight:700, color:sc }}>{score}/10</span>
          <span style={{ fontSize:10, color:'var(--text3)', transition:'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', display:'inline-block' }}>▼</span>
        </div>
      </button>
      {open && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px', display:'flex', flexDirection:'column', gap:16, animation:'slideUp 0.25s ease' }}>
          <Section label="Your Answer" text={qa.answer} />
          {qa.feedback && <>
            <Section label="Feedback" text={qa.feedback.feedback} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <MiniCard label="✅ Strengths" text={qa.feedback.strengths} color="#4ade80" />
              <MiniCard label="📈 Improvements" text={qa.feedback.improvements} color="#fb923c" />
            </div>
            {qa.feedback.sampleAnswer && (
              <div style={{ background:'rgba(124,106,247,0.06)', border:'1px solid rgba(124,106,247,0.15)', borderRadius:10, padding:'14px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--accent2)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>💡 Sample Answer</div>
                <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>{qa.feedback.sampleAnswer}</p>
              </div>
            )}
          </>}
        </div>
      )}
    </div>
  );
}

function Section({ label, text }) {
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>{label}</div>
      <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.7 }}>{text}</p>
    </div>
  );
}

function MiniCard({ label, text, color }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'12px', border:`1px solid ${color}20` }}>
      <div style={{ fontSize:11, fontWeight:700, color, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
      <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, border:'3px solid rgba(124,106,247,0.2)', borderTopColor:'#7c6af7', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'var(--text2)' }}>Loading report...</p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'calc(100vh - 68px)', padding:'40px 24px', position:'relative', zIndex:1 },
  container: { maxWidth:960, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 },
  title: { fontSize:32, fontWeight:900, color:'#fff', letterSpacing:'-0.5px' },
  grad: { background:'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  newBtn: { position:'relative', display:'inline-flex', alignItems:'center', background:'transparent', border:'none', borderRadius:12, padding:'11px 22px', fontSize:14, fontWeight:600, color:'#fff', textDecoration:'none', overflow:'hidden', flexShrink:0, boxShadow:'0 8px 24px rgba(124,106,247,0.25)', transition:'all 0.2s' },
  newBtnBg: { position:'absolute', inset:0, background:'linear-gradient(135deg,#7c6af7,#5b4fd4,#7c6af7)', backgroundSize:'200% 100%', animation:'gradShift 3s ease infinite' },
  hero: { position:'relative', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, padding:'32px 36px', display:'flex', gap:32, alignItems:'center', flexWrap:'wrap', overflow:'hidden' },
};
