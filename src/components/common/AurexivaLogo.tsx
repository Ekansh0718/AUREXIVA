import React from 'react'

interface AurexivaLogoProps {
  className?: string
  width?: number | string
  height?: number | string
  showText?: boolean
  light?: boolean
}

export const AurexivaLogo: React.FC<AurexivaLogoProps> = (props) => {
  const { className, light = false } = props
  const color = light ? '#FFFFFF' : '#111111'

  return (
    <span
      className={`font-bold tracking-[0.22em] text-[20px] uppercase font-sans select-none block transition-colors duration-300 ${className || ''}`}
      style={{ color }}
    >
      AUREXIVA
    </span>
  )
}
