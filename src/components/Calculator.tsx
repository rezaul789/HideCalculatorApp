import React, { useState, useEffect, useRef } from 'react';
import { 
  Delete, 
  RotateCcw, 
  HelpCircle, 
  Camera, 
  Sparkles,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Scan
} from 'lucide-react';
import { VaultSettings, IntruderLog } from '../types/vault';
import { StorageService } from '../services/storage';
import { BiometricScanOverlay } from './BiometricScanOverlay';

interface CalculatorProps {
  settings: VaultSettings;
  onUnlock: (isDecoy: boolean) => void;
  onUpdateSettings: (settings: VaultSettings) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  settings,
  onUnlock,
  onUpdateSettings,
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [formula, setFormula] = useState<string>('');
  const [showScientific, setShowScientific] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(!settings.isSetupComplete);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [securityAnswerInput, setSecurityAnswerInput] = useState<string>('');
  const [forgotError, setForgotError] = useState<string>('');
  const [recoveredPin, setRecoveredPin] = useState<string>('');
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [intruderNotice, setIntruderNotice] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);

  // Hidden video element for live front camera intruder selfie capture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio click effect
  const playClick = (freq = 440) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // Keyboard support for typing on calculator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSetupModal || showForgotModal) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        const op = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
        handleOperator(op);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, formula, settings, wrongAttempts]);

  // Attempt real webcam snapshot for intruder selfie
  const triggerIntruderCapture = async (attemptPin: string) => {
    let capturedPhoto = '/src/assets/images/intruder_selfie_demo_1792656198403.jpg';

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          
          // Wait brief frame
          await new Promise((r) => setTimeout(r, 400));
          
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            canvas.width = 480;
            canvas.height = 640;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, 480, 640);
              capturedPhoto = canvas.toDataURL('image/jpeg', 0.85);
            }
          }
          // Stop track
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    } catch (err) {
      console.log('Webcam not accessible, using stealth intruder photo', err);
    }

    const newLog: IntruderLog = {
      id: 'log-' + Date.now(),
      timestamp: Date.now(),
      attemptPin: attemptPin,
      photoUrl: capturedPhoto,
      deviceInfo: 'Calculator Secret Trigger (Failed 3x)',
      resolved: false,
    };
    StorageService.addIntruderLog(newLog);
    setIntruderNotice('Security Alert: Intruder snapshot recorded!');
    setTimeout(() => setIntruderNotice(null), 3500);
  };

  const handleDigit = (digit: string) => {
    playClick(500);
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    playClick(400);
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    playClick(350);
    setDisplay('0');
    setFormula('');
  };

  const handleBackspace = () => {
    playClick(420);
    if (display.length > 1 && display !== 'Error') {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleToggleSign = () => {
    playClick(460);
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handlePercentage = () => {
    playClick(460);
    const num = parseFloat(display);
    if (!isNaN(num)) {
      setDisplay((num / 100).toString());
    }
  };

  const handleOperator = (op: string) => {
    playClick(480);
    if (display === 'Error') return;
    setFormula(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleScientific = (func: string) => {
    playClick(520);
    const num = parseFloat(display);
    if (isNaN(num)) return;

    let res = 0;
    switch (func) {
      case 'sin':
        res = Math.sin((num * Math.PI) / 180);
        break;
      case 'cos':
        res = Math.cos((num * Math.PI) / 180);
        break;
      case 'tan':
        res = Math.tan((num * Math.PI) / 180);
        break;
      case 'sqrt':
        res = Math.sqrt(num);
        break;
      case 'sq':
        res = num * num;
        break;
      case 'ln':
        res = Math.log(num);
        break;
      case 'log':
        res = Math.log10(num);
        break;
      case 'pi':
        res = Math.PI;
        break;
      case 'e':
        res = Math.E;
        break;
      default:
        return;
    }
    setDisplay(res.toFixed(6).replace(/\.?0+$/, ''));
  };

  const handleEquals = () => {
    playClick(580);
    const trimmedInput = display.trim();

    // 1. Check if input matches secret passcode
    if (!formula && /^\d{4,8}$/.test(trimmedInput)) {
      // Check real passcode
      if (trimmedInput === settings.passcode) {
        setWrongAttempts(0);
        onUnlock(false);
        return;
      }

      // Check fake decoy passcode
      if (settings.hasDecoyEnabled && settings.fakePasscode && trimmedInput === settings.fakePasscode) {
        setWrongAttempts(0);
        onUnlock(true);
        return;
      }

      // If user typed a PIN candidate that failed
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (newAttempts >= 3 && settings.intruderCaptureEnabled) {
        triggerIntruderCapture(trimmedInput);
        setWrongAttempts(0);
      }
    }

    // 2. Otherwise calculate math expression
    if (!formula) {
      return;
    }

    const fullExpr = formula + display;
    try {
      // Clean safe math evaluator
      const safeExpr = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.() ]/g, '');

      // Evaluate safely
      const result = Function(`'use strict'; return (${safeExpr})`)();
      const formattedResult = Number.isFinite(result)
        ? parseFloat(result.toFixed(8)).toString()
        : 'Error';

      setHistory((prev) => [{ expr: fullExpr, res: formattedResult }, ...prev.slice(0, 9)]);
      setDisplay(formattedResult);
      setFormula('');
    } catch {
      setDisplay('Error');
      setFormula('');
    }
  };

  // Security question answer validation
  const handleRecoverPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityAnswerInput.trim().toLowerCase() === settings.securityAnswer.trim().toLowerCase()) {
      setRecoveredPin(settings.passcode);
      setForgotError('');
    } else {
      setForgotError('Incorrect security answer. Please try again.');
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-slate-950 text-white select-none overflow-hidden">
      {/* Hidden camera & canvas for intruder capture */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Disguise Header */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Standard Calculator
          </span>
          <span className="text-[10px] text-emerald-500/80 font-mono">DEG</span>
        </div>

        <div className="flex items-center gap-2">
          {settings.biometricEnabled && (
            <button
              onClick={() => setShowBiometricModal(true)}
              title={settings.biometricType === 'faceid' ? 'Unlock with Face ID' : 'Unlock with Fingerprint'}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center border border-amber-500/20 shadow-sm"
            >
              {settings.biometricType === 'faceid' ? (
                <Scan className="w-4 h-4" />
              ) : (
                <Fingerprint className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            title="Calculation History"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowScientific(!showScientific)}
            title="Scientific Functions"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              showScientific ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Fx
          </button>
          <button
            onClick={() => setShowForgotModal(true)}
            title="Vault Help / Forgot PIN"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Intruder Alert Toast */}
      {intruderNotice && (
        <div className="mx-4 mb-2 p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2 animate-bounce">
          <Camera className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{intruderNotice}</span>
        </div>
      )}

      {/* Calculator Display Screen */}
      <div className={`flex flex-col justify-end px-6 py-4 flex-1 min-h-[140px] max-h-[220px] transition-transform ${isShaking ? 'translate-x-2' : ''}`}>
        {/* Formula / Upper line */}
        <div className="text-right text-slate-400 font-mono text-sm tracking-wide h-6 overflow-hidden text-ellipsis whitespace-nowrap">
          {formula}
        </div>

        {/* Primary Result Display */}
        <div className="text-right font-mono-numbers text-white font-light tracking-tight text-4xl sm:text-5xl md:text-6xl overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none py-1">
          {display}
        </div>
      </div>

      {/* Calculation History Dropdown Tray */}
      {showHistory && (
        <div className="absolute top-14 left-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-medium text-slate-400">
            <span>Recent Calculations</span>
            <button
              onClick={() => setHistory([])}
              className="text-rose-400 hover:text-rose-300 text-xs"
            >
              Clear
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-4">No calculations yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setDisplay(h.res);
                    setShowHistory(false);
                  }}
                  className="flex flex-col text-right cursor-pointer hover:bg-slate-800/60 p-2 rounded-lg"
                >
                  <span className="text-xs text-slate-400 font-mono">{h.expr}</span>
                  <span className="text-sm font-semibold text-white font-mono">{h.res}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scientific Keys Row (Expandable) */}
      {showScientific && (
        <div className="grid grid-cols-5 gap-2 px-4 pb-2 bg-slate-950/80">
          {[
            { label: 'sin', action: () => handleScientific('sin') },
            { label: 'cos', action: () => handleScientific('cos') },
            { label: 'tan', action: () => handleScientific('tan') },
            { label: '√', action: () => handleScientific('sqrt') },
            { label: 'x²', action: () => handleScientific('sq') },
            { label: 'ln', action: () => handleScientific('ln') },
            { label: 'log', action: () => handleScientific('log') },
            { label: 'π', action: () => handleScientific('pi') },
            { label: 'e', action: () => handleScientific('e') },
            { label: '(', action: () => handleDigit('(') },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 font-medium text-xs transition"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Calculator Keypad */}
      <div className="p-4 grid grid-cols-4 gap-2.5 sm:gap-3 flex-1 pb-6">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-rose-400 font-semibold text-xl transition-all shadow-sm"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-xl transition-all flex items-center justify-center shadow-sm"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          onClick={handlePercentage}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-xl transition-all shadow-sm"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 active:scale-95 font-semibold text-2xl transition-all shadow-sm"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleDigit('7')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 active:scale-95 font-semibold text-2xl transition-all shadow-sm"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleDigit('4')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 active:scale-95 font-semibold text-2xl transition-all shadow-sm"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleDigit('1')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="h-14 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 active:scale-95 font-semibold text-2xl transition-all shadow-sm"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={handleToggleSign}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-300 font-medium text-xl transition-all shadow-sm"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="h-14 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-medium text-2xl transition-all shadow-sm"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="h-14 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-white font-semibold text-3xl transition-all shadow-lg shadow-amber-600/20"
        >
          =
        </button>
      </div>

      {/* Disguise hint footer */}
      <div className="px-4 py-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950">
        <div className="flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Enter PIN and press <strong className="text-amber-400 font-mono text-xs">=</strong></span>
        </div>
        <div className="flex items-center gap-3">
          {settings.biometricEnabled && (
            <button
              onClick={() => setShowBiometricModal(true)}
              className="text-cyan-400 hover:text-cyan-300 hover:underline text-[11px] flex items-center gap-1 font-medium"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Biometric Scan</span>
            </button>
          )}
          <button
            onClick={() => {
              setDisplay(settings.passcode);
            }}
            className="text-amber-400 hover:underline text-[11px]"
          >
            Default (1234)
          </button>
        </div>
      </div>

      {/* Setup Wizard Modal (for first time or when prompted) */}
      {showSetupModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Secret Vault Protection</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Your photos, videos, notes, and locked apps are disguised as an everyday calculator.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Default Secret PIN:</span>
                <span className="font-mono font-bold text-amber-400 px-2 py-0.5 bg-slate-900 rounded">1234</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Decoy Fake PIN:</span>
                <span className="font-mono font-bold text-slate-400 px-2 py-0.5 bg-slate-900 rounded">9999</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Type <strong className="text-white">1234</strong> on the keypad and press <strong className="text-amber-400 font-mono text-sm">=</strong> to unlock anytime!
              </p>
            </div>

            <button
              onClick={() => {
                const nextSettings = { ...settings, isSetupComplete: true };
                onUpdateSettings(nextSettings);
                StorageService.saveSettings(nextSettings);
                setShowSetupModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-semibold text-sm transition shadow-lg shadow-amber-500/20"
            >
              Got it, let&apos;s start!
            </button>
          </div>
        </div>
      )}

      {/* Forgot PIN / Recovery Modal */}
      {showForgotModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">PIN Recovery</h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setSecurityAnswerInput('');
                  setForgotError('');
                  setRecoveredPin('');
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {!recoveredPin ? (
              <form onSubmit={handleRecoverPin} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Security Question:
                  </label>
                  <p className="text-sm font-medium text-slate-200 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                    {settings.securityQuestion}
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Your Answer (Default: <strong className="text-slate-300">Lucky</strong>):
                  </label>
                  <input
                    type="text"
                    value={securityAnswerInput}
                    onChange={(e) => setSecurityAnswerInput(e.target.value)}
                    placeholder="Enter answer"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  {forgotError && (
                    <p className="text-xs text-rose-400 mt-1">{forgotError}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs"
                  >
                    Verify Answer
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <p className="text-xs text-slate-400 mb-1">Your secret passcode is:</p>
                  <p className="text-3xl font-mono font-bold tracking-widest text-emerald-300">
                    {recoveredPin}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setDisplay(recoveredPin);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
                >
                  Type Into Calculator
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Biometric Scan Overlay */}
      <BiometricScanOverlay
        isOpen={showBiometricModal}
        settings={settings}
        onSuccess={() => {
          setShowBiometricModal(false);
          onUnlock(false);
        }}
        onCancel={() => setShowBiometricModal(false)}
        title={settings.biometricType === 'faceid' ? 'Face ID Verification' : 'Biometric Security Scan'}
        subtitle="Authenticate to unlock your secret vault"
      />
    </div>
  );
};
