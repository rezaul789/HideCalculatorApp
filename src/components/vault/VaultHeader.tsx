import React from 'react';
import {
  Lock,
  Settings,
  Shield,
  EyeOff,
  Zap,
  HelpCircle
} from 'lucide-react';
import { VaultSettings } from '../../types/vault';

interface VaultHeaderProps {
  settings: VaultSettings;
  isDecoyMode: boolean;
  onLockVault: () => void;
  onOpenSettings: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  settings,
  isDecoyMode,
  onLockVault,
  onOpenSettings,
}) => {
  return (
    <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
          isDecoyMode ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {isDecoyMode ? <EyeOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-bold text-white tracking-wide">
              {isDecoyMode ? 'Decoy Safe' : 'Calculator Vault'}
            </h1>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded">
              ENCRYPTED
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {isDecoyMode ? 'Harmless Decoy View' : 'Private Storage Active'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onLockVault}
          title="Panic Quick Lock: Return to Calculator"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition border border-rose-500/20"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Lock</span>
        </button>

        <button
          onClick={onOpenSettings}
          title="Vault Settings"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
