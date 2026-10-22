/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { Calculator } from './components/Calculator';
import { VaultHeader } from './components/vault/VaultHeader';
import { VaultNav, VaultTabType } from './components/vault/VaultNav';
import { MediaVault } from './components/vault/MediaVault';
import { AppLocker } from './components/vault/AppLocker';
import { PrivateBrowser } from './components/vault/PrivateBrowser';
import { SecureNotes } from './components/vault/SecureNotes';
import { IntruderSelfieViewer } from './components/vault/IntruderSelfieViewer';
import { VaultSettingsModal } from './components/vault/VaultSettingsModal';
import {
  VaultSettings,
  VaultMedia,
  VaultAlbum,
  LockedApp,
  VaultNote,
  VaultCredential,
  IntruderLog,
} from './types/vault';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';

export default function App() {
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isDecoyMode, setIsDecoyMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<VaultTabType>('photos');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  // App state
  const [settings, setSettings] = useState<VaultSettings>(DEFAULT_SETTINGS);
  const [media, setMedia] = useState<VaultMedia[]>([]);
  const [albums, setAlbums] = useState<VaultAlbum[]>([]);
  const [apps, setApps] = useState<LockedApp[]>([]);
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [credentials, setCredentials] = useState<VaultCredential[]>([]);
  const [intruderLogs, setIntruderLogs] = useState<IntruderLog[]>([]);

  // Initialize data on mount
  useEffect(() => {
    const loadedSettings = StorageService.getSettings();
    setSettings(loadedSettings);

    const loadedAlbums = StorageService.getAlbums();
    setAlbums(loadedAlbums);

    const loadedApps = StorageService.getApps();
    setApps(loadedApps);

    const loadedNotes = StorageService.getNotes();
    setNotes(loadedNotes);

    const loadedCreds = StorageService.getCredentials();
    setCredentials(loadedCreds);

    const loadedIntruders = StorageService.getIntruderLogs();
    setIntruderLogs(loadedIntruders);

    // Load media asynchronously from IndexedDB
    StorageService.getAllMedia().then((loadedMedia) => {
      setMedia(loadedMedia);
    });

    // Update document title based on disguise
    const titleMap: Record<string, string> = {
      calculator: 'Calculator',
      weather: 'Weather Forecast',
      clock: 'Clock & Timer',
      notes: 'Quick Notes',
      fitness: 'Step & Health Tracker',
    };
    document.title = titleMap[loadedSettings.disguiseApp] || 'Calculator';
  }, []);

  const handleUnlock = (isDecoy: boolean) => {
    setIsDecoyMode(isDecoy);
    setIsUnlocking(true);
    setTimeout(() => {
      setIsLocked(false);
      setIsUnlocking(false);
      if (isDecoy) {
        setMedia(StorageService.getDecoyMedia());
        setNotes(StorageService.getDecoyNotes());
      } else {
        StorageService.getAllMedia().then((m) => setMedia(m));
        setNotes(StorageService.getNotes());
      }
    }, 400);
  };

  const handleLock = () => {
    setIsLocked(true);
    setIsDecoyMode(false);
    setActiveTab('photos');
    setIsSettingsOpen(false);
  };

  const handleSimulateShake = () => {
    handleLock();
  };

  const activeMediaList = isDecoyMode ? StorageService.getDecoyMedia() : media;
  const activeNotesList = isDecoyMode ? StorageService.getDecoyNotes() : notes;

  return (
    <PhoneFrame
      isLocked={isLocked}
      onPanicLock={handleLock}
      settings={settings}
    >
      {/* Unlock Transition Flash */}
      {isUnlocking && (
        <div className="absolute inset-0 z-50 bg-amber-500/20 backdrop-blur-md flex items-center justify-center animate-out fade-out duration-300">
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-400 text-amber-400 font-bold text-sm shadow-2xl flex items-center gap-2">
            <span>Decrypting Secret Vault...</span>
          </div>
        </div>
      )}

      {isLocked ? (
        /* The Outer Disguise: Calculator Screen */
        <Calculator
          settings={settings}
          onUnlock={handleUnlock}
          onUpdateSettings={setSettings}
        />
      ) : (
        /* Inside the Hidden Secret Vault */
        <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative">
          <VaultHeader
            settings={settings}
            isDecoyMode={isDecoyMode}
            onLockVault={handleLock}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'photos' && (
              <MediaVault
                media={activeMediaList}
                albums={albums}
                onMediaUpdated={setMedia}
                onAlbumsUpdated={setAlbums}
                isDecoyMode={isDecoyMode}
              />
            )}

            {activeTab === 'apps' && (
              <AppLocker
                apps={apps}
                settings={settings}
                onAppsUpdated={setApps}
              />
            )}

            {activeTab === 'browser' && (
              <PrivateBrowser
                onMediaSavedToVault={(newMedia) => {
                  setMedia((prev) => [newMedia, ...prev]);
                }}
              />
            )}

            {activeTab === 'notes' && (
              <SecureNotes
                notes={activeNotesList}
                credentials={credentials}
                onNotesUpdated={setNotes}
                onCredentialsUpdated={setCredentials}
              />
            )}

            {activeTab === 'intruders' && (
              <IntruderSelfieViewer
                logs={intruderLogs}
                onLogsUpdated={setIntruderLogs}
              />
            )}
          </div>

          <VaultNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            intruderCount={intruderLogs.length}
          />

          <VaultSettingsModal
            settings={settings}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onUpdateSettings={setSettings}
            onSimulateShakeLock={handleSimulateShake}
          />
        </div>
      )}
    </PhoneFrame>
  );
}
