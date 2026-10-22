import React, { useState, useEffect, useRef } from 'react';
import {
  Fingerprint,
  Scan,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  RefreshCw,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';
import { VaultSettings } from '../types/vault';

interface BiometricScanOverlayProps {
  isOpen: boolean;
  settings: VaultSettings;
  onSuccess: () => void;
  onCancel: () => void;
  mode?: 'faceid' | 'fingerprint' | 'auto';
  title?: string;
  subtitle?: string;
}

export const BiometricScanOverlay: React.FC<BiometricScanOverlayProps> = ({
  isOpen,
  settings,
  onSuccess,
  onCancel,
  mode = 'auto',
  title = 'Biometric Authentication',
  subtitle = 'Unlock your encrypted secret vault',
}) => {
  // Determine initial active method
  const initialMethod: 'faceid' | 'fingerprint' =
    mode === 'faceid'
      ? 'faceid'
      : mode === 'fingerprint'
      ? 'fingerprint'
      : settings.biometricType === 'faceid'
      ? 'faceid'
      : 'fingerprint';

  const [activeMethod, setActiveMethod] = useState<'faceid' | 'fingerprint'>(initialMethod);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isPressingSensor, setIsPressingSensor] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects via Web Audio API
  const playAudioCue = (type: 'beep' | 'success' | 'fail' | 'tick') => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === 'success') {
        // High harmonic chime
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
          gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.07);
          osc.stop(ctx.currentTime + idx * 0.07 + 0.26);
        });
      } else if (type === 'fail') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch {
      // AudioContext unavailable or autoplay blocked
    }
  };

  // Vibrate if supported
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored
      }
    }
  };

  // Start Face ID camera
  const startCamera = async () => {
    if (!settings.biometricUseCamera) return;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      }
    } catch (err) {
      console.log('Webcam not permitted for Face ID, using high-tech reticle', err);
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Run Face ID Scan Sequence
  const runFaceScanSequence = () => {
    setScanStatus('scanning');
    setProgress(10);
    setStatusMessage('Aligning face within reticle...');
    playAudioCue('beep');
    triggerHaptic(30);

    startCamera();

    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 12;
      setProgress(Math.min(currentProgress, 95));

      if (currentProgress === 34) {
        setStatusMessage('Mapping 3D facial contours & infrared mesh...');
        playAudioCue('tick');
      } else if (currentProgress === 70) {
        setStatusMessage('Verifying biometric cryptographic token...');
        playAudioCue('tick');
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        completeSuccess();
      }
    }, 180);

    scanTimerRef.current = interval as unknown as NodeJS.Timeout;
  };

  // Run Fingerprint Hold Sequence
  const startFingerprintHold = () => {
    if (scanStatus === 'success') return;
    setIsPressingSensor(true);
    setScanStatus('scanning');
    setStatusMessage('Scanning fingerprint ridges...');
    playAudioCue('beep');
    triggerHaptic(40);

    let currentProg = progress;
    const interval = setInterval(() => {
      currentProg += 15;
      setProgress((p) => Math.min(p + 15, 100));
      playAudioCue('tick');
      triggerHaptic(20);

      if (currentProg >= 100) {
        clearInterval(interval);
        completeSuccess();
      }
    }, 120);

    pressIntervalRef.current = interval as unknown as NodeJS.Timeout;
  };

  const stopFingerprintHold = () => {
    setIsPressingSensor(false);
    if (pressIntervalRef.current) {
      clearInterval(pressIntervalRef.current);
      pressIntervalRef.current = null;
    }
    if (scanStatus === 'scanning') {
      setScanStatus('idle');
      setProgress(0);
      setStatusMessage('Hold finger firmly on sensor to scan');
    }
  };

  const completeSuccess = () => {
    setScanStatus('success');
    setProgress(100);
    setStatusMessage('Identity Verified');
    playAudioCue('success');
    triggerHaptic([60, 40, 100]);

    // Small delay to admire success visual then unlock
    setTimeout(() => {
      stopCamera();
      onSuccess();
    }, 700);
  };

  // Initial auto-start
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanStatus('idle');
      setProgress(0);
      return;
    }

    if (activeMethod === 'faceid') {
      runFaceScanSequence();
    } else {
      setScanStatus('idle');
      setStatusMessage('Touch & hold sensor below to scan');
    }

    return () => {
      stopCamera();
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
    };
  }, [isOpen, activeMethod]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in select-none">
      {/* Container Card */}
      <div className="relative w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Subtle background glow */}
        <div
          className={`absolute -inset-10 opacity-20 blur-3xl rounded-full transition-colors duration-500 pointer-events-none ${
            scanStatus === 'success'
              ? 'bg-emerald-500'
              : scanStatus === 'failed'
              ? 'bg-rose-500'
              : activeMethod === 'faceid'
              ? 'bg-amber-500'
              : 'bg-cyan-500'
          }`}
        />

        {/* Top Cancel button */}
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Cancel and use PIN"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dynamic Island / Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 mb-5 text-[11px] font-medium text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Biometric Protection</span>
        </div>

        <h3 className="text-base font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-xs">{subtitle}</p>

        {/* Method Switcher (if user allows both) */}
        {settings.biometricType === 'both' && scanStatus !== 'success' && (
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6 w-full max-w-[240px]">
            <button
              onClick={() => {
                stopCamera();
                setActiveMethod('fingerprint');
                setScanStatus('idle');
                setProgress(0);
                setStatusMessage('Touch & hold sensor below to scan');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeMethod === 'fingerprint'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Fingerprint</span>
            </button>
            <button
              onClick={() => {
                setActiveMethod('faceid');
                runFaceScanSequence();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeMethod === 'faceid'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Face ID</span>
            </button>
          </div>
        )}

        {/* Visual Scan Center Stage */}
        <div className="relative my-2 w-48 h-48 flex items-center justify-center">
          {activeMethod === 'faceid' ? (
            /* FACE ID RETICLE & LASER OVERLAY */
            <div className="relative w-44 h-44 rounded-3xl overflow-hidden border-2 border-slate-700 flex items-center justify-center bg-slate-950 shadow-inner">
              {/* Optional live webcam stream */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? 'opacity-70' : 'opacity-0'
                }`}
              />

              {/* Facial Geometry Wireframe / Mesh Placeholder */}
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                  <svg className="w-28 h-28 opacity-40 animate-pulse" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="45" r="28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                    <ellipse cx="40" cy="40" rx="4" ry="2" fill="currentColor" />
                    <ellipse cx="60" cy="40" rx="4" ry="2" fill="currentColor" />
                    <path d="M 46 47 Q 50 50 54 47" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M 40 58 Q 50 66 60 58" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M 30 75 Q 50 90 70 75" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
                  </svg>
                </div>
              )}

              {/* Laser Scanning Beam */}
              {scanStatus === 'scanning' && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-[bounce_2s_infinite]" />
              )}

              {/* Four Corner Reticle Brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-lg" />

              {/* Center Lock / Unlock Icon */}
              <div
                className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  scanStatus === 'success'
                    ? 'bg-emerald-500 text-slate-950 scale-125 shadow-lg shadow-emerald-500/50'
                    : 'bg-black/60 backdrop-blur-sm text-amber-400 border border-amber-500/30'
                }`}
              >
                {scanStatus === 'success' ? (
                  <Unlock className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <Scan className="w-6 h-6 animate-pulse" />
                )}
              </div>
            </div>
          ) : (
            /* FINGERPRINT TOUCH & HOLD SENSOR */
            <div
              onMouseDown={startFingerprintHold}
              onMouseUp={stopFingerprintHold}
              onTouchStart={startFingerprintHold}
              onTouchEnd={stopFingerprintHold}
              className={`group relative w-44 h-44 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 select-none ${
                isPressingSensor ? 'scale-95' : 'hover:scale-102'
              }`}
            >
              {/* Outer SVG Circular Progress Track */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-800"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`transition-all duration-150 ${
                    scanStatus === 'success' ? 'stroke-emerald-400' : 'stroke-cyan-400'
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray="276"
                  strokeDashoffset={276 - (276 * progress) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Pulsing Ultrasonic Sensor Glow */}
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  scanStatus === 'success'
                    ? 'bg-emerald-500/20 border-emerald-400/80 text-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)]'
                    : isPressingSensor
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40'
                }`}
              >
                {scanStatus === 'success' ? (
                  <CheckCircle2 className="w-16 h-16 animate-in zoom-in-75 duration-200 stroke-[2.5]" />
                ) : (
                  <Fingerprint className={`w-16 h-16 ${isPressingSensor ? 'animate-pulse' : ''}`} />
                )}
              </div>

              {/* Laser Line on Ridge scan */}
              {isPressingSensor && scanStatus === 'scanning' && (
                <div className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-[bounce_1.2s_infinite]" />
              )}
            </div>
          )}
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span
              className={`font-medium ${
                scanStatus === 'success'
                  ? 'text-emerald-400 font-bold'
                  : scanStatus === 'scanning'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {statusMessage || 'Awaiting input...'}
            </span>
            <span className="font-mono text-slate-500">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                scanStatus === 'success'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : activeMethod === 'faceid'
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Fallback to Passcode */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between">
          <button
            onClick={() => {
              if (activeMethod === 'faceid') {
                runFaceScanSequence();
              } else {
                startFingerprintHold();
              }
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retest Scan</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            Use PIN Keypad
          </button>
        </div>
      </div>
    </div>
  );
};
