"use client"

import { useState } from "react"

export default function StoreBanner() {
  const [open, setOpen] = useState(true)

  if (!open) return null

  return (
    <div className="relative flex items-center justify-between w-full px-4 py-2 bg-muted/30 backdrop-blur-sm border-b">
      
      {/* Background subtle gradient */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#ff80b533,#9089fc33)] opacity-40 blur-xl" />

      <div className="flex items-center gap-2">
        <p className="text-sm text-foreground/80">
          <strong className="font-semibold text-foreground">Winter Sale</strong>
          <span className="mx-2">•</span>
          Up to 40% off on LED strips & controllers.
        </p>

        <a
          href="#"
          className="text-sm px-3 py-1 rounded-full bg-foreground text-background hover:bg-foreground/80 transition"
        >
          Shop now →
        </a>
      </div>

      {/* Close button */}
      <button
        onClick={() => setOpen(false)}
        className="p-2 rounded-md hover:bg-muted transition"
        aria-label="Close banner"
      >
       X
      </button>
    </div>
  )
}