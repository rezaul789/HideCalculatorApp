export type DisguiseAppType = 'calculator' | 'weather' | 'clock' | 'notes' | 'fitness';

export interface VaultMedia {
  id: string;
  name: string;
  type: 'photo' | 'video' | 'document';
  url: string; // base64, objectURL, or static path
  size: string;
  dateAdded: number;
  albumId: string;
  isFavorite?: boolean;
  duration?: string; // for videos
  aspectRatio?: string;
}

export interface VaultAlbum {
  id: string;
  name: string;
  icon?: string;
  isSystem?: boolean;
}

export interface LockedApp {
  id: string;
  name: string;
  packageId: string;
  category: 'social' | 'finance' | 'system' | 'entertainment' | 'work';
  icon: string;
  isLocked: boolean;
  isHidden: boolean;
  simulatedScreenType: string;
  color: string;
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  dateModified: number;
  category: 'general' | 'passwords' | 'personal' | 'financial';
  isPinned: boolean;
  color: string;
}

export interface VaultCredential {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category: 'login' | 'card' | 'bank' | 'crypto';
  notes?: string;
  updatedAt: number;
}

export interface IntruderLog {
  id: string;
  timestamp: number;
  attemptPin: string;
  photoUrl: string;
  deviceInfo: string;
  resolved?: boolean;
}

export interface VaultSettings {
  passcode: string; // default e.g. "1234"
  isSetupComplete: boolean;
  fakePasscode?: string; // Decoy vault PIN e.g. "9999"
  hasDecoyEnabled: boolean;
  securityQuestion: string;
  securityAnswer: string;
  disguiseApp: DisguiseAppType;
  intruderCaptureEnabled: boolean;
  shakeToLock: boolean;
  panicSwitchEnabled: boolean;
  unlockAnimation: 'slide' | 'fade' | 'lockpick';
  biometricEnabled: boolean;
  biometricType: 'faceid' | 'fingerprint' | 'both';
  biometricUseCamera: boolean;
}

