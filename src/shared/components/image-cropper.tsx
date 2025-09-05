"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, type PixelCrop } from '../lib/crop-image';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
  aspect?: number;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * ImageCropper component that allows users to crop images.
 * The cropped image is resized to a minimum of 750x750px, or keeps
 * the original size if it's larger than 750x750px to ensure
 * the backend can generate all required formats (small, medium, squared, etc.)
 */

export function ImageCropper({
  image,
  onCropComplete,
  onClose,
  aspect = 1,
  minZoom = 1,
  maxZoom = 3,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      // Resize cropped image to minimum 750x750px, or keep original size if larger
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, 750);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  }, [croppedAreaPixels, image, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-96 bg-gray-100">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            minZoom={minZoom}
            maxZoom={maxZoom}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                position: 'relative',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-4 border-t">
          <div className="mb-4">
            <label htmlFor="zoom" className="block text-sm font-medium mb-2">
              Zoom
            </label>
            <input
              id="zoom"
              type="range"
              value={zoom}
              min={minZoom}
              max={maxZoom}
              step={0.1}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCropImage} disabled={!croppedAreaPixels}>
              Crop and Save Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
