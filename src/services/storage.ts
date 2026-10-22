import {
  VaultMedia,
  VaultAlbum,
  LockedApp,
  VaultNote,
  VaultCredential,
  IntruderLog,
  VaultSettings,
} from '../types/vault';

const DB_NAME = 'CalculatorVaultDB';
const DB_VERSION = 1;
const STORE_MEDIA = 'media_files';

export const DEFAULT_SETTINGS: VaultSettings = {
  passcode: '1234',
  isSetupComplete: true, // Default ready, but wizard is easily shown or customizable
  fakePasscode: '9999',
  hasDecoyEnabled: true,
  securityQuestion: "What is your childhood pet's name?",
  securityAnswer: 'Lucky',
  disguiseApp: 'calculator',
  intruderCaptureEnabled: true,
  shakeToLock: true,
  panicSwitchEnabled: true,
  unlockAnimation: 'slide',
  biometricEnabled: true,
  biometricType: 'both',
  biometricUseCamera: true,
};

export const INITIAL_ALBUMS: VaultAlbum[] = [
  { id: 'all', name: 'All Media', isSystem: true },
  { id: 'secret_camera', name: 'Private Camera', icon: 'Camera' },
  { id: 'documents', name: 'Passports & IDs', icon: 'FileText' },
  { id: 'vacation', name: 'Vacation Trips', icon: 'Sun' },
  { id: 'hidden_videos', name: 'Secret Videos', icon: 'Film' },
];

export const INITIAL_APPS: LockedApp[] = [
  { id: 'whatsapp', name: 'WhatsApp', packageId: 'com.whatsapp', category: 'social', icon: 'MessageCircle', isLocked: true, isHidden: false, simulatedScreenType: 'chat', color: '#25D366' },
  { id: 'instagram', name: 'Instagram', packageId: 'com.instagram.android', category: 'social', icon: 'Camera', isLocked: true, isHidden: false, simulatedScreenType: 'social_feed', color: '#E1306C' },
  { id: 'photos', name: 'Gallery & Photos', packageId: 'com.google.android.apps.photos', category: 'system', icon: 'Image', isLocked: true, isHidden: true, simulatedScreenType: 'gallery', color: '#4285F4' },
  { id: 'chrome', name: 'Google Chrome', packageId: 'com.android.chrome', category: 'system', icon: 'Globe', isLocked: false, isHidden: false, simulatedScreenType: 'browser', color: '#EA4335' },
  { id: 'banking', name: 'Chase Bank & Crypto', packageId: 'com.chase.sig.android', category: 'finance', icon: 'CreditCard', isLocked: true, isHidden: true, simulatedScreenType: 'finance', color: '#117ACA' },
  { id: 'telegram', name: 'Telegram Secret', packageId: 'org.telegram.messenger', category: 'social', icon: 'Send', isLocked: true, isHidden: true, simulatedScreenType: 'chat', color: '#0088CC' },
  { id: 'tiktok', name: 'TikTok', packageId: 'com.zhiliaoapp.musically', category: 'entertainment', icon: 'Music', isLocked: false, isHidden: false, simulatedScreenType: 'video', color: '#000000' },
  { id: 'gmail', name: 'Gmail', packageId: 'com.google.android.gm', category: 'work', icon: 'Mail', isLocked: true, isHidden: false, simulatedScreenType: 'mail', color: '#EA4335' },
  { id: 'settings', name: 'Phone Settings', packageId: 'com.android.settings', category: 'system', icon: 'Settings', isLocked: false, isHidden: false, simulatedScreenType: 'settings', color: '#607D8B' },
  { id: 'notes_app', name: 'Secret Notes App', packageId: 'com.notes.vault', category: 'work', icon: 'FileText', isLocked: true, isHidden: true, simulatedScreenType: 'notes', color: '#FFA000' },
  { id: 'messenger', name: 'Messenger', packageId: 'com.facebook.orca', category: 'social', icon: 'MessageSquare', isLocked: false, isHidden: false, simulatedScreenType: 'chat', color: '#0084FF' },
  { id: 'binance', name: 'Binance & Web3', packageId: 'com.binance.dev', category: 'finance', icon: 'DollarSign', isLocked: true, isHidden: true, simulatedScreenType: 'crypto', color: '#F3BA2F' },
];

export const INITIAL_NOTES: VaultNote[] = [
  {
    id: 'note-1',
    title: 'Secret Recovery Seed Phrases (ETH / BTC)',
    content: 'Wallet 1 (Cold Ledger):\n1. velvet 2. ocean 3. galaxy 4. timber 5. echo 6. orbit 7. crystal 8. summit 9. breeze 10. flare 11. harbor 12. pulse\n\nNEVER disclose to anyone or take screenshot!',
    dateModified: Date.now() - 1000 * 60 * 60 * 24 * 2,
    category: 'passwords',
    isPinned: true,
    color: '#3b82f6',
  },
  {
    id: 'note-2',
    title: 'Private Journal - October Milestones',
    content: 'Discussed project architecture and secret launch with the core engineering group. Next funding round targets approved. Keep strictly confidential until Q1 PR announcement.',
    dateModified: Date.now() - 1000 * 60 * 60 * 12,
    category: 'personal',
    isPinned: false,
    color: '#8b5cf6',
  },
  {
    id: 'note-3',
    title: 'Apartment Safe & Alarm Codes',
    content: 'Master Building Door: #7419\nSafe Code in closet: 8302#\nStorage locker padlock: 24-08-16',
    dateModified: Date.now() - 1000 * 60 * 60 * 48,
    category: 'financial',
    isPinned: true,
    color: '#ec4899',
  },
];

export const INITIAL_CREDENTIALS: VaultCredential[] = [
  {
    id: 'cred-1',
    title: 'Swiss Encrypted Vault Account',
    username: 'cryptovault_alpha',
    password: 'K8#mP!99xZ@vL2$Q',
    url: 'https://vault.proton.me',
    category: 'login',
    notes: 'Protected with hardware YubiKey 2FA',
    updatedAt: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: 'cred-2',
    title: 'Black Titanium Corporate Card',
    username: 'Card ending in ···· 9042',
    password: 'PIN: 6813 | CVV: 739',
    url: 'https://chase.com',
    category: 'card',
    notes: 'Exp: 09/29 | Billing zip: 10001',
    updatedAt: Date.now() - 1000 * 60 * 60 * 50,
  },
];

export const INITIAL_INTRUDER_LOGS: IntruderLog[] = [
  {
    id: 'intruder-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    attemptPin: '0000',
    photoUrl: '/src/assets/images/intruder_selfie_demo_1792656198403.jpg',
    deviceInfo: 'Front Camera Snapshot (Invalid PIN entered 3x)',
    resolved: false,
  },
];

export const INITIAL_MEDIA: VaultMedia[] = [
  {
    id: 'media-passport',
    name: 'Diplomatic_Passport_PassportsIDs.jpg',
    type: 'document',
    url: '/src/assets/images/secret_document_passport_1792656198498.jpg',
    size: '3.4 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 3,
    albumId: 'documents',
    isFavorite: true,
  },
  {
    id: 'media-beach',
    name: 'Tropical_Vacation_Phuket_Beach.jpg',
    type: 'photo',
    url: '/src/assets/images/secret_beach_vacation_1792656199541.jpg',
    size: '4.8 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 36,
    albumId: 'vacation',
    isFavorite: true,
  },
  {
    id: 'media-party',
    name: 'Rooftop_Celebration_Candid.jpg',
    type: 'photo',
    url: '/src/assets/images/secret_party_night_1792656199564.jpg',
    size: '5.2 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 18,
    albumId: 'secret_camera',
    isFavorite: false,
  },
];

// Open or get IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  // Settings
  getSettings(): VaultSettings {
    try {
      const raw = localStorage.getItem('calc_vault_settings');
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Error reading settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: VaultSettings): void {
    localStorage.setItem('calc_vault_settings', JSON.stringify(settings));
  },

  // Albums
  getAlbums(): VaultAlbum[] {
    try {
      const raw = localStorage.getItem('calc_vault_albums');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading albums', e);
    }
    return INITIAL_ALBUMS;
  },

  saveAlbums(albums: VaultAlbum[]): void {
    localStorage.setItem('calc_vault_albums', JSON.stringify(albums));
  },

  // Media (IndexedDB + local state)
  async getAllMedia(): Promise<VaultMedia[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_MEDIA, 'readonly');
        const store = tx.objectStore(STORE_MEDIA);
        const req = store.getAll();
        req.onsuccess = () => {
          const stored = req.result as VaultMedia[];
          if (!stored || stored.length === 0) {
            // Seed initial media
            this.seedMedia(INITIAL_MEDIA);
            resolve(INITIAL_MEDIA);
          } else {
            resolve(stored);
          }
        };
        req.onerror = () => {
          resolve(INITIAL_MEDIA);
        };
      });
    } catch {
      return INITIAL_MEDIA;
    }
  },

  async addMedia(item: VaultMedia): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async deleteMedia(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async updateMedia(item: VaultMedia): Promise<void> {
    return this.addMedia(item);
  },

  async seedMedia(items: VaultMedia[]): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    for (const item of items) {
      store.put(item);
    }
  },

  // Locked Apps
  getApps(): LockedApp[] {
    try {
      const raw = localStorage.getItem('calc_vault_apps');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading apps', e);
    }
    return INITIAL_APPS;
  },

  saveApps(apps: LockedApp[]): void {
    localStorage.setItem('calc_vault_apps', JSON.stringify(apps));
  },

  // Notes
  getNotes(): VaultNote[] {
    try {
      const raw = localStorage.getItem('calc_vault_notes');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading notes', e);
    }
    return INITIAL_NOTES;
  },

  saveNotes(notes: VaultNote[]): void {
    localStorage.setItem('calc_vault_notes', JSON.stringify(notes));
  },

  // Credentials
  getCredentials(): VaultCredential[] {
    try {
      const raw = localStorage.getItem('calc_vault_credentials');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading credentials', e);
    }
    return INITIAL_CREDENTIALS;
  },

  saveCredentials(credentials: VaultCredential[]): void {
    localStorage.setItem('calc_vault_credentials', JSON.stringify(credentials));
  },

  // Intruder logs
  getIntruderLogs(): IntruderLog[] {
    try {
      const raw = localStorage.getItem('calc_vault_intruders');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading intruders', e);
    }
    return INITIAL_INTRUDER_LOGS;
  },

  addIntruderLog(log: IntruderLog): void {
    const logs = this.getIntruderLogs();
    logs.unshift(log);
    localStorage.setItem('calc_vault_intruders', JSON.stringify(logs));
  },

  clearIntruderLogs(): void {
    localStorage.setItem('calc_vault_intruders', JSON.stringify([]));
  },

  // Decoy vault media (harmless cute animal / recipe photos)
  getDecoyMedia(): VaultMedia[] {
    return [
      {
        id: 'decoy-1',
        name: 'Weekly_Grocery_List.png',
        type: 'photo',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect fill="%231e293b" width="600" height="400"/><text fill="%2394a3b8" font-family="sans-serif" font-size="24" font-weight="bold" x="50" y="80">Decoy Safe Note</text><text fill="%2364748b" font-family="sans-serif" font-size="16" x="50" y="130">1. Organic Vegetables &amp; Fruits</text><text fill="%2364748b" font-family="sans-serif" font-size="16" x="50" y="170">2. Almond Milk &amp; Oats</text><text fill="%2364748b" font-family="sans-serif" font-size="16" x="50" y="210">3. Olive Oil &amp; Whole Wheat Bread</text><rect x="50" y="260" width="180" height="40" rx="8" fill="%23334155"/><text fill="%23cbd5e1" font-family="sans-serif" font-size="14" x="70" y="285">Standard Receipt</text></svg>',
        size: '142 KB',
        dateAdded: Date.now() - 1000 * 60 * 60 * 10,
        albumId: 'all',
      },
      {
        id: 'decoy-2',
        name: 'Workout_Routine_Plan.png',
        type: 'photo',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect fill="%230f172a" width="600" height="400"/><circle cx="300" cy="180" r="70" fill="%2310b981" opacity="0.2"/><text fill="%2310b981" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" x="300" y="190">5K RUN</text><text fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle" x="300" y="280">Morning Cardio Routine</text><text fill="%2364748b" font-family="sans-serif" font-size="14" text-anchor="middle" x="300" y="320">Pace: 5:12 / km · 28 mins</text></svg>',
        size: '185 KB',
        dateAdded: Date.now() - 1000 * 60 * 60 * 40,
        albumId: 'all',
      },
    ];
  },

  getDecoyNotes(): VaultNote[] {
    return [
      {
        id: 'decoy-note-1',
        title: 'Weekly Grocery List',
        content: '• Milk (Almond)\n• Organic Eggs\n• Greek Yogurt\n• Spinach & Avocados\n• Sourdough bread',
        dateModified: Date.now() - 1000 * 60 * 60 * 8,
        category: 'general',
        isPinned: true,
        color: '#10b981',
      },
    ];
  },
};
