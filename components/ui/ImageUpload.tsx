'use client';

import * as React from 'react';
import { UploadCloud, Camera, Trash2, Loader2, Link2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  fallbackName?: string;
  shape?: 'circle' | 'rectangle';
  label?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  fallbackName = 'User',
  shape = 'circle',
  label,
  helperText,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [customUrl, setCustomUrl] = React.useState(value || '');
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setCustomUrl(value || '');
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, or GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
      setCustomUrl(data.url);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange('');
    setCustomUrl('');
    setUploadError(null);
  };

  const handleApplyUrl = () => {
    onChange(customUrl.trim());
    setShowUrlInput(false);
  };

  if (shape === 'circle') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {/* Avatar with Upload Overlay */}
          <div
            className={cn(
              'relative group cursor-pointer rounded-full transition-transform',
              isDragging && 'scale-105 ring-4 ring-primary/40',
              disabled && 'cursor-not-allowed opacity-70'
            )}
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Avatar
              src={value}
              fallback={fallbackName}
              size="xl"
              className="w-24 h-24 ring-2 ring-primary/20 shadow-md transition-all"
            />

            {/* Hover overlay with Camera Icon */}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold backdrop-blur-[2px]">
              <Camera className="w-5 h-5 mb-1" />
              <span>Change</span>
            </div>

            {/* Uploading Spinner */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-xs font-medium backdrop-blur-sm z-10">
                <Loader2 className="w-6 h-6 animate-spin mb-1 text-primary" />
                <span>Uploading...</span>
              </div>
            )}
          </div>

          {/* Action buttons & Info */}
          <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isUploading}
              />

              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="gap-1.5 rounded-xl font-semibold shadow-sm"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>{value ? 'Upload New Photo' : 'Upload Photo'}</span>
              </Button>

              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="gap-1.5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{showUrlInput ? 'Hide URL' : 'Use URL'}</span>
              </Button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {helperText || 'Supports JPG, PNG, WEBP or GIF. Max file size: 5MB.'}
            </p>

            {/* Optional URL Input Fallback */}
            {showUrlInput && (
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="h-9 text-xs rounded-xl flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleApplyUrl}
                  className="h-9 text-xs gap-1 rounded-xl"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply</span>
                </Button>
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rectangle layout (for Cover Images, News, Events, Deposit Slips)
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-56">
          <img
            src={value}
            alt="Uploaded Preview"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100"
            >
              <Camera className="w-4 h-4" />
              <span>Change Image</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading}
              className="gap-1.5 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/60',
            isDragging
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-slate-300 dark:border-slate-700',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-semibold">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click to browse or drag and drop image here
              </p>
              <p className="text-[11px] text-slate-400">
                {helperText || 'Supports JPG, PNG, WEBP, GIF up to 5MB'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL fallback toggle */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide manual URL' : 'Or paste image URL directly'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="h-9 text-xs rounded-xl flex-1"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleApplyUrl}
            className="h-9 text-xs gap-1 rounded-xl"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </Button>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
