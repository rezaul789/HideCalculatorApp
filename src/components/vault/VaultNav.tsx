import React from 'react';
import {
  Image as ImageIcon,
  Shield,
  Globe,
  FileText,
  Camera,
  Settings
} from 'lucide-react';

export type VaultTabType = 'photos' | 'apps' | 'browser' | 'notes' | 'intruders';

interface VaultNavProps {
  activeTab: VaultTabType;
  onTabChange: (tab: VaultTabType) => void;
  intruderCount: number;
}

export const VaultNav: React.FC<VaultNavProps> = ({
  activeTab,
  onTabChange,
  intruderCount,
}) => {
  const tabs: Array<{ id: VaultTabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'photos', label: 'Media', icon: ImageIcon },
    { id: 'apps', label: 'AppLock', icon: Shield },
    { id: 'browser', label: 'Browser', icon: Globe },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'intruders', label: 'Intruders', icon: Camera },
  ];

  return (
    <div className="h-16 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-2 grid grid-cols-5 items-center shrink-0 z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-all ${
              isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {tab.id === 'intruders' && intruderCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {intruderCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
