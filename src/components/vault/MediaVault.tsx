import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Download,
  FolderPlus,
  Heart,
  Play,
  RotateCw,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Upload,
  CheckSquare,
  Square,
  Folder,
  Share2,
  EyeOff,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { VaultMedia, VaultAlbum } from '../../types/vault';
import { StorageService } from '../../services/storage';

interface MediaVaultProps {
  media: VaultMedia[];
  albums: VaultAlbum[];
  onMediaUpdated: (updated: VaultMedia[]) => void;
  onAlbumsUpdated: (updated: VaultAlbum[]) => void;
  isDecoyMode?: boolean;
}

export const MediaVault: React.FC<MediaVaultProps> = ({
  media,
  albums,
  onMediaUpdated,
  onAlbumsUpdated,
  isDecoyMode = false,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  // New Album modal
  const [showNewAlbumModal, setShowNewAlbumModal] = useState<boolean>(false);
  const [newAlbumName, setNewAlbumName] = useState<string>('');

  // Live Camera capture modal
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter media by album
  const filteredMedia = media.filter((item) => {
    if (selectedAlbumId === 'all') return true;
    if (selectedAlbumId === 'favorites') return item.isFavorite;
    return item.albumId === selectedAlbumId;
  });

  const activeMedia = activeMediaIndex !== null ? filteredMedia[activeMediaIndex] : null;

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: VaultMedia[] = [];
    const filesArray = Array.from(files);

    filesArray.forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const newItem: VaultMedia = {
          id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
          name: file.name,
          type: isVideo ? 'video' : 'photo',
          url: dataUrl,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          dateAdded: Date.now(),
          albumId: selectedAlbumId === 'all' || selectedAlbumId === 'favorites' ? 'secret_camera' : selectedAlbumId,
          isFavorite: false,
        };

        await StorageService.addMedia(newItem);
        newItems.push(newItem);

        if (newItems.length === filesArray.length) {
          onMediaUpdated([...newItems, ...media]);
        }
      };

      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Live Camera Snapshot
  const openCamera = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch (err) {
      console.warn('Unable to access webcam:', err);
    }
  };

  const closeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const capturePhoto = async () => {
    if (!cameraVideoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = cameraVideoRef.current.videoWidth || 640;
    canvas.height = cameraVideoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(cameraVideoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const newItem: VaultMedia = {
        id: 'media-' + Date.now(),
        name: `Vault_Snapshot_${new Date().toISOString().slice(0, 10)}.jpg`,
        type: 'photo',
        url: dataUrl,
        size: '1.8 MB',
        dateAdded: Date.now(),
        albumId: 'secret_camera',
        isFavorite: false,
      };

      await StorageService.addMedia(newItem);
      onMediaUpdated([newItem, ...media]);
      closeCamera();
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (item: VaultMedia, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = { ...item, isFavorite: !item.isFavorite };
    await StorageService.updateMedia(updated);
    onMediaUpdated(media.map((m) => (m.id === item.id ? updated : m)));
  };

  // Multi-select toggle
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Delete selected
  const handleDeleteSelected = async () => {
    if (!confirm(`Permanently remove ${selectedIds.size} file(s) from vault?`)) return;
    for (const id of selectedIds) {
      await StorageService.deleteMedia(id);
    }
    onMediaUpdated(media.filter((m) => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  // Unhide / Export selected (trigger download)
  const handleExportSelected = () => {
    selectedIds.forEach((id) => {
      const item = media.find((m) => m.id === id);
      if (item) {
        const a = document.createElement('a');
        a.href = item.url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
    alert(`Exported ${selectedIds.size} file(s) back to your device storage!`);
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  // Create new album
  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return;
    const newAlbum: VaultAlbum = {
      id: 'album-' + Date.now(),
      name: newAlbumName.trim(),
    };
    const updated = [...albums, newAlbum];
    StorageService.saveAlbums(updated);
    onAlbumsUpdated(updated);
    setSelectedAlbumId(newAlbum.id);
    setNewAlbumName('');
    setShowNewAlbumModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Vault Gallery Top Action Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Hidden Photos &amp; Videos</span>
            {isDecoyMode && (
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                Decoy Mode
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-400">
            {filteredMedia.length} private file{filteredMedia.length === 1 ? '' : 's'} protected
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSelectMode ? (
            <>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 disabled:opacity-40 transition-colors"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportSelected}
                disabled={selectedIds.size === 0}
                className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 disabled:opacity-40 transition-colors"
                title="Export / Unhide to Device"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsSelectMode(true)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Select
              </button>
              <button
                onClick={openCamera}
                title="Take Secret Photo"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Import Photos or Videos"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-amber-500/10"
              >
                <Plus className="w-4 h-4" />
                <span>Import</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Horizontal Album Folders Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 border-b border-slate-900 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => setSelectedAlbumId('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedAlbumId === 'all'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>All Media ({media.length})</span>
        </button>

        <button
          onClick={() => setSelectedAlbumId('favorites')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedAlbumId === 'favorites'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          <span>Favorites</span>
        </button>

        {albums.filter((a) => a.id !== 'all').map((album) => (
          <button
            key={album.id}
            onClick={() => setSelectedAlbumId(album.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedAlbumId === album.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{album.name}</span>
          </button>
        ))}

        <button
          onClick={() => setShowNewAlbumModal(true)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-400 hover:text-amber-400 hover:bg-slate-800 flex items-center gap-1 shrink-0"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Album</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Vault Folder Empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Import private photos and videos from your device or use the camera to hide confidential files here.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition"
            >
              Add Files to Vault
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {filteredMedia.map((item, index) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    if (isSelectMode) {
                      toggleSelect(item.id, e);
                    } else {
                      setActiveMediaIndex(index);
                      setZoomLevel(1);
                      setRotation(0);
                    }
                  }}
                  className={`group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border transition cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/50'
                      : 'border-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  {/* Thumbnail */}
                  {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 relative">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-amber-500/80 text-slate-950 flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 text-[10px] font-mono bg-black/70 px-1 py-0.5 rounded text-slate-300">
                        VIDEO
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Favorite indicator */}
                  {item.isFavorite && (
                    <div className="absolute top-1.5 left-1.5 text-rose-500 drop-shadow">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  {isSelectMode && (
                    <div className="absolute top-1.5 right-1.5 bg-black/60 rounded p-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  )}

                  {/* Hover metadata bar */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-[10px] text-slate-300">
                    <span className="truncate pr-1">{item.name}</span>
                    <span className="shrink-0 font-mono text-[9px] text-slate-400">{item.size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Media Lightbox Viewer */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in select-none">
          {/* Top Viewer Bar */}
          <div className="flex items-center justify-between py-2 px-1 text-white z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveMediaIndex(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h4 className="text-xs font-semibold text-white max-w-xs truncate">
                  {activeMedia.name}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {new Date(activeMedia.dateAdded).toLocaleDateString()} · {activeMedia.size}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(activeMedia)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                <Heart
                  className={`w-4 h-4 ${
                    activeMedia.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Presentation Stage */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
            {/* Previous Button */}
            {activeMediaIndex !== null && activeMediaIndex > 0 && (
              <button
                onClick={() => {
                  setActiveMediaIndex(activeMediaIndex - 1);
                  setZoomLevel(1);
                  setRotation(0);
                }}
                className="absolute left-3 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white shadow-lg backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next Button */}
            {activeMediaIndex !== null && activeMediaIndex < filteredMedia.length - 1 && (
              <button
                onClick={() => {
                  setActiveMediaIndex(activeMediaIndex + 1);
                  setZoomLevel(1);
                  setRotation(0);
                }}
                className="absolute right-3 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white shadow-lg backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Media Content */}
            {activeMedia.type === 'video' ? (
              <div className="max-w-4xl max-h-[75vh] w-full flex flex-col items-center">
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="max-h-[70vh] rounded-xl shadow-2xl"
                />
              </div>
            ) : (
              <img
                src={activeMedia.url}
                alt={activeMedia.name}
                referrerPolicy="no-referrer"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          {/* Bottom Viewer Action Footer */}
          <div className="flex items-center justify-between py-2 px-2 bg-slate-900/80 rounded-2xl border border-slate-800 z-10">
            <span className="text-xs text-slate-400 font-mono">
              {(activeMediaIndex ?? 0) + 1} / {filteredMedia.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = activeMedia.url;
                  a.download = activeMedia.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export / Unhide</span>
              </button>

              <button
                onClick={async () => {
                  if (confirm('Delete this file permanently from the vault?')) {
                    await StorageService.deleteMedia(activeMedia.id);
                    onMediaUpdated(media.filter((m) => m.id !== activeMedia.id));
                    setActiveMediaIndex(null);
                  }
                }}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Album Modal */}
      {showNewAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Create New Album</h3>
            <input
              type="text"
              placeholder="e.g. Bank Statements, Secret Selfies"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs mb-4 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewAlbumModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlbum}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Camera Snapshot Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-sm w-full p-4 flex flex-col items-center shadow-2xl">
            <div className="flex items-center justify-between w-full mb-3 text-white">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Private Camera</span>
              </span>
              <button onClick={closeCamera} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-4/3 bg-black rounded-xl overflow-hidden relative mb-4">
              <video ref={cameraVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={capturePhoto}
                className="w-14 h-14 rounded-full border-4 border-amber-400 bg-amber-500/20 hover:bg-amber-500/40 flex items-center justify-center transition active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Photo will be encrypted directly into your secret vault
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
