import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Shield,
  Fingerprint,
  Grid,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  MessageCircle,
  Camera,
  Image as ImageIcon,
  Globe,
  CreditCard,
  Send,
  Music,
  Mail,
  Settings as SettingsIcon,
  FileText,
  MessageSquare,
  DollarSign,
  Scan
} from 'lucide-react';
import { LockedApp, VaultSettings } from '../../types/vault';
import { StorageService } from '../../services/storage';
import { BiometricScanOverlay } from '../BiometricScanOverlay';

interface AppLockerProps {
  apps: LockedApp[];
  settings: VaultSettings;
  onAppsUpdated: (apps: LockedApp[]) => void;
}

export const AppLocker: React.FC<AppLockerProps> = ({
  apps,
  settings,
  onAppsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'lock' | 'hide'>('lock');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simulatedApp, setSimulatedApp] = useState<LockedApp | null>(null);
  const [isUnlockedForSession, setIsUnlockedForSession] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [lockError, setLockError] = useState<string>('');
  const [lockType, setLockType] = useState<'pin' | 'fingerprint' | 'pattern'>('pin');
  const [showBiometricOverlay, setShowBiometricOverlay] = useState<boolean>(false);

  // Toggle app lock status
  const toggleLock = (appId: string) => {
    const updated = apps.map((app) =>
      app.id === appId ? { ...app, isLocked: !app.isLocked } : app
    );
    StorageService.saveApps(updated);
    onAppsUpdated(updated);
  };

  // Toggle app hide status
  const toggleHide = (appId: string) => {
    const updated = apps.map((app) =>
      app.id === appId ? { ...app, isHidden: !app.isHidden } : app
    );
    StorageService.saveApps(updated);
    onAppsUpdated(updated);
  };

  // Launch simulated app
  const launchApp = (app: LockedApp) => {
    setSimulatedApp(app);
    setIsUnlockedForSession(!app.isLocked);
    setEnteredPin('');
    setLockError('');
  };

  // Check pin unlock
  const handlePinSubmit = (digit: string) => {
    const next = enteredPin + digit;
    setEnteredPin(next);
    if (next.length === 4) {
      if (next === settings.passcode) {
        setIsUnlockedForSession(true);
        setLockError('');
      } else {
        setLockError('Incorrect Passcode');
        setTimeout(() => {
          setEnteredPin('');
          setLockError('');
        }, 800);
      }
    }
  };

  const handleFingerprintUnlock = () => {
    setShowBiometricOverlay(true);
  };

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageCircle': return <MessageCircle className="w-5 h-5" />;
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Image': return <ImageIcon className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5" />;
      case 'Send': return <Send className="w-5 h-5" />;
      case 'Music': return <Music className="w-5 h-5" />;
      case 'Mail': return <Mail className="w-5 h-5" />;
      case 'Settings': return <SettingsIcon className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5" />;
      default: return <Grid className="w-5 h-5" />;
    }
  };

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lockedCount = apps.filter((a) => a.isLocked).length;
  const hiddenCount = apps.filter((a) => a.isHidden).length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Smart AppLock &amp; App Hider</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {lockedCount} apps secured with PIN · {hiddenCount} hidden from launcher
            </p>
          </div>

          {/* Quick Lock All / Unlock All */}
          <button
            onClick={() => {
              const allLocked = apps.every((a) => a.isLocked);
              const updated = apps.map((a) => ({ ...a, isLocked: !allLocked }));
              StorageService.saveApps(updated);
              onAppsUpdated(updated);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
          >
            {apps.every((a) => a.isLocked) ? 'Unlock All' : 'Lock All'}
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('lock')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'lock'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>App Lock ({lockedCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('hide')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'hide'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide Apps ({hiddenCount})</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-900 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search installed applications..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-500 text-xs hover:text-white">
            ✕
          </button>
        )}
      </div>

      {/* Apps List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            onClick={() => launchApp(app)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-900/60 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: app.color + '22', color: app.color }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
              >
                {getAppIcon(app.icon)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{app.name}</span>
                  {app.isHidden && (
                    <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-1 rounded">
                      Hidden
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {app.packageId} · Tap to test launch
                </p>
              </div>
            </div>

            {/* Toggle Action */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {activeTab === 'lock' ? (
                <button
                  onClick={() => toggleLock(app.id)}
                  className={`p-2 rounded-xl border transition ${
                    app.isLocked
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                  title={app.isLocked ? 'Locked (Tap to unlock)' : 'Unlocked (Tap to lock)'}
                >
                  {app.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  onClick={() => toggleHide(app.id)}
                  className={`p-2 rounded-xl border transition ${
                    app.isHidden
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                      : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                  title={app.isHidden ? 'Hidden from home screen' : 'Visible on home screen'}
                >
                  {app.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simulated App Launch / Lock Screen Modal */}
      {simulatedApp && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in select-none">
          {/* Top Header */}
          <div className="flex items-center justify-between text-white py-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{simulatedApp.name}</span>
              {simulatedApp.isLocked && !isUnlockedForSession && (
                <span className="text-amber-400 font-mono text-[10px]">(Protected)</span>
              )}
            </span>
            <button
              onClick={() => {
                setSimulatedApp(null);
                setIsUnlockedForSession(false);
              }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* If LOCKED and NOT UNLOCKED yet: Display authentic AppLock PIN / Biometric screen */}
          {!isUnlockedForSession ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-xs mx-auto w-full text-center">
              <div
                style={{ backgroundColor: simulatedApp.color + '25', color: simulatedApp.color }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 border border-white/10"
              >
                {getAppIcon(simulatedApp.icon)}
              </div>
              <h3 className="text-base font-bold text-white mb-0.5">{simulatedApp.name}</h3>
              <p className="text-xs text-slate-400 mb-6 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Protected by Calculator Vault</span>
              </p>

              {/* PIN Dots */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      enteredPin.length > idx
                        ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  />
                ))}
              </div>

              {lockError && (
                <p className="text-xs text-rose-400 mb-4 animate-shake">{lockError}</p>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 w-full mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinSubmit(digit)}
                    className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-medium text-lg border border-slate-800 transition"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={handleFingerprintUnlock}
                  className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-emerald-400 flex items-center justify-center border border-slate-800 transition"
                  title="Simulate Fingerprint Unlock"
                >
                  <Fingerprint className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handlePinSubmit('0')}
                  className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-medium text-lg border border-slate-800 transition"
                >
                  0
                </button>
                <button
                  onClick={() => setEnteredPin(enteredPin.slice(0, -1))}
                  className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-400 flex items-center justify-center border border-slate-800 transition text-xs font-semibold"
                >
                  DEL
                </button>
              </div>

              <p className="text-[10px] text-slate-500">
                Use your secret PIN ({settings.passcode}) or tap the fingerprint sensor
              </p>
            </div>
          ) : (
            /* IF UNLOCKED: Display the authentic simulated app screen! */
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full p-4">
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div
                    style={{ backgroundColor: simulatedApp.color + '25', color: simulatedApp.color }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                  >
                    {getAppIcon(simulatedApp.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{simulatedApp.name}</h4>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Session Unlocked
                    </span>
                  </div>
                </div>

                {/* Simulated Content based on app type */}
                {simulatedApp.simulatedScreenType === 'finance' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400">Total Checking &amp; Crypto</span>
                      <p className="text-xl font-bold font-mono text-emerald-400">$48,920.50</p>
                      <span className="text-[10px] text-emerald-500">+4.2% this month</span>
                    </div>
                    <div className="text-xs space-y-2">
                      <div className="flex justify-between text-slate-300">
                        <span>Wire Transfer · Tech Corp</span>
                        <span className="font-mono text-emerald-400">+$12,500.00</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Cloud Servers Cloudflare</span>
                        <span className="font-mono text-slate-400">-$240.00</span>
                      </div>
                    </div>
                  </div>
                ) : simulatedApp.simulatedScreenType === 'chat' ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-white block">Alex (Confidential)</strong>
                        <span className="text-slate-400 text-[11px]">The files are stored inside the vault.</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">10:42 AM</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-white block">Secret Channel 🤫</strong>
                        <span className="text-slate-400 text-[11px]">Encrypted end-to-end backup ready.</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Yesterday</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl text-center space-y-2">
                    <Shield className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">
                      {simulatedApp.name} is running securely.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Unlocking verified. When you exit back to the calculator, it will immediately re-lock automatically!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSimulatedApp(null);
                    setIsUnlockedForSession(false);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Close &amp; Lock App
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="py-2 text-center text-[10px] text-slate-500">
            Calculator Lock AppLocker Engine
          </div>
        </div>
      )}

      {/* Biometric Scan Overlay for AppLock */}
      <BiometricScanOverlay
        isOpen={showBiometricOverlay}
        settings={settings}
        title={`Authenticate for ${simulatedApp?.name || 'Locked App'}`}
        subtitle="Verify biometric identity to launch protected application"
        onSuccess={() => {
          setShowBiometricOverlay(false);
          setIsUnlockedForSession(true);
        }}
        onCancel={() => setShowBiometricOverlay(false)}
      />
    </div>
  );
};
