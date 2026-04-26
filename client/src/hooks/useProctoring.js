import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
const INTERVAL_MS = 1200;
const CALIB_FRAMES = 10;
const FLAG_FRAMES = 3; // consecutive bad frames needed to flag

export const useProctoring = ({ videoRef, active, onViolation }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('idle');
  const [calibrated, setCalibrated] = useState(false);
  const [violations, setViolations] = useState([]);

  const intervalRef = useRef(null);
  const noFaceRef = useRef(0);
  const sideRef = useRef(0);
  const downRef = useRef(0);
  const baselineRef = useRef(null);
  const calibBuf = useRef([]);

  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ]).then(() => setModelsLoaded(true)).catch(console.warn);
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) { flag('⚠️ Tab switch detected'); setStatus('violation'); }
    };
    document.addEventListener('visibilitychange', onHide);
    const noCtx = (e) => e.preventDefault();
    document.addEventListener('contextmenu', noCtx);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      document.removeEventListener('contextmenu', noCtx);
    };
  }, []);

  const flag = useCallback((msg) => {
    onViolation?.(msg);
    setViolations((p) => {
      if (p.length && p[p.length - 1].msg === msg) return p;
      return [...p, { msg, time: new Date().toLocaleTimeString() }];
    });
  }, [onViolation]);

  useEffect(() => {
    if (!modelsLoaded || !active) return;
    calibBuf.current = [];
    baselineRef.current = null;
    setCalibrated(false);
    noFaceRef.current = 0;
    sideRef.current = 0;
    downRef.current = 0;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const W = video.videoWidth  || video.clientWidth  || 640;
        const H = video.videoHeight || video.clientHeight || 480;

        const all = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4, inputSize: 320 }))
          .withFaceLandmarks(true);

        // ── No face ──────────────────────────────────────────────────
        if (all.length === 0) {
          noFaceRef.current++;
          if (noFaceRef.current >= FLAG_FRAMES) {
            flag('⚠️ No face detected — stay in frame');
            setStatus('violation');
          }
          return;
        }
        noFaceRef.current = 0;

        if (all.length > 1) { flag('⚠️ Multiple people detected'); setStatus('violation'); }

        // Largest face
        const det = all.reduce((b, c) => c.detection.box.area > b.detection.box.area ? c : b);
        const box = det.detection.box;
        const lm  = det.landmarks;

        // ── Key landmarks ────────────────────────────────────────────
        const leftEye  = lm.getLeftEye();
        const rightEye = lm.getRightEye();
        const nose     = lm.getNose();
        const jaw      = lm.getJawOutline();

        const lEyeC  = avg(leftEye);
        const rEyeC  = avg(rightEye);
        const noseTip = nose[6];          // tip of nose
        const noseBridge = nose[0];       // top of nose bridge
        const chinPt = jaw[8];            // bottom of chin
        const jawL   = jaw[0];            // left jaw edge
        const jawR   = jaw[16];           // right jaw edge

        // Inter-ocular distance (reliable normalisation unit)
        const iod = dist(lEyeC, rEyeC);

        // ── HEAD YAW (left/right turn) ───────────────────────────────
        // Method 1: eye midpoint vs nose tip horizontal offset
        const eyeMidX = (lEyeC.x + rEyeC.x) / 2;
        const yawByNose = (noseTip.x - eyeMidX) / iod;

        // Method 2: jaw asymmetry — at 90° one side of jaw disappears
        const jawMidX = (jawL.x + jawR.x) / 2;
        const jawAsym = (jawMidX - eyeMidX) / iod;

        // Method 3: face box width vs height ratio
        // Frontal face: width ≈ height. Profile: width << height
        const boxRatio = box.width / box.height; // drops sharply when turning

        // Combined yaw score — any one of these being extreme is enough
        const yawScore = Math.max(Math.abs(yawByNose), Math.abs(jawAsym));

        // ── HEAD PITCH (up/down tilt) ────────────────────────────────
        // Nose tip Y relative to eye midpoint, normalised by IOD
        const eyeMidY = (lEyeC.y + rEyeC.y) / 2;
        const pitchByNose = (noseTip.y - eyeMidY) / iod;

        // Chin drop: how far chin is below eyes, normalised
        const chinDrop = (chinPt.y - eyeMidY) / iod;

        // ── Snapshot ─────────────────────────────────────────────────
        const snap = { yawScore, pitchByNose, chinDrop, boxRatio };

        // ── Calibration ──────────────────────────────────────────────
        if (!baselineRef.current) {
          calibBuf.current.push(snap);
          setStatus('idle');
          if (calibBuf.current.length >= CALIB_FRAMES) {
            const buf = calibBuf.current;
            baselineRef.current = {
              yawScore:    median(buf.map(f => f.yawScore)),
              pitchByNose: median(buf.map(f => f.pitchByNose)),
              chinDrop:    median(buf.map(f => f.chinDrop)),
              boxRatio:    median(buf.map(f => f.boxRatio)),
            };
            setCalibrated(true);
            setStatus('ok');
          }
          return;
        }

        // ── Detection (delta from baseline) ──────────────────────────
        const b = baselineRef.current;

        // How much each metric deviated from neutral
        const dYaw   = yawScore    - b.yawScore;       // positive = turned more
        const dPitch = pitchByNose - b.pitchByNose;    // positive = looking down
        const dChin  = chinDrop    - b.chinDrop;       // positive = chin dropped
        const dRatio = b.boxRatio  - boxRatio;         // positive = face narrowed (turned)

        // Thresholds — calibration-relative so camera position doesn't matter
        // At 90° turn: dYaw ≈ 0.8–1.5, dRatio ≈ 0.3–0.5
        // At 45° turn: dYaw ≈ 0.4–0.7, dRatio ≈ 0.15–0.25
        // Normal sway: dYaw < 0.2, dRatio < 0.1
        const isTurnedSide = dYaw > 0.28 || dRatio > 0.18;

        // Looking down at phone: nose drops AND chin drops
        const isLookingDown = dPitch > 0.35 && dChin > 0.25;

        if (isTurnedSide) {
          sideRef.current++;
          downRef.current = 0;
          if (sideRef.current >= FLAG_FRAMES) {
            const msg = '⚠️ Head turned away — look at the screen';
            setStatus('violation');
            flag(msg);
          } else {
            setStatus('warning');
          }
        } else if (isLookingDown) {
          downRef.current++;
          sideRef.current = 0;
          if (downRef.current >= FLAG_FRAMES) {
            const msg = '⚠️ Looking down — possible phone use';
            setStatus('violation');
            flag(msg);
          } else {
            setStatus('warning');
          }
        } else {
          sideRef.current = 0;
          downRef.current = 0;
          setStatus('ok');
        }

      } catch (_) { /* ignore per-frame errors */ }
    }, INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded, active]);

  return { status, violations, modelsLoaded, calibrated };
};

function avg(pts) {
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
}
