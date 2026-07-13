import React from 'react'

interface AurexivaLogoProps {
  className?: string
  /** Height in pixels; width scales automatically to preserve aspect ratio. */
  height?: number
}

export const AurexivaLogo: React.FC<AurexivaLogoProps> = ({ className, height = 44 }) => {
  return (
    <img
      src="/aurexiva-logo.png"
      alt="AUREXIVA Product"
      height={height}
      className={`w-auto object-contain select-none ${className || ''}`}
      style={{ height }}
    />
  )
}
