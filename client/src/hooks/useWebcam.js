import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebcam = () => {
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      setError('');
    } catch (err) {
      setError('Camera access denied. Please allow camera access.');
      setActive(false);
    }
  }, []);

  // Attach stream to video element whenever active changes or videoRef is set
  useEffect(() => {
    if (active && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [active]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, active, error, startCamera, stopCamera, streamRef };
};
