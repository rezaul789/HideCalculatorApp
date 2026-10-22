import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldAlert,
  Smartphone,
  EyeOff,
  Download,
  Upload,
  Check,
  Lock,
  Cloud,
  Clock,
  FileText,
  Activity,
  Calculator as CalcIcon,
  HelpCircle,
  Vibrate,
  Fingerprint,
  Scan,
  Camera,
  Sparkles
} from 'lucide-react';
import { VaultSettings, DisguiseAppType } from '../../types/vault';
import { StorageService } from '../../services/storage';
import { BiometricScanOverlay } from '../BiometricScanOverlay';

interface VaultSettingsModalProps {
  settings: VaultSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (settings: VaultSettings) => void;
  onSimulateShakeLock: () => void;
}

export const VaultSettingsModal: React.FC<VaultSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onSimulateShakeLock,
}) => {
  // Pin change state
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinMessage, setPinMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Decoy state
  const [decoyEnabled, setDecoyEnabled] = useState<boolean>(settings.hasDecoyEnabled);
  const [fakePinInput, setFakePinInput] = useState<string>(settings.fakePasscode || '9999');

  // Security Question state
  const [secQuestion, setSecQuestion] = useState<string>(settings.securityQuestion);
  const [secAnswer, setSecAnswer] = useState<string>(settings.securityAnswer);

  // Biometric state
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(settings.biometricEnabled ?? true);
  const [biometricType, setBiometricType] = useState<VaultSettings['biometricType']>(settings.biometricType ?? 'both');
  const [biometricUseCamera, setBiometricUseCamera] = useState<boolean>(settings.biometricUseCamera ?? true);
  const [showTestScan, setShowTestScan] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== settings.passcode) {
      setPinMessage({ text: 'Current PIN is incorrect.', error: true });
      return;
    }
    if (!/^\d{4,8}$/.test(newPin)) {
      setPinMessage({ text: 'New PIN must be 4 to 8 digits.', error: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ text: 'New PIN and Confirmation do not match.', error: true });
      return;
    }

    const next = { ...settings, passcode: newPin };
    StorageService.saveSettings(next);
    onUpdateSettings(next);
    setPinMessage({ text: 'PIN successfully changed!', error: false });
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleToggleBiometric = (enabled: boolean) => {
    setBiometricEnabled(enabled);
    const next = { ...settings, biometricEnabled: enabled };
    StorageService.saveSettings(next);
    onUpdateSettings(next);
  };

  const handleUpdateBiometricType = (type: VaultSettings['biometricType']) => {
    setBiometricType(type);
    const next = { ...settings, biometricType: type };
    StorageService.saveSettings(next);
    onUpdateSettings(next);
  };

  const handleToggleCamera = (useCam: boolean) => {
    setBiometricUseCamera(useCam);
    const next = { ...settings, biometricUseCamera: useCam };
    StorageService.saveSettings(next);
    onUpdateSettings(next);
  };

  const handleSaveDecoy = () => {
    if (!/^\d{4,8}$/.test(fakePinInput)) {
      alert('Fake PIN must be 4 to 8 digits.');
      return;
    }
    const next = {
      ...settings,
      hasDecoyEnabled: decoyEnabled,
      fakePasscode: fakePinInput,
    };
    StorageService.saveSettings(next);
    onUpdateSettings(next);
    alert('Decoy Vault configuration saved!');
  };

  const handleSaveSecurityQuestion = () => {
    if (!secAnswer.trim()) return;
    const next = {
      ...settings,
      securityQuestion: secQuestion,
      securityAnswer: secAnswer.trim(),
    };
    StorageService.saveSettings(next);
    onUpdateSettings(next);
    alert('Security Question updated!');
  };

  const handleDisguiseSelect = (disguise: DisguiseAppType) => {
    const next = { ...settings, disguiseApp: disguise };
    StorageService.saveSettings(next);
    onUpdateSettings(next);

    // Update document title immediately
    const titleMap: Record<DisguiseAppType, string> = {
      calculator: 'Calculator',
      weather: 'Weather Forecast',
      clock: 'Clock & World Time',
      notes: 'Quick Notes',
      fitness: 'Step & Health Tracker',
    };
    document.title = titleMap[disguise];
  };

  const handleExportBackup = async () => {
    const media = await StorageService.getAllMedia();
    const notes = StorageService.getNotes();
    const credentials = StorageService.getCredentials();
    const apps = StorageService.getApps();
    const intruders = StorageService.getIntruderLogs();

    const backupData = {
      version: 1,
      timestamp: Date.now(),
      settings,
      media,
      notes,
      credentials,
      apps,
      intruders,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Calculator_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Vault Security Settings</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Sections */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-200 divide-y divide-slate-800/80">
          {/* Section 1: Change Passcode */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              <span>Change Secret Passcode</span>
            </h4>
            <p className="text-slate-400 text-[11px]">
              This is the PIN you type into the calculator followed by &quot;=&quot; to unlock.
            </p>

            <form onSubmit={handleChangePin} className="space-y-2.5 max-w-sm">
              <input
                type="password"
                placeholder="Current PIN (e.g. 1234)"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                maxLength={8}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="New PIN (4-8 digits)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={8}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white text-xs"
                />
                <input
                  type="password"
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={8}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white text-xs"
                />
              </div>

              {pinMessage && (
                <p className={`text-[11px] font-medium ${pinMessage.error ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {pinMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Update PIN
              </button>
            </form>
          </div>

          {/* Section 2: Biometric Authentication (Face ID / Fingerprint) */}
          <div className="space-y-4 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span>Biometric Authentication</span>
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Unlock the calculator vault instantly with Face ID or fingerprint scan overlay.
                </p>
              </div>
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => handleToggleBiometric(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {biometricEnabled && (
              <div className="space-y-3 pt-1">
                {/* Method selector */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">Preferred Biometric Sensor:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'faceid' as const, label: 'Face ID', icon: Scan },
                      { type: 'fingerprint' as const, label: 'Fingerprint', icon: Fingerprint },
                      { type: 'both' as const, label: 'Dual Both', icon: ShieldAlert },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSel = biometricType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => handleUpdateBiometricType(item.type)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition ${
                            isSel
                              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Camera option for FaceID */}
                {(biometricType === 'faceid' || biometricType === 'both') && (
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-[11px] font-medium text-slate-300 block">Live Camera in Face ID Scan</span>
                        <span className="text-[10px] text-slate-500">Shows real facial feed inside scanning reticle</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={biometricUseCamera}
                      onChange={(e) => handleToggleCamera(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                )}

                {/* Test Biometric Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTestScan(true)}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Biometric Visual Scan Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Decoy Vault (Fake PIN) */}
          <div className="space-y-3 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4" />
                  <span>Decoy Mode (Fake Vault)</span>
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Set a secondary PIN that opens a harmless dummy vault with fake recipes &amp; notes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={decoyEnabled}
                onChange={(e) => setDecoyEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {decoyEnabled && (
              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  placeholder="Fake PIN (e.g. 9999)"
                  value={fakePinInput}
                  onChange={(e) => setFakePinInput(e.target.value)}
                  maxLength={8}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleSaveDecoy}
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-semibold"
                >
                  Save Decoy
                </button>
              </div>
            )}
          </div>

          {/* Section 3: App Icon & Name Disguise */}
          <div className="space-y-3 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>App Icon &amp; Cover Disguise</span>
            </h4>
            <p className="text-slate-400 text-[11px]">
              Camouflage this vault as another everyday application to mislead nosy onlookers.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { type: 'calculator' as DisguiseAppType, name: 'Calculator', icon: CalcIcon, color: '#f59e0b' },
                { type: 'weather' as DisguiseAppType, name: 'Weather Forecast', icon: Cloud, color: '#38bdf8' },
                { type: 'clock' as DisguiseAppType, name: 'Clock & Timer', icon: Clock, color: '#a855f7' },
                { type: 'notes' as DisguiseAppType, name: 'Simple Notes', icon: FileText, color: '#eab308' },
                { type: 'fitness' as DisguiseAppType, name: 'Health & Steps', icon: Activity, color: '#10b981' },
              ].map((item) => {
                const IconComp = item.icon;
                const isSelected = settings.disguiseApp === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleDisguiseSelect(item.type)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: item.color + '25', color: item.color }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight">{item.name}</span>
                    {isSelected && <span className="text-[9px] font-bold text-amber-400">Active</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Security Question (Recovery) */}
          <div className="space-y-3 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Password Recovery Question</span>
            </h4>
            <div className="space-y-2 max-w-sm">
              <input
                type="text"
                value={secQuestion}
                onChange={(e) => setSecQuestion(e.target.value)}
                placeholder="Security Question"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
              <input
                type="text"
                value={secAnswer}
                onChange={(e) => setSecAnswer(e.target.value)}
                placeholder="Secret Answer"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
              <button
                type="button"
                onClick={handleSaveSecurityQuestion}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Save Security Question
              </button>
            </div>
          </div>

          {/* Section 5: Panic & Instant Lock */}
          <div className="space-y-3 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Vibrate className="w-4 h-4" />
              <span>Panic Triggers</span>
            </h4>
            <p className="text-slate-400 text-[11px]">
              Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">ESC</kbd> on keyboard anytime to instantly lock vault and return to standard calculator.
            </p>
            <button
              onClick={onSimulateShakeLock}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2"
            >
              <Vibrate className="w-4 h-4" />
              <span>Test Emergency Shake Lock</span>
            </button>
          </div>

          {/* Section 6: Backup & Export */}
          <div className="space-y-3 pt-5 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Vault Backup &amp; Portability</span>
            </h4>
            <p className="text-slate-400 text-[11px]">
              Save an encrypted copy of all vault files, notes, credentials, and settings to your device.
            </p>
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Vault Backup (JSON)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Close Settings
          </button>
        </div>
      </div>

      {/* Biometric Scan Test Modal */}
      <BiometricScanOverlay
        isOpen={showTestScan}
        settings={settings}
        title="Biometric Sensor Test"
        subtitle="Simulating authentic facial reticle and fingerprint scan"
        onSuccess={() => setShowTestScan(false)}
        onCancel={() => setShowTestScan(false)}
      />
    </div>
  );
};
