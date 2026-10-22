import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryCharging,
  Maximize2,
  Minimize2,
  Lock,
  Smartphone,
  Monitor
} from 'lucide-react';
import { VaultSettings } from '../types/vault';

interface PhoneFrameProps {
  children: React.ReactNode;
  isLocked: boolean;
  onPanicLock: () => void;
  settings: VaultSettings;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isLocked,
  onPanicLock,
  settings,
}) => {
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  // Live phone clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Panic hotkey: press Escape anytime to lock immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLocked) {
        onPanicLock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, onPanicLock]);

  // Shake detection on physical devices
  useEffect(() => {
    if (!settings.shakeToLock || isLocked) return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current || current.x === null) return;

      const now = Date.now();
      if (now - lastTime > 100) {
        const diffTime = now - lastTime;
        lastTime = now;

        const delta =
          Math.abs(current.x + (current.y ?? 0) + (current.z ?? 0) - lastX - lastY - lastZ);
        const speed = (delta / diffTime) * 10000;

        if (speed > 800) {
          onPanicLock();
        }

        lastX = current.x;
        lastY = current.y ?? 0;
        lastZ = current.z ?? 0;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [settings.shakeToLock, isLocked, onPanicLock]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none overflow-x-hidden">
      {/* Desktop Helper Toolbar */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-4xl mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Calculator Vault Clone</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            Secret PIN: <strong className="text-white font-mono">{settings.passcode}</strong> followed by <strong className="text-amber-400 font-mono text-sm">=</strong>
          </span>
          {settings.hasDecoyEnabled && (
            <span className="text-slate-500">
              · Decoy PIN: <strong className="text-slate-300 font-mono">{settings.fakePasscode}</strong>=
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isLocked && (
            <button
              onClick={onPanicLock}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold flex items-center gap-1.5 transition border border-rose-500/30"
              title="Panic button: Instantly lock and show calculator"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Panic Lock (Esc)</span>
            </button>
          )}

          <button
            onClick={() => setIsPhoneMode(!isPhoneMode)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
          >
            {isPhoneMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>Expanded Canvas</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Phone Bezel View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`w-full transition-all duration-300 flex flex-col justify-center items-center ${
          isPhoneMode
            ? 'max-w-[410px] h-screen sm:h-[840px] max-h-[96vh] sm:rounded-[42px] sm:border-[10px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative'
            : 'max-w-5xl h-screen sm:h-[85vh] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative'
        }`}
      >
        {/* Phone Notch / Status Bar */}
        <div className="w-full bg-slate-950 text-slate-300 px-6 pt-2 pb-1.5 flex items-center justify-between text-xs font-semibold shrink-0 select-none z-30">
          <span className="font-mono text-[11px] tracking-tight">{currentTime}</span>

          {/* Speaker / Camera Notch if phone mode */}
          {isPhoneMode && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">5G</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Main Phone Screen Viewport */}
        <div className="w-full flex-1 flex flex-col overflow-hidden relative bg-slate-950">
          {children}
        </div>

        {/* Home Navigation Indicator Bar (at bottom of smartphone) */}
        {isPhoneMode && (
          <div
            onClick={!isLocked ? onPanicLock : undefined}
            className={`w-full bg-slate-950 py-1.5 flex justify-center items-center shrink-0 ${
              !isLocked ? 'cursor-pointer hover:bg-slate-900' : ''
            }`}
            title={!isLocked ? 'Tap home bar to lock vault' : ''}
          >
            <div className="w-32 h-1 bg-slate-700 hover:bg-slate-500 rounded-full transition" />
          </div>
        )}
      </div>
    </div>
  );
};
