import React, { useState } from 'react';
import {
  Globe,
  Lock,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  ShieldCheck,
  Bookmark,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Check,
  Compass
} from 'lucide-react';
import { VaultMedia } from '../../types/vault';
import { StorageService } from '../../services/storage';

interface PrivateBrowserProps {
  onMediaSavedToVault: (media: VaultMedia) => void;
}

interface BrowserTab {
  id: string;
  title: string;
  url: string;
}

export const PrivateBrowser: React.FC<PrivateBrowserProps> = ({
  onMediaSavedToVault,
}) => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab-1', title: 'DuckDuckGo Stealth Search', url: 'https://duckduckgo.com' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState<string>('https://duckduckgo.com');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Array<{ title: string; snippet: string; image?: string; url: string }>>([
    {
      title: 'DuckDuckGo — Privacy, simplified.',
      snippet: 'The Internet privacy company that empowers you to seamlessly take control of your personal information online, without any tracking.',
      url: 'https://duckduckgo.com/privacy',
    },
    {
      title: 'Confidential Digital Security Best Practices',
      snippet: 'Learn how encrypted photo vaults, hardware keys, and local zero-knowledge storage keep your media safe.',
      url: 'https://privacyguides.org',
    },
  ]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = urlInput.trim();
    if (!target) return;

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        // Perform search simulation
        target = `https://duckduckgo.com/?q=${encodeURIComponent(target)}`;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, url: target, title: target.replace(/https?:\/\//, '') } : t))
      );
    }, 400);
  };

  const handleQuickBookmark = (url: string, title: string) => {
    setUrlInput(url);
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url, title } : t))
    );
  };

  const createNewTab = () => {
    const newId = 'tab-' + Date.now();
    const newTab: BrowserTab = {
      id: newId,
      title: 'Private Search',
      url: 'https://duckduckgo.com',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setUrlInput('https://duckduckgo.com');
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id);
      setUrlInput(remaining[remaining.length - 1].url);
    }
  };

  const handleSaveSampleToVault = async (title: string, imgData: string) => {
    const newMedia: VaultMedia = {
      id: 'media-' + Date.now(),
      name: `${title.replace(/\s+/g, '_')}.png`,
      type: 'photo',
      url: imgData,
      size: '220 KB',
      dateAdded: Date.now(),
      albumId: 'secret_camera',
      isFavorite: false,
    };
    await StorageService.addMedia(newMedia);
    onMediaSavedToVault(newMedia);
    setSavedNotice(`Saved "${newMedia.name}" directly to your Secret Vault!`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Browser Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0 space-y-2">
        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setUrlInput(tab.url);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer max-w-[160px] transition ${
                activeTabId === tab.id
                  ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700/60'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <span className="truncate">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="hover:text-rose-400 text-slate-500 text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={createNewTab}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Open New Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL and Navigation Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <button className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 300);
              }}
              className={`p-1.5 rounded-lg hover:bg-slate-800 hover:text-white ${isLoading ? 'animate-spin' : ''}`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleNavigate} className="flex-1 relative">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Search or enter website address"
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button type="submit" className="text-slate-400 hover:text-amber-400">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bookmarks Strip */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 border-b border-slate-900 overflow-x-auto scrollbar-none shrink-0 text-xs text-slate-400">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fast:</span>
        <button
          onClick={() => handleQuickBookmark('https://duckduckgo.com', 'DuckDuckGo')}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-amber-400 whitespace-nowrap transition"
        >
          DuckDuckGo
        </button>
        <button
          onClick={() => handleQuickBookmark('https://wikipedia.org', 'Wikipedia')}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-amber-400 whitespace-nowrap transition"
        >
          Wikipedia
        </button>
        <button
          onClick={() => handleQuickBookmark('https://news.ycombinator.com', 'Hacker News')}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-amber-400 whitespace-nowrap transition"
        >
          Hacker News
        </button>
        <button
          onClick={() => handleQuickBookmark('https://reddit.com', 'Reddit')}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-amber-400 whitespace-nowrap transition"
        >
          Reddit
        </button>
      </div>

      {/* Toast */}
      {savedNotice && (
        <div className="m-3 p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Browser Viewport Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stealth Banner */}
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Stealth Incognito Active</h4>
              <p className="text-[11px] text-slate-400">
                Zero history stored on phone. Cookies &amp; cache purged on vault exit.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUrlInput('https://duckduckgo.com');
              alert('Private browsing cache and temporary cookies wiped clean!');
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Clear Session
          </button>
        </div>

        {/* Content simulation */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>{activeTab.title}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">HTTPS Encrypted</span>
          </div>

          {/* Quick download to vault demo items */}
          <div>
            <h5 className="text-xs font-semibold text-slate-300 mb-2">
              Featured Downloads (Save directly into your Secret Vault):
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h6 className="text-xs font-medium text-white">Confidential Architectural Blueprints</h6>
                  <p className="text-[10px] text-slate-400">PDF Document · 1.4 MB</p>
                </div>
                <button
                  onClick={() =>
                    handleSaveSampleToVault(
                      'Secret_Blueprints_Plan',
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect fill="%230284c7" width="600" height="400"/><line x1="0" y1="50" x2="600" y2="50" stroke="%2338bdf8" stroke-width="1"/><line x1="0" y1="100" x2="600" y2="100" stroke="%2338bdf8" stroke-width="1"/><line x1="0" y1="150" x2="600" y2="150" stroke="%2338bdf8" stroke-width="1"/><line x1="0" y1="200" x2="600" y2="200" stroke="%2338bdf8" stroke-width="1"/><text fill="%23ffffff" font-family="sans-serif" font-size="24" font-weight="bold" x="40" y="80">CONFIDENTIAL BLUEPRINT</text><text fill="%23e0f2fe" font-family="sans-serif" font-size="14" x="40" y="120">Architectural Scheme 4-A</text></svg>'
                    )
                  }
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1 transition shadow-sm"
                  title="Save directly to Vault"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h6 className="text-xs font-medium text-white">Private Crypto Asset Allocation</h6>
                  <p className="text-[10px] text-slate-400">Chart Snapshot · 840 KB</p>
                </div>
                <button
                  onClick={() =>
                    handleSaveSampleToVault(
                      'Crypto_Allocation_Q4',
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect fill="%230f172a" width="600" height="400"/><circle cx="300" cy="200" r="100" fill="%23f59e0b" opacity="0.3"/><text fill="%23f59e0b" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" x="300" y="195">BITCOIN / ETH</text><text fill="%23cbd5e1" font-family="sans-serif" font-size="16" text-anchor="middle" x="300" y="235">Cold Storage Vault</text></svg>'
                    )
                  }
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1 transition shadow-sm"
                  title="Save directly to Vault"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulated Search Results */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-semibold text-slate-300">Web Results:</h5>
            {searchResults.map((result, i) => (
              <div key={i} className="p-3 bg-slate-900/60 rounded-xl hover:bg-slate-900 transition space-y-1">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>{result.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <p className="text-[11px] text-slate-400 leading-relaxed">{result.snippet}</p>
                <span className="text-[10px] text-slate-500 font-mono block">{result.url}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
