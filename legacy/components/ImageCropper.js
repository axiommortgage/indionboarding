import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../helpers/cropImage'
import style from '../styles/Profile.module.scss'

const ImageCropper = ({ image, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = (crop) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom) => {
    setZoom(zoom)
  }

  const onCropAreaComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, image, onCropComplete])

  return (
    <div className={style.cropperContainer}>
      <div className={style.cropper}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
        />
      </div>
      <div className={style.controls}>
        <label htmlFor="zoom">Zoom</label>
        <input
          id="zoom"
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => {
            setZoom(parseFloat(e.target.value))
          }}
          className={style.zoomRange}
        />
      </div>
      <button onClick={handleCropImage} className={style.cropButton}>
        Crop and Save Image
      </button>
    </div>
  )
}

export default ImageCropper
