import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchHistory } from '../api/interview';

export default function History() {
  const { getToken } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory(getToken).then(d => setInterviews(d.interviews || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? interviews : interviews.filter(i => i.status === filter);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <div style={s.badge}>Interview History</div>
            <h1 style={s.title}>Your <span style={s.grad}>Sessions</span></h1>
            <p style={s.sub}>{interviews.length} total interview{interviews.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/interview/new" style={s.newBtn}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(124,106,247,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(124,106,247,0.25)'; }}>
            <div style={s.newBtnBg} />
            <span style={{ position:'relative', zIndex:1 }}>+ New Interview</span>
          </Link>
        </div>

        <div style={s.filters}>
          {[
            { k:'all', l:'All', c: interviews.length },
            { k:'completed', l:'Completed', c: interviews.filter(i=>i.status==='completed').length },
            { k:'in_progress', l:'In Progress', c: interviews.filter(i=>i.status==='in_progress').length },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              onMouseEnter={e => { if (filter !== f.k) e.currentTarget.style.borderColor='rgba(124,106,247,0.3)'; }}
              onMouseLeave={e => { if (filter !== f.k) e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
              style={{ position:'relative', display:'flex', alignItems:'center', gap:8, padding:'8px 18px', border:`1px solid ${filter===f.k ? 'rgba(124,106,247,0.4)' : 'rgba(255,255,255,0.07)'}`, background: filter===f.k ? 'rgba(124,106,247,0.12)' : 'rgba(255,255,255,0.03)', borderRadius:20, fontSize:13, fontWeight:500, color: filter===f.k ? '#fff' : 'var(--text2)', cursor:'pointer', overflow:'hidden', transition:'all 0.2s' }}>
              {filter===f.k && <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(124,106,247,0.15),rgba(34,211,238,0.05))' }} />}
              <span style={{ position:'relative', zIndex:1 }}>{f.l}</span>
              <span style={{ position:'relative', zIndex:1, background:'rgba(255,255,255,0.08)', padding:'1px 7px', borderRadius:10, fontSize:11, fontWeight:700 }}>{f.c}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ height:170, borderRadius:20, background:'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 24px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <div style={{ fontSize:18, color:'var(--text2)', marginBottom:16 }}>No interviews found</div>
            <Link to="/interview/new" style={{ display:'inline-flex', background:'linear-gradient(135deg,#7c6af7,#5b4fd4)', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:600, color:'#fff', textDecoration:'none' }}>Start one now →</Link>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((iv, i) => <HistCard key={iv.sessionId} iv={iv} delay={i * 0.05} />)}
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      `}</style>
    </div>
  );
}

function HistCard({ iv, delay }) {
  const [hov, setHov] = useState(false);
  const done = iv.status === 'completed';
  const link = done ? `/interview/${iv.sessionId}/report` : `/interview/${iv.sessionId}`;
  const score = iv.report?.overallScore;
  const sc = score >= 8 ? '#4ade80' : score >= 5 ? '#fb923c' : '#f87171';
  const rec = iv.report?.recommendation;
  const recC = { Hire:'#4ade80', Consider:'#fb923c', 'Not Ready':'#f87171' }[rec] || 'var(--text3)';
  const date = new Date(iv.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  return (
    <Link to={link} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position:'relative', background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)', border:`1px solid ${hov ? 'rgba(124,106,247,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius:20, padding:'22px', textDecoration:'none', display:'flex', flexDirection:'column', gap:12, overflow:'hidden', animation:`slideUp 0.4s ${delay}s ease forwards`, opacity:0, transition:'all 0.25s ease', transform: hov ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hov ? '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(124,106,247,0.1)' : 'none' }}>
      {/* Top accent line */}
      <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:`linear-gradient(90deg,transparent,${hov ? 'rgba(124,106,247,0.7)' : 'rgba(124,106,247,0.3)'},transparent)`, transition:'all 0.3s' }} />
      {/* Score ring bg */}
      {score && <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:`radial-gradient(circle,${sc}15,transparent 70%)`, pointerEvents:'none', transition:'opacity 0.3s', opacity: hov ? 1 : 0.5 }} />}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#fff', lineHeight:1.3 }}>{iv.role}</div>
        {score && <div style={{ fontSize:28, fontWeight:900, color:sc, lineHeight:1, flexShrink:0 }}>{score}<span style={{ fontSize:12, color:'var(--text3)', fontWeight:400 }}>/10</span></div>}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{ background:'rgba(124,106,247,0.15)', color:'var(--accent2)', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{iv.level}</span>
        <span style={{ fontSize:13, color:'var(--text2)' }}>{iv.techStack}</span>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--text3)' }}>{date}</span>
        <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:4, border:'1px solid', color: done ? '#4ade80' : '#fb923c', background: done ? 'rgba(74,222,128,0.1)' : 'rgba(251,146,60,0.1)', borderColor: done ? 'rgba(74,222,128,0.3)' : 'rgba(251,146,60,0.3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
          {done ? 'Completed' : 'In Progress'}
        </span>
      </div>

      {rec && <div style={{ fontSize:13, color:'var(--text3)', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:10 }}>
        Verdict: <strong style={{ color:recC }}>{rec}</strong>
      </div>}
    </Link>
  );
}

const s = {
  page: { minHeight:'calc(100vh - 68px)', padding:'24px 16px', position:'relative', zIndex:1 },
  container: { maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:28 },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 },
  badge: { display:'inline-flex', background:'rgba(124,106,247,0.12)', border:'1px solid rgba(124,106,247,0.25)', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:600, color:'var(--accent2)', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:8 },
  title: { fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-0.5px', marginBottom:4 },
  grad: { background:'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  sub: { fontSize:14, color:'var(--text2)' },
  newBtn: { position:'relative', display:'inline-flex', alignItems:'center', background:'transparent', border:'none', borderRadius:12, padding:'12px 24px', fontSize:14, fontWeight:600, color:'#fff', textDecoration:'none', overflow:'hidden', flexShrink:0, boxShadow:'0 8px 24px rgba(124,106,247,0.25)', transition:'all 0.2s' },
  newBtnBg: { position:'absolute', inset:0, background:'linear-gradient(135deg,#7c6af7,#5b4fd4,#7c6af7)', backgroundSize:'200% 100%', animation:'gradShift 3s ease infinite' },
  filters: { display:'flex', gap:8, flexWrap:'wrap' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 },
};
