import React, { useState } from 'react';
import {
  FileText,
  Key,
  Plus,
  Pin,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  Lock,
  CreditCard,
  Globe,
  Edit2,
  X
} from 'lucide-react';
import { VaultNote, VaultCredential } from '../../types/vault';
import { StorageService } from '../../services/storage';

interface SecureNotesProps {
  notes: VaultNote[];
  credentials: VaultCredential[];
  onNotesUpdated: (notes: VaultNote[]) => void;
  onCredentialsUpdated: (creds: VaultCredential[]) => void;
}

export const SecureNotes: React.FC<SecureNotesProps> = ({
  notes,
  credentials,
  onNotesUpdated,
  onCredentialsUpdated,
}) => {
  const [subTab, setSubTab] = useState<'notes' | 'passwords'>('notes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Note modal state
  const [editingNote, setEditingNote] = useState<VaultNote | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteColor, setNoteColor] = useState<string>('#3b82f6');
  const [noteCategory, setNoteCategory] = useState<VaultNote['category']>('general');

  // Credential modal state
  const [isCredModalOpen, setIsCredModalOpen] = useState<boolean>(false);
  const [credTitle, setCredTitle] = useState<string>('');
  const [credUsername, setCredUsername] = useState<string>('');
  const [credPassword, setCredPassword] = useState<string>('');
  const [credUrl, setCredUrl] = useState<string>('');
  const [credNotes, setCredNotes] = useState<string>('');
  const [credCategory, setCredCategory] = useState<VaultCredential['category']>('login');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRevealPassword = (id: string) => {
    const next = new Set(revealedPasswords);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedPasswords(next);
  };

  // Open note for editing or creating
  const openNoteEditor = (note?: VaultNote) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteColor(note.color);
      setNoteCategory(note.category);
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteColor('#3b82f6');
      setNoteCategory('general');
    }
    setIsNoteModalOpen(true);
  };

  const saveNote = () => {
    if (!noteTitle.trim()) return;
    let updated: VaultNote[];
    if (editingNote) {
      updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: noteTitle.trim(),
              content: noteContent.trim(),
              color: noteColor,
              category: noteCategory,
              dateModified: Date.now(),
            }
          : n
      );
    } else {
      const newNote: VaultNote = {
        id: 'note-' + Date.now(),
        title: noteTitle.trim(),
        content: noteContent.trim(),
        color: noteColor,
        category: noteCategory,
        dateModified: Date.now(),
        isPinned: false,
      };
      updated = [newNote, ...notes];
    }
    StorageService.saveNotes(updated);
    onNotesUpdated(updated);
    setIsNoteModalOpen(false);
  };

  const deleteNote = (id: string) => {
    if (!confirm('Permanently delete this secret note?')) return;
    const updated = notes.filter((n) => n.id !== id);
    StorageService.saveNotes(updated);
    onNotesUpdated(updated);
  };

  const togglePinNote = (id: string) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    StorageService.saveNotes(updated);
    onNotesUpdated(updated);
  };

  // Save credential
  const saveCredential = () => {
    if (!credTitle.trim() || !credPassword.trim()) return;
    const newCred: VaultCredential = {
      id: 'cred-' + Date.now(),
      title: credTitle.trim(),
      username: credUsername.trim(),
      password: credPassword.trim(),
      url: credUrl.trim(),
      category: credCategory,
      notes: credNotes.trim(),
      updatedAt: Date.now(),
    };
    const updated = [newCred, ...credentials];
    StorageService.saveCredentials(updated);
    onCredentialsUpdated(updated);
    setIsCredModalOpen(false);
    setCredTitle('');
    setCredUsername('');
    setCredPassword('');
    setCredUrl('');
    setCredNotes('');
  };

  const deleteCredential = (id: string) => {
    if (!confirm('Permanently remove this secret password entry?')) return;
    const updated = credentials.filter((c) => c.id !== id);
    StorageService.saveCredentials(updated);
    onCredentialsUpdated(updated);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCredentials = credentials.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Encrypted Notes &amp; Passwords</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Zero-knowledge local encryption for credentials &amp; diary
            </p>
          </div>

          <button
            onClick={() => {
              if (subTab === 'notes') openNoteEditor();
              else setIsCredModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-amber-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New {subTab === 'notes' ? 'Note' : 'Password'}</span>
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab('notes')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              subTab === 'notes'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Secret Notes ({notes.length})</span>
          </button>
          <button
            onClick={() => setSubTab('passwords')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              subTab === 'passwords'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Password Safe ({credentials.length})</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-900 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={subTab === 'notes' ? 'Search confidential notes...' : 'Search passwords, logins...'}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-500 text-xs hover:text-white">
            ✕
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {subTab === 'notes' ? (
          filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-center">
              <FileText className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">No secret notes found</p>
              <button
                onClick={() => openNoteEditor()}
                className="mt-3 text-xs text-amber-400 hover:underline"
              >
                Create your first confidential note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => openNoteEditor(note)}
                  className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
                  style={{ borderLeftColor: note.color, borderLeftWidth: '3px' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition truncate pr-2">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => togglePinNote(note.id)}
                          className={`p-1 rounded hover:bg-slate-800 ${
                            note.isPinned ? 'text-amber-400' : 'text-slate-500'
                          }`}
                          title={note.isPinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span className="capitalize">{note.category}</span>
                    <span>{new Date(note.dateModified).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Password Safe View */
          filteredCredentials.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-center">
              <Key className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">No passwords stored yet</p>
              <button
                onClick={() => setIsCredModalOpen(true)}
                className="mt-3 text-xs text-amber-400 hover:underline"
              >
                Add account or card credentials
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredCredentials.map((cred) => {
                const isRevealed = revealedPasswords.has(cred.id);
                return (
                  <div
                    key={cred.id}
                    className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        {cred.category === 'card' ? (
                          <CreditCard className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{cred.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{cred.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs text-amber-300">
                            {isRevealed ? cred.password : '••••••••••••'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleRevealPassword(cred.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title={isRevealed ? 'Hide Password' : 'Show Password'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(cred.password, cred.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Copy Password"
                      >
                        {copiedId === cred.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCredential(cred.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Note Editor Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">
                {editingNote ? 'Edit Secret Note' : 'New Secret Note'}
              </h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title / subject"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Secret Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your secret journal, seed phrase, or private thoughts here..."
                  rows={8}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Color Tag</label>
                  <div className="flex items-center gap-1.5">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNoteColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-5 h-5 rounded-full transition ${
                          noteColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as VaultNote['category'])}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="general">General</option>
                    <option value="passwords">Passwords</option>
                    <option value="personal">Personal</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-2 border-t border-slate-800">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Modal */}
      {isCredModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Save Credential to Safe</h3>
              <button onClick={() => setIsCredModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Service / Title</label>
              <input
                type="text"
                value={credTitle}
                onChange={(e) => setCredTitle(e.target.value)}
                placeholder="e.g. ProtonMail, Coinbase, Credit Card"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Username / Identifier</label>
              <input
                type="text"
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                placeholder="username or cardholder"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Password / Secret PIN</label>
              <input
                type="text"
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                placeholder="secret password"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={credNotes}
                onChange={(e) => setCredNotes(e.target.value)}
                placeholder="CVV, Expiry, or 2FA backup code"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => setIsCredModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveCredential}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400"
              >
                Save Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
