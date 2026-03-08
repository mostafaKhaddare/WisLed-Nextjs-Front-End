'use client'

import { useEffect, useState } from 'react'
import { WhatsappIcon } from '@modules/common/icons'

interface WhatsAppButtonProps {
  phoneNumber?: string
  defaultMessage?: string
  className?: string
}

export function WhatsAppButton({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '212710420420',
  defaultMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hello! I would like more information.',
  className = '',
}: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (!isVisible) return null

  const encodedMessage = encodeURIComponent(defaultMessage)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Contact us on WhatsApp"
      className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-200 ease-in-out hover:scale-125 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 small:bottom-8 small:right-8 ${className}`}
    >
      <WhatsappIcon className="h-6 w-6 text-white transition-transform duration-200" />
    </button>
  )
}
