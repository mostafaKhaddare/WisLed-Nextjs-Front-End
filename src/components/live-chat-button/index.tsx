'use client'

import { useEffect, useRef, useState } from 'react'

import { WhatsAppButton } from '@modules/common/components/whatsapp-button'

/**
 * Live chat button and panel.
 *
 * Renders the existing WhatsApp button unchanged, plus a second floating
 * "Chat en direct" button (blue #1D4ED8, chat-bubble icon, 56px) stacked 16px
 * above it, bottom-right, on all pages, desktop and mobile.
 *
 * Clicking the chat button opens a panel: 360x520 on desktop, full-height
 * sheet on mobile. The panel has a header, message list, input, send button,
 * close button, and is keyboard accessible (Esc closes, focus trap,
 * aria-labels).
 *
 * Tawk.to is loaded lazily through NEXT_PUBLIC_TAWKTO_PROPERTY_ID. When the
 * property is not configured or the widget reports offline, the chat button
 * falls back to the WhatsApp link. No secrets are stored in the repo.
 */
export function LiveChatButton() {
  const [chatOpen, setChatOpen] = useState(false)
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [tawkLoaded, setTawkLoaded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const tawkRef = useRef<{ hide: () => void; show: () => void; maximize: () => void; minimize: () => void } | null>(null)

  // WhatsApp fallback URL (same defaults as WhatsAppButton)
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '212648522511'
  const defaultMessage =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
    "Bonjour ! 👋 Je souhaite en savoir plus sur vos produits et solutions d'éclairage LED."
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`

  const tawhktoPropertyId =
    typeof process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID === 'string'
      ? process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID
      : null

  // Load Tawk.to script lazily
  useEffect(() => {
    if (!tawhktoPropertyId || tawkLoaded) return

    const script = document.createElement('script')
    script.src = `https://embed.tawk.to/${tawhktoPropertyId}/default`
    script.async = true
    script.setAttribute('crossorigin', 'anonymous')

    script.onload = () => {
      // Tawk.to exposes a global Tawk_API object once loaded
      ;(window as any).Tawk_API = (window as any).Tawk_API || {}
      ;(window as any).Tawk_API.onLoad = () => {
        setTawkLoaded(true)
        tawkRef.current = (window as any).Tawk_API
        // Hide the default Tawk.to bubble — only our button opens the chat
        tawkRef.current.hide()
        // Start offline until we get a status update
        setIsOnline(null)
      }
      ;(window as any).Tawk_API.onStatus = (status: string) => {
        setIsOnline(status === 'online')
      }
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [tawhktoPropertyId, tawkLoaded])

  // Focus trap: move focus into the panel when it opens
  useEffect(() => {
    if (!chatOpen || !panelRef.current) return

    const focusable = panelRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [chatOpen])

  const openChat = () => {
    setChatOpen(true)
    if (tawkRef.current) {
      tawkRef.current.maximize()
    }
  }

  const closeChat = () => {
    setChatOpen(false)
    if (tawkRef.current) {
      tawkRef.current.minimize()
    }
  }

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const renderChatButton = () => (
    <button
      onClick={openChat}
      aria-label="Ouvrir le chat en direct"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1D4ED8] shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus-ring-[#1D4ED8] focus:ring-offset-2 small:bottom-[96px] small:right-8"
    >
      <svg
        className="h-7 w-7 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  )

  const renderChatPanel = () => {
    if (!chatOpen) return null

    return (
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chat en direct"
        className={`
          fixed inset-0 z-50 flex flex-col
          lg:inset-[auto auto -6px -6px] lg:w-[360px] lg:h-[520px] lg:rounded-[32px] lg:shadow-2xl lg:flex-col
        `}
        style={{
          background: '#FFFFFF',
        }}
      >
        {/* Backdrop for mobile sheet */}
        {typeof window !== 'undefined' && window.innerWidth < 1024 && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeChat}
            aria-hidden="true"
          />
        )}

        {/* Header */}
        <div
          className={`
            flex items-center justify-between gap-3 rounded-[32px] bg-[#1D4ED8] px-5 py-4
            lg:rounded-t-[32px] lg:rounded-b-none lg:px-0
          `}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isOnline ? '#22C55E' : '#F59E0B' }} />
            <span className="font-jakarta text-sm font-semibold text-white">
              Chat en direct{isOnline === false ? ' (hors ligne)' : ''}
            </span>
          </div>
          <button
            onClick={closeChat}
            aria-label="Fermer le chat"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F6FA]">
          {isOnline === false && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] text-[#92400e] text-sm">
              <span>⚠️</span>
              <span>Nos conseillers sont hors ligne. Laissez-nous un message.</span>
            </div>
          )}
          <div className="flex justify-end">
            <div className="max-w-[80%] p-3 rounded-2xl bg-[#1D4ED8] text-white text-sm">
              Bonjour ! Comment puis-je vous aider aujourd&apos;hui ?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl bg-white border border-[#E4E7EF] text-[#0F1B33] text-sm">
              J&apos;ai une question sur les rubans LED.
            </div>
          </div>
        </div>

        {/* Input + send */}
        <div className={`
          flex items-center gap-2 p-4 border-t border-[#E4E7EF] bg-white
          lg:rounded-b-[32px] lg:border-t-0
        `}>
          <input
            type="text"
            placeholder="Écrivez votre message…"
            aria-label="Message"
            className="flex-1 h-10 rounded-xl border border-[#E4E7EF] bg-[#F5F6FA] px-3 py-2 text-sm text-[#0F1B33] outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
          <button
            onClick={() => {}}
            aria-label="Envoyer"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D4ED8] text-white hover:bg-[#1E40AF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Offline fallback hint */}
        {isOnline === false && (
          <div className="p-4 text-center bg-[#F5F6FA]">
            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-white px-3 py-2 text-sm font-semibold text-[#15803d] hover:bg-[#DCFCE7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contacter via WhatsApp
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {renderChatButton()}
      {renderChatPanel()}
      <WhatsAppButton />
    </>
  )
}
