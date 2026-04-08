import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Button } from './ui/button';

interface MediaUploadProps {
  onImageSelect: (dataUrl: string) => void;
  onVideoSelect?: (dataUrl: string) => void;
  currentImage?: string;
  currentVideo?: string;
  allowVideo?: boolean;
}

export function MediaUpload({ 
  onImageSelect, 
  onVideoSelect, 
  currentImage, 
  currentVideo,
  allowVideo = true 
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [videoPreview, setVideoPreview] = useState<string | null>(currentVideo || null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Compress image client-side to avoid huge base64 payloads
  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = (h * maxWidth) / w;
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const compressed = await compressImage(file);
      setPreview(compressed);
      onImageSelect(compressed);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Check file size (max 50MB for demo)
      if (file.size > 50 * 1024 * 1024) {
        alert('Video file is too large. Please select a video under 50MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setVideoPreview(result);
        onVideoSelect?.(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageSelect('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeVideo = () => {
    setVideoPreview(null);
    onVideoSelect?.('');
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Food Photo</label>
        {preview ? (
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#2D6A4F] hover:bg-[#2D6A4F]/5 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">Click to upload food photo</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </div>
        )}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Video Upload */}
      {allowVideo && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Food Video <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          {videoPreview ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
              <video src={videoPreview} controls className="w-full h-64 object-cover bg-black" />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#2D6A4F] hover:bg-[#2D6A4F]/5 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <VideoIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Click to upload video</p>
                <p className="text-xs text-gray-500">MP4, MOV up to 50MB</p>
              </div>
            </div>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
