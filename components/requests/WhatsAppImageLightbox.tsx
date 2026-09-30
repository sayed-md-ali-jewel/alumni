'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';

interface WhatsAppImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  caption?: string;
  senderName?: string;
  timestamp?: string;
  onClose: () => void;
}

export function WhatsAppImageLightbox({
  isOpen,
  imageUrl,
  caption,
  senderName,
  timestamp,
  onClose,
}: WhatsAppImageLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/80 border-b border-white/10 text-white z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-4">
          <p className="text-sm font-bold truncate text-white">
            {senderName || 'Photo Preview'}
          </p>
          {timestamp && (
            <p className="text-xs text-slate-400">{timestamp}</p>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 h-9 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            title="Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Download / Open Full Image"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600/80 flex items-center justify-center text-white transition-colors ml-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        <div
          className="transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={caption || 'Preview image'}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl select-none"
          />
        </div>
      </div>

      {/* Caption at bottom if available */}
      {caption && (
        <div
          className="p-4 bg-slate-900/90 border-t border-white/10 text-center text-sm font-medium text-white/90 max-w-2xl mx-auto rounded-t-2xl z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
