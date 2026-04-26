// InterviewSession — video interview with mandatory camera, TTS questions, gaze proctoring
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchInterview, submitAnswer, completeInterview } from '../api/interview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useWebcam } from '../hooks/useWebcam';
import { useProctoring } from '../hooks/useProctoring';
import { useTTS } from '../hooks/useTTS';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [interimText, setInterimText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [latestAlert, setLatestAlert] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const answerRef = useRef('');
  const alertTimerRef = useRef(null);

  const { videoRef, active: cameraActive, error: cameraError, startCamera } = useWebcam();
  const { speak, stop: stopSpeaking } = useTTS();

  const handleViolation = useCallback((msg) => {
    setLatestAlert(msg);
    clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => setLatestAlert(''), 4000);
  }, []);

  const { status: proctoringStatus, violations, modelsLoaded, calibrated } = useProctoring({
    videoRef, active: cameraActive, onViolation: handleViolation,
  });

  const { listening, supported: speechSupported, startListening, stopListening } = useSpeechRecognition({
    onTranscript: ({ final, interim }) => {
      if (final) {
        const updated = answerRef.current + final;
        answerRef.current = updated;
        setAnswer(updated);
        setInterimText('');
      } else {
        setInterimText(interim);
      }
    },
  });

  // Load interview data
  useEffect(() => {
    fetchInterview(sessionId, getToken)
      .then((d) => {
        const iv = d.interview;
        setInterview(iv);
        if (iv.answers?.length > 0) {
          setAnsweredQuestions(iv.answers);
          setCurrentIdx(Math.min(iv.answers.length, iv.questions.length - 1));
        }
      })
      .catch(() => setPageError('Failed to load interview'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Auto-start camera once data loads
  useEffect(() => {
    if (!loading) {
      startCamera().then(() => setCameraReady(true)).catch(() => setCameraReady(false));
    }
    return () => { stopListening(); stopSpeaking(); };
  }, [loading]);

  // Speak question on change
  useEffect(() => {
    if (interview && cameraActive) {
      const q = interview.questions[currentIdx];
      if (q) {
        stopSpeaking();
        const t = setTimeout(() => speak('Question ' + (currentIdx + 1) + '. ' + q.question), 500);
        return () => clearTimeout(t);
      }
    }
  }, [currentIdx, interview, cameraActive]);

  const handleToggleMic = () => {
    if (listening) stopListening();
    else { answerRef.current = answer; startListening(); }
  };

  const handleSubmitAnswer = async () => {
    const finalAnswer = answer.trim();
    if (!finalAnswer) { setPageError('Please speak or type an answer before submitting'); return; }
    if (listening) stopListening();
    stopSpeaking();
    setInterimText(''); setPageError(''); setSubmitting(true);
    try {
      const { feedback: fb } = await submitAnswer(
        sessionId,
        { questionId: currentQ.id, question: currentQ.question, answer: finalAnswer },
        getToken
      );
      setFeedback(fb);
      setAnsweredQuestions((prev) => [...prev, { questionId: currentQ.id, question: currentQ.question, answer: finalAnswer, feedback: fb }]);
    } catch (e) {
      setPageError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setFeedback(null); setAnswer(''); setInterimText(''); answerRef.current = ''; setPageError('');
    setCurrentIdx((i) => i + 1);
  };

  const handleComplete = async () => {
    setCompleting(true); stopSpeaking();
    try {
      await completeInterview(sessionId, getToken);
      navigate('/interview/' + sessionId + '/report', { state: { violations } });
    } catch (e) {
      setPageError(e.message); setCompleting(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────
  if (loading) return <LoadingScreen text="Loading interview..." />;
  if (pageError && !interview) return <ErrorScreen message={pageError} />;

  // Camera gate — blocks access until camera is on
  if (!cameraActive) {
    return (
      <div style={gate.page}>
        <div style={gate.card}>
          <div style={gate.icon}>📷</div>
          <h2 style={gate.title}>Camera Required</h2>
          <p style={gate.text}>
            Camera access is mandatory for this interview. It is used for identity verification
            and proctoring. Please allow camera access to continue.
          </p>
          {cameraError && <div style={gate.error}>{cameraError}</div>}
          <button style={gate.btn} onClick={() => startCamera().then(() => setCameraReady(true))}>
            Enable Camera &amp; Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const questions = interview.questions || [];
  const currentQ = questions[currentIdx];
  const isAnswered = answeredQuestions.some((a) => a.questionId === currentQ?.id);
  const currentFeedback = answeredQuestions.find((a) => a.questionId === currentQ?.id)?.feedback;
  const allAnswered = answeredQuestions.length >= questions.length;
  const activeFeedback = feedback || currentFeedback;
  const statusColor = { ok: '#22c55e', warning: '#f59e0b', violation: '#ef4444' }[proctoringStatus] || '#5a5a72';
  const statusLabel = calibrated
    ? ({ ok: 'Eyes on screen', warning: 'Look at screen!', violation: 'Violation!' }[proctoringStatus] || 'Monitoring...')
    : (modelsLoaded ? 'Calibrating... look at screen' : 'Loading AI...');

  return (
    <div style={s.page}>
      {latestAlert && (
        <div style={s.alertBanner}>
          <span style={{ fontSize: 18 }}>🚨</span> {latestAlert}
        </div>
      )}

      <div style={s.container}>
        {/* Top bar */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>{interview.role}</h1>
            <p style={s.meta}>{interview.level} · {interview.techStack}</p>
          </div>
          <div style={s.topRight}>
            {violations.length > 0 && (
              <div style={s.violationCount}>🚨 {violations.length} violation{violations.length !== 1 ? 's' : ''}</div>
            )}
            <div style={s.progressWrap}>
              <span style={s.progressText}>{answeredQuestions.length}/{questions.length} answered</span>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: (answeredQuestions.length / questions.length * 100) + '%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="main-grid" style={s.mainGrid}>
          {/* Left — webcam */}
          <div className="left-col" style={s.leftCol}>
            <div style={s.videoWrap}>
              <video ref={videoRef} autoPlay muted playsInline style={s.video} />
              <div style={s.videoOverlay}><div style={s.recDot} /><span style={s.recText}>LIVE</span></div>
              {listening && <div style={s.listeningBadge}><span style={s.micPulse}>🎙</span> Listening...</div>}
              <div style={{ ...s.proctoringBadge, borderColor: statusColor, color: statusColor }}>
                <span style={{ ...s.procDot, background: statusColor }} />
                {statusLabel}
              </div>
            </div>

            {/* Violations log */}
            {violations.length > 0 && (
              <div style={s.violationsLog}>
                <div style={s.violationsTitle}>Proctoring Log</div>
                {violations.slice(-5).map((v, i) => (
                  <div key={i} style={s.violationEntry}>
                    <span style={s.violationTime}>{v.time}</span>
                    <span style={s.violationMsg}>{v.msg}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Question nav dots */}
            <div style={s.qNav}>
              {questions.map((q, i) => {
                const done = answeredQuestions.some((a) => a.questionId === q.id);
                return (
                  <button key={q.id}
                    onClick={() => { if (!listening) { setCurrentIdx(i); setFeedback(null); setAnswer(''); answerRef.current = ''; } }}
                    style={{ ...s.qDot, ...(i === currentIdx ? s.qDotActive : {}), ...(done ? s.qDotDone : {}) }}>
                    {done ? '✓' : i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — question + answer */}
          <div style={s.rightCol}>
            <div style={s.questionCard}>
              <div style={s.qHeader}>
                <span style={s.qNum}>Question {currentIdx + 1} of {questions.length}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => speak('Question ' + (currentIdx + 1) + '. ' + currentQ.question)} style={s.replayBtn}>
                    🔊 Replay
                  </button>
                  <span style={{ ...s.qType, background: currentQ.type === 'technical' ? 'rgba(124,106,247,0.15)' : 'rgba(34,197,94,0.1)', color: currentQ.type === 'technical' ? 'var(--accent-light)' : 'var(--success)' }}>
                    {currentQ.type}
                  </span>
                </div>
              </div>
              <p style={s.questionText}>{currentQ.question}</p>
            </div>

            {!isAnswered && (
              <div style={s.answerSection}>
                <div style={s.answerHeader}>
                  <label style={s.answerLabel}>Your Answer</label>
                  {speechSupported && (
                    <button onClick={handleToggleMic} style={{ ...s.micBtn, ...(listening ? s.micBtnActive : {}) }} disabled={submitting}>
                      {listening ? '⏹ Stop' : '🎙 Speak'}
                    </button>
                  )}
                </div>
                <div style={s.transcriptBox}>
                  <span style={s.transcriptFinal}>{answer}</span>
                  <span style={s.transcriptInterim}>{interimText}</span>
                  {!answer && !interimText && (
                    <span style={s.transcriptPlaceholder}>
                      {listening ? 'Listening... speak your answer' : 'Click 🎙 Speak to answer with voice, or type below'}
                    </span>
                  )}
                </div>
                <textarea style={s.textarea} placeholder="Or type / edit your answer here..."
                  value={answer} onChange={(e) => { setAnswer(e.target.value); answerRef.current = e.target.value; }}
                  rows={4} disabled={submitting} />
                {pageError && <div style={s.error}>{pageError}</div>}
                <button onClick={handleSubmitAnswer} style={s.submitBtn} disabled={submitting || (!answer.trim() && !interimText)}>
                  {submitting ? <span style={s.loadingWrap}><span style={s.spinner} /> Analysing...</span> : 'Submit Answer'}
                </button>
              </div>
            )}

            {activeFeedback && <FeedbackCard feedback={activeFeedback} />}

            {isAnswered && (
              <div style={s.navRow}>
                {currentIdx < questions.length - 1 ? (
                  <button onClick={handleNext} style={s.nextBtn}>Next Question →</button>
                ) : allAnswered ? (
                  <button onClick={handleComplete} style={s.completeBtn} disabled={completing}>
                    {completing ? 'Generating Report...' : '🏁 Complete & Get Report'}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes micPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
        @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
        
        @media (min-width: 769px) {
          .main-grid { grid-template-columns: 300px 1fr !important; }
          .left-col { position: sticky !important; top: 80px !important; }
        }
      `}</style>
    </div>
  );
}

function FeedbackCard({ feedback }) {
  const scoreColor = feedback.score >= 8 ? 'var(--success)' : feedback.score >= 5 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={s.feedbackCard}>
      <div style={s.feedbackHeader}>
        <span style={s.feedbackTitle}>AI Feedback</span>
        <div style={{ ...s.scoreCircle, borderColor: scoreColor, color: scoreColor }}>
          {feedback.score}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/10</span>
        </div>
      </div>
      <p style={s.feedbackText}>{feedback.feedback}</p>
      <div style={s.feedbackGrid}>
        <div style={{ ...s.feedbackBlock, borderColor: 'rgba(34,197,94,0.2)' }}>
          <div style={{ ...s.feedbackBlockLabel, color: 'var(--success)' }}>Strengths</div>
          <p style={s.feedbackBlockText}>{feedback.strengths}</p>
        </div>
        <div style={{ ...s.feedbackBlock, borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ ...s.feedbackBlockLabel, color: 'var(--warning)' }}>Improvements</div>
          <p style={s.feedbackBlockText}>{feedback.improvements}</p>
        </div>
      </div>
      {feedback.sampleAnswer && (
        <div style={s.sampleAnswer}>
          <div style={s.sampleLabel}>Sample Answer</div>
          <p style={s.sampleText}>{feedback.sampleAnswer}</p>
        </div>
      )}
    </div>
  );
}

function LoadingScreen({ text }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>{text || 'Loading...'}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--danger)' }}>{message}</p>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const gate = {
  page: { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  icon: { fontSize: 52, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' },
  text: { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, width: '100%' },
  btn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8, width: '100%' },
};

const s = {
  page: { minHeight: 'calc(100vh - 64px)', background: 'var(--bg-primary)', padding: '24px', position: 'relative' },
  alertBanner: { position: 'fixed', top: 64, left: 0, right: 0, zIndex: 999, background: 'rgba(239,68,68,0.95)', color: '#fff', padding: '12px 24px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown 0.3s ease', boxShadow: '0 4px 20px rgba(239,68,68,0.4)' },
  container: { maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 },
  meta: { fontSize: 13, color: 'var(--text-secondary)' },
  topRight: { display: 'flex', alignItems: 'center', gap: 16 },
  violationCount: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  progressWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  progressText: { fontSize: 13, color: 'var(--text-secondary)' },
  progressBar: { width: 160, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: 20, alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 12 },
  videoWrap: { position: 'relative', width: '100%', aspectRatio: '4/3', background: '#0a0a0f', borderRadius: 'var(--radius)', overflow: 'hidden', border: '2px solid var(--accent)' },
  video: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' },
  videoOverlay: { position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 20 },
  recDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s ease-in-out infinite' },
  recText: { fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '1px' },
  listeningBadge: { position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: 'rgba(124,106,247,0.9)', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' },
  micPulse: { animation: 'micPulse 1s ease-in-out infinite', display: 'inline-block' },
  proctoringBadge: { position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', border: '1px solid', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' },
  procDot: { width: 6, height: 6, borderRadius: '50%' },
  violationsLog: { background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 },
  violationsTitle: { fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 },
  violationEntry: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  violationTime: { fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 },
  violationMsg: { fontSize: 11, color: '#fca5a5', lineHeight: 1.4 },
  qNav: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  qDot: { width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
  qDotActive: { border: '2px solid var(--accent)', color: 'var(--accent-light)', background: 'var(--accent-glow)' },
  qDotDone: { background: 'rgba(34,197,94,0.1)', border: '1px solid var(--success)', color: 'var(--success)' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  questionCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' },
  qHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  qNum: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
  replayBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' },
  qType: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' },
  questionText: { fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 500 },
  answerSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  answerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  answerLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' },
  micBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  micBtnActive: { background: 'rgba(124,106,247,0.2)', border: '1px solid var(--accent)', color: 'var(--accent-light)' },
  transcriptBox: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', minHeight: 80, fontSize: 15, lineHeight: 1.7 },
  transcriptFinal: { color: 'var(--text-primary)' },
  transcriptInterim: { color: 'var(--text-muted)', fontStyle: 'italic' },
  transcriptPlaceholder: { color: 'var(--text-muted)', fontSize: 14 },
  textarea: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, resize: 'vertical', outline: 'none', width: '100%' },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: '#f87171', fontSize: 13 },
  submitBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  loadingWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  feedbackCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  feedbackHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  feedbackTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },
  scoreCircle: { width: 52, height: 52, borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, flexShrink: 0, gap: 1 },
  feedbackText: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 },
  feedbackGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  feedbackBlock: { background: 'var(--bg-secondary)', border: '1px solid', borderRadius: 'var(--radius-sm)', padding: '12px' },
  feedbackBlockLabel: { fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' },
  feedbackBlockText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 },
  sampleAnswer: { background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.15)', borderRadius: 'var(--radius-sm)', padding: '14px' },
  sampleLabel: { fontSize: 11, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' },
  sampleText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 },
  navRow: { display: 'flex', justifyContent: 'flex-end' },
  nextBtn: { background: 'var(--bg-card)', border: '1px solid var(--accent)', color: 'var(--accent-light)', padding: '11px 24px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  completeBtn: { background: 'var(--accent)', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
};
