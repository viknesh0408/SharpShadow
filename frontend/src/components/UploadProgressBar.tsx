import React from 'react';
import {
  FileCode,
  FileText,
  FileArchive,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Loader2,
  Lock,
} from 'lucide-react';

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface UploadProgressBarProps {
  fileName: string;
  fileSize?: string;
  progress: number; // 0 - 100
  loadedBytes?: number;
  totalBytes?: number;
  speed?: string;
  timeRemaining?: string;
  status: UploadStatus;
  errorMessage?: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
  onRemove?: () => void;
  onReplace?: () => void;
}

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const UploadProgressBar: React.FC<UploadProgressBarProps> = ({
  fileName,
  fileSize,
  progress,
  loadedBytes,
  totalBytes,
  speed,
  timeRemaining,
  status,
  errorMessage,
  onCancel,
  onRetry,
  onRemove,
  onReplace,
}) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';

  // Get file type configuration (Badge colors, icons, gradient bars)
  const getFileTypeConfig = () => {
    switch (ext) {
      case 'psd':
        return {
          type: 'PSD',
          badgeText: 'Photoshop PSD',
          badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          gradientClass: 'from-sky-500 via-blue-600 to-indigo-600',
          glowColor: 'rgba(14, 165, 233, 0.4)',
          icon: <LayersIcon />,
        };
      case 'pdf':
        return {
          type: 'PDF',
          badgeText: 'Adobe PDF Document',
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          gradientClass: 'from-rose-500 via-red-600 to-orange-500',
          glowColor: 'rgba(244, 63, 94, 0.4)',
          icon: <FileText className="w-5 h-5 text-rose-400" />,
        };
      case 'zip':
      case 'rar':
      case '7z':
        return {
          type: 'ZIP',
          badgeText: 'ZIP Archive',
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          gradientClass: 'from-purple-500 via-violet-600 to-fuchsia-600',
          glowColor: 'rgba(168, 85, 247, 0.4)',
          icon: <FileArchive className="w-5 h-5 text-purple-400" />,
        };
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return {
          type: ext.toUpperCase(),
          badgeText: `${ext.toUpperCase()} Graphic`,
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          gradientClass: 'from-emerald-500 via-teal-500 to-cyan-500',
          glowColor: 'rgba(16, 185, 129, 0.4)',
          icon: <ImageIcon className="w-5 h-5 text-emerald-400" />,
        };
      default:
        return {
          type: ext.toUpperCase() || 'FILE',
          badgeText: 'Digital Asset',
          badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          gradientClass: 'from-sharp-500 via-rose-600 to-pink-600',
          glowColor: 'rgba(230, 57, 70, 0.4)',
          icon: <FileCode className="w-5 h-5 text-sharp-400" />,
        };
    }
  };

  const fileConfig = getFileTypeConfig();
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full bg-dark-900 border border-dark-750 rounded-2xl p-4 sm:p-5 shadow-card-dark transition-all animate-in fade-in duration-300">
      {/* Top Header: File info & Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* File Icon Badge */}
          <div className="w-11 h-11 rounded-xl bg-dark-950 border border-dark-700 flex items-center justify-center shrink-0 shadow-inner">
            {fileConfig.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${fileConfig.badgeClass}`}>
                {fileConfig.badgeText}
              </span>
              {status === 'completed' && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Uploaded & Secured
                </span>
              )}
              {status === 'error' && (
                <span className="text-[10px] font-mono text-sharp-400 bg-sharp-500/10 border border-sharp-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Upload Failed
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-white truncate mt-1" title={fileName}>
              {fileName}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              {fileSize ? (
                <span>{fileSize}</span>
              ) : totalBytes ? (
                <span>{formatBytes(totalBytes)}</span>
              ) : null}

              {status === 'uploading' && loadedBytes && totalBytes ? (
                <>
                  <span>•</span>
                  <span>{formatBytes(loadedBytes)} / {formatBytes(totalBytes)}</span>
                </>
              ) : null}

              {status === 'uploading' && speed ? (
                <>
                  <span>•</span>
                  <span className="text-slate-300">{speed}</span>
                </>
              ) : null}

              {status === 'uploading' && timeRemaining ? (
                <>
                  <span>•</span>
                  <span className="text-slate-400">{timeRemaining}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(status === 'uploading' || status === 'processing') && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-dark-750 transition-colors"
              title="Cancel Upload"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {status === 'completed' && (
            <div className="flex items-center gap-2">
              {onReplace && (
                <button
                  type="button"
                  onClick={onReplace}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white border border-dark-700 transition-colors"
                >
                  Replace
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1.5 rounded-lg bg-dark-950 hover:bg-sharp-950/60 text-slate-400 hover:text-sharp-400 border border-dark-750 hover:border-sharp-500/30 transition-colors"
                  title="Remove File"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sharp-600 hover:bg-sharp-500 text-white transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-dark-750 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar Component (Active when uploading or processing) */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="space-y-2 mt-3">
          {/* Progress Bar Container */}
          <div className="w-full bg-dark-950 rounded-full h-3 p-0.5 border border-dark-750 overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${fileConfig.gradientClass} upload-progress-striped transition-all duration-300 ease-out relative`}
              style={{
                width: `${clampedProgress}%`,
                boxShadow: `0 0 12px ${fileConfig.glowColor}`,
              }}
            >
              {/* Glowing leading dot */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full shadow-[0_0_8px_#ffffff]" />
            </div>
          </div>

          {/* Progress text feedback */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-0.5">
            <div className="flex items-center gap-2">
              {clampedProgress >= 100 ? (
                <span className="text-amber-400 flex items-center gap-1.5 animate-pulse font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing & securing asset on server...
                </span>
              ) : (
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping inline-block" />
                  Uploading {fileConfig.type} file...
                </span>
              )}
            </div>
            <span className="font-bold text-white tracking-wider">{clampedProgress}%</span>
          </div>
        </div>
      )}

      {/* Success Details */}
      {status === 'completed' && (
        <div className="mt-2.5 pt-2.5 border-t border-dark-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400/90">
            <Lock className="w-3 h-3" />
            <span>Private Vault • Protected with HMAC tokens</span>
          </div>
          <span className="text-slate-500">Ready to publish</span>
        </div>
      )}

      {/* Error Details */}
      {status === 'error' && errorMessage && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-sharp-950/40 border border-sharp-500/20 text-xs text-sharp-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-sharp-400" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

// Custom PSD icon SVG
const LayersIcon: React.FC = () => (
  <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
