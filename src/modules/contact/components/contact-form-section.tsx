'use client'

import { useState, FormEvent, useRef } from 'react'

import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type FormIntroData = {
  Title?: string
  Text?: string
}

type FormErrors = {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}
  const name = data.get('name') as string
  const email = data.get('email') as string
  const message = data.get('message') as string
  const subject = data.get('subject') as string

  if (!name || name.trim().length < 2) {
    errors.name = 'Le nom doit comporter au moins 2 caractères'
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Veuillez entrer une adresse email valide'
  }
  if (!subject || subject === '') {
    errors.subject = 'Veuillez sélectionner un sujet'
  }
  if (!message || message.trim().length < 10) {
    errors.message = 'Le message doit comporter au moins 10 caractères'
  }

  return errors
}

/* ─── Reusable field wrapper ─── */
function FormField({
  label,
  id,
  error,
  optional = false,
  children,
}: {
  label: string
  id: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-semibold text-basic-primary/80 dark:text-white/70">
        {label}
        {!optional ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary dark:bg-white/[0.06] dark:text-white/30">
            Optionnel
          </span>
        )}
      </label>
      {children}
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}

/* ─── Input/Textarea style builders ─── */
const baseInput =
  'w-full rounded-xl border bg-primary px-4 py-3 text-[14px] text-basic-primary outline-none transition-all duration-200 placeholder:text-disabled dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/20'
const focusRing =
  'focus:border-brand-500/70 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10'
const errorBorder = 'border-red-400/70 bg-red-50/30 dark:border-red-400/40 dark:bg-red-900/10'
const normalBorder = 'border-basic-primary/10 hover:border-basic-primary/25 dark:border-white/[0.08] dark:hover:border-white/[0.16]'

/* ─── Success state ─── */
function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      {/* Animated checkmark circle */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-green-400/20" style={{ animationDuration: '1.5s' }} />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Heading className="text-2xl font-bold text-basic-primary dark:text-white">
          Message envoyé ! ✨
        </Heading>
        <Text className="max-w-[360px] leading-relaxed text-secondary dark:text-white/50">
          Merci ! Notre équipe vous répondra à <strong>info@wisled.ma</strong> dans les 24 heures ouvrables.
        </Text>
      </div>
      <button
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-basic-primary/10 px-6 py-2.5 text-sm font-semibold text-basic-primary transition-all duration-200 hover:bg-secondary dark:border-white/10 dark:text-white/80 dark:hover:bg-white/[0.05]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Envoyer un autre message
      </button>
    </div>
  )
}

/* ─── Main component ─── */
export const ContactFormSection = ({
  introData,
}: {
  introData: FormIntroData
}) => {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<FormErrors>({})
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const validationErrors = validateForm(formData)
    if (!privacyAccepted) {
      validationErrors.name = validationErrors.name || undefined
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstErrorEl = document.querySelector('[aria-invalid="true"]') as HTMLElement
      firstErrorEl?.focus()
      return
    }

    setErrors({})
    setStatus('loading')

    try {
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setStatus('success')
        formRef.current?.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setErrors({})
    setPrivacyAccepted(false)
    formRef.current?.reset()
  }

  return (
    <section className="relative overflow-hidden py-16 large:py-24">
      {/* Subtle decorative bg blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-brand-100/30 blur-[100px] dark:bg-brand-900/10" />
        <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-brand-50/40 blur-[100px] dark:bg-brand-800/10" />
      </div>

      <Container className="relative">
        {/* Section header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-50 px-4 py-2 dark:border-brand-500/20 dark:bg-brand-900/20">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
            <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-brand-600 dark:text-brand-400">
              Formulaire de contact
            </span>
          </div>
          <Heading className="mb-3 text-3xl font-black tracking-tight text-basic-primary dark:text-white small:text-4xl">
            {introData?.Title || 'Parlons de votre projet'}
          </Heading>
          <Text size="lg" className="mx-auto max-w-[580px] leading-relaxed text-secondary dark:text-white/50">
            {introData?.Text || 'Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les plus brefs délais.'}
          </Text>
        </div>

        <div className="grid gap-8 large:grid-cols-[380px_1fr] large:gap-12">

          {/* ── LEFT: Info Panel ── */}
          <div className="flex flex-col gap-5">

            {/* Contact info card */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-7 text-white shadow-xl dark:from-[#111318] dark:to-[#0d0f13]">
              {/* Card header */}
              <div className="mb-6">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                  Nos coordonnées
                </div>
                <h3 className="text-xl font-bold text-white">Contactez-nous directement</h3>
              </div>

              {/* Contact methods */}
              <div className="flex flex-col gap-5">
                {/* Email */}
                <a
                  href="mailto:info@wisled.ma"
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-brand-500/40 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/20">
                    <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Email</span>
                    <span className="text-sm font-semibold text-white transition-colors group-hover:text-brand-400">info@wisled.ma</span>
                  </div>
                  <svg className="ml-auto h-4 w-4 text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/212648522511"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-green-500/40 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/20">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">WhatsApp</span>
                    <span className="text-sm font-semibold text-white transition-colors group-hover:text-green-400">+212 648 522 511</span>
                  </div>
                  <svg className="ml-auto h-4 w-4 text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </a>

                {/* Hours */}
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                    <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Horaires</span>
                    <span className="text-sm font-semibold text-white">Lun – Ven: 09:00 – 18:00</span>
                    <span className="text-xs text-white/40">Sam – Dim: Fermé</span>
                  </div>
                </div>
              </div>

              {/* Decorative bottom gradient bar */}
              <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-400 opacity-60" />
            </div>

            {/* Response time badge */}
            <div className="flex items-center gap-3 rounded-xl border border-green-200/60 bg-green-50 px-4 py-3.5 dark:border-green-800/30 dark:bg-green-900/15">
              <div className="relative">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-60" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-green-800 dark:text-green-400">Réponse rapide garantie</span>
                <span className="text-[11px] text-green-700/70 dark:text-green-500/60">Généralement sous 24h ouvrables</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔒', label: 'Données sécurisées' },
                { icon: '⚡', label: 'Réponse rapide' },
                { icon: '🇲🇦', label: 'Équipe locale' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-basic-primary/8 bg-secondary/40 px-3 py-3 text-center dark:border-white/[0.05] dark:bg-white/[0.02]">
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-[11px] font-semibold leading-tight text-secondary dark:text-white/40">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Form Card ── */}
          <div className="overflow-hidden rounded-2xl border border-basic-primary/10 bg-primary shadow-xl shadow-black/5 dark:border-white/[0.07] dark:bg-[#0f1115] dark:shadow-black/40">
            {/* Card top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-400" />

            <div className="p-7 large:p-10">
              {status === 'success' ? (
                <SuccessState onReset={resetForm} />
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                  {/* Error banner */}
                  {status === 'error' && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-800/50 dark:bg-red-900/20"
                    >
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Une erreur est survenue</p>
                        <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/70">
                          Veuillez réessayer ou nous contacter directement à{' '}
                          <a href="mailto:info@wisled.ma" className="underline">info@wisled.ma</a>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form title */}
                  <div>
                    <h3 className="text-xl font-bold text-basic-primary dark:text-white">Envoyez-nous un message</h3>
                    <p className="mt-1 text-[13px] text-secondary dark:text-white/40">Tous les champs marqués <span className="text-red-500">*</span> sont obligatoires.</p>
                  </div>

                  {/* Name + Email */}
                  <div className="grid gap-4 small:grid-cols-2">
                    <FormField label="Nom complet" id="contact-name" error={errors.name}>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        placeholder="ex. Mohammed Alami"
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        aria-invalid={!!errors.name}
                        className={`${baseInput} ${focusRing} ${errors.name ? errorBorder : normalBorder}`}
                      />
                    </FormField>
                    <FormField label="Email" id="contact-email" error={errors.email}>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        placeholder="exemple@wisled.ma"
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        aria-invalid={!!errors.email}
                        className={`${baseInput} ${focusRing} ${errors.email ? errorBorder : normalBorder}`}
                      />
                    </FormField>
                  </div>

                  {/* Phone + Subject */}
                  <div className="grid gap-4 small:grid-cols-2">
                    <FormField label="Téléphone" id="contact-phone" error={errors.phone} optional>
                      <div className="flex overflow-hidden rounded-xl border transition-all duration-200 focus-within:ring-4 focus-within:ring-brand-500/10 dark:focus-within:ring-brand-400/10 border-basic-primary/10 hover:border-basic-primary/25 dark:border-white/[0.08] dark:hover:border-white/[0.16] focus-within:border-brand-500/70 dark:focus-within:border-brand-400/50">
                        <span className="flex shrink-0 items-center border-r border-basic-primary/10 bg-secondary px-3.5 text-[13px] font-semibold text-secondary dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white/30">
                          +212
                        </span>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          placeholder="6XX XXX XXX"
                          className="flex-1 bg-primary px-4 py-3 text-[14px] text-basic-primary outline-none placeholder:text-disabled dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/20"
                        />
                      </div>
                    </FormField>
                    <FormField label="Sujet" id="contact-subject" error={errors.subject}>
                      <select
                        id="contact-subject"
                        name="subject"
                        required
                        defaultValue=""
                        aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                        aria-invalid={!!errors.subject}
                        className={`${baseInput} ${focusRing} ${errors.subject ? errorBorder : normalBorder} cursor-pointer appearance-none bg-no-repeat`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center', backgroundSize: '16px', paddingRight: '42px' }}
                      >
                        <option value="" disabled>Sélectionner un sujet</option>
                        <option value="Devis pour projet d'éclairage">Devis pour projet d&apos;éclairage</option>
                        <option value="Support technique">Support technique</option>
                        <option value="Partenariat">Partenariat</option>
                        <option value="Question produit">Question produit</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </FormField>
                  </div>

                  {/* Message */}
                  <FormField label="Message" id="contact-message" error={errors.message}>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Décrivez votre projet, votre question, ou comment nous pouvons vous aider..."
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      aria-invalid={!!errors.message}
                      className={`${baseInput} ${focusRing} ${errors.message ? errorBorder : normalBorder} resize-none`}
                    />
                  </FormField>

                  {/* Privacy checkbox */}
                  <label className="group flex cursor-pointer items-start gap-3">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="peer h-4 w-4 cursor-pointer rounded border-basic-primary/20 text-brand-500 transition-all focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                    <span className="text-[13px] leading-relaxed text-secondary dark:text-white/50">
                      J&apos;accepte la{' '}
                      <LocalizedClientLink
                        href="/privacy-policy"
                        className="font-semibold text-action-primary underline-offset-2 hover:underline dark:text-brand-400"
                      >
                        politique de confidentialité
                      </LocalizedClientLink>{' '}
                      et consens au traitement de mes données personnelles.
                    </span>
                  </label>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === 'loading' || !privacyAccepted}
                    className="group relative mt-1 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-[15px] font-bold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:from-brand-700 hover:to-brand-600 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {/* Shimmer overlay */}
                    {status !== 'loading' && (
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    )}

                    {status === 'loading' ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        <span>Envoyer le message</span>
                      </>
                    )}
                  </button>

                  {/* Quick WhatsApp fallback */}
                  <div className="text-center text-[12px] text-secondary dark:text-white/30">
                    Ou contactez-nous directement sur{' '}
                    <a
                      href="https://wa.me/212648522511"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-green-600 hover:underline dark:text-green-400"
                    >
                      WhatsApp ↗
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
