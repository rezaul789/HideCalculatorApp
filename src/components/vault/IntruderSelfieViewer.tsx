import React, { useState, useRef } from 'react';
import {
  Camera,
  Trash2,
  ShieldAlert,
  Clock,
  KeyRound,
  CheckCircle,
  Eye,
  AlertTriangle,
  Sparkles,
  X
} from 'lucide-react';
import { IntruderLog } from '../../types/vault';
import { StorageService } from '../../services/storage';

interface IntruderSelfieViewerProps {
  logs: IntruderLog[];
  onLogsUpdated: (logs: IntruderLog[]) => void;
}

export const IntruderSelfieViewer: React.FC<IntruderSelfieViewerProps> = ({
  logs,
  onLogsUpdated,
}) => {
  const [selectedLog, setSelectedLog] = useState<IntruderLog | null>(null);
  const [isCapturingTest, setIsCapturingTest] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleClearLogs = () => {
    if (!confirm('Clear all recorded intruder snapshots?')) return;
    StorageService.clearIntruderLogs();
    onLogsUpdated([]);
  };

  const handleTestCapture = async () => {
    setIsCapturingTest(true);
    let photoUrl = '/src/assets/images/intruder_selfie_demo_1792656198403.jpg';

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          await new Promise((r) => setTimeout(r, 600));

          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 640;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 480, 640);
            photoUrl = canvas.toDataURL('image/jpeg', 0.85);
          }
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    } catch (err) {
      console.log('Using simulated camera snapshot', err);
    }

    const testLog: IntruderLog = {
      id: 'log-' + Date.now(),
      timestamp: Date.now(),
      attemptPin: '6789',
      photoUrl,
      deviceInfo: 'Manual Security Test Trigger',
      resolved: false,
    };

    StorageService.addIntruderLog(testLog);
    onLogsUpdated(StorageService.getIntruderLogs());
    setIsCapturingTest(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-rose-400" />
            <span>Intruder Selfie Logs</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Captures front-camera photo when wrong PIN is entered 3 times
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestCapture}
            disabled={isCapturingTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs transition border border-rose-500/30"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCapturingTest ? 'Snapping...' : 'Test Capture'}</span>
          </button>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Clear Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="m-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
        <p className="text-xs text-rose-200/90 leading-relaxed">
          Anyone attempting to guess your calculator PIN will be discreetly photographed without sound or screen flash.
        </p>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
            <h4 className="text-xs font-semibold text-white">No Intruders Detected</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1">
              Your secret vault has had zero unauthorized access attempts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex gap-3 cursor-pointer hover:border-slate-700 transition"
              >
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-black shrink-0 relative">
                  <img
                    src={log.photoUrl}
                    alt="Intruder snapshot"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-rose-600 text-[9px] font-bold px-1 rounded text-white">
                    ALERT
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-0.5 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-300 font-semibold mb-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Attempted: &quot;{log.attemptPin}&quot;</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {log.deviceInfo}
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-400 hover:underline">
                    Tap to enlarge &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snapshot Lightbox Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Intruder Record Details</span>
              </span>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-3/4 rounded-xl overflow-hidden bg-black border border-slate-800">
              <img
                src={selectedLog.photoUrl}
                alt="Intruder full preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-slate-300">
                <span>Timestamp:</span>
                <span className="font-mono text-slate-400">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Attempted PIN:</span>
                <span className="font-mono font-bold text-rose-400">{selectedLog.attemptPin}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Trigger Reason:</span>
                <span className="text-slate-400">{selectedLog.deviceInfo}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
