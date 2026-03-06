'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  data: string
  size?: number
  className?: string
}

export default function QRCodeGenerator({ 
  data, 
  size = 256, 
  className = '' 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff' // White
        }
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error)
        }
      })
    }
  }, [data, size])

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="border rounded-lg shadow-md"
      />
    </div>
  )
}