'use client'

import { useState, FormEvent, useRef } from 'react'

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
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0F1B33]"
      >
        {label}
        {!optional ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="rounded-full bg-[#F7F8FC] px-2 py-0.5 text-[10px] font-medium text-[#5B6577]">
            Optionnel
          </span>
        )}
      </label>
      {children}
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-500"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  )
}

const baseInput =
  'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-[#0F1B33] outline-none transition-all duration-200 placeholder:text-[#9CA3AF]'
const focusRing = 'focus:border-[#1D4ED8] focus:ring-4 focus:ring-[#1D4ED8]/10'
const errorBorder = 'border-red-400/70 bg-red-50'
const normalBorder =
  'border-[#E5E7EB] hover:border-[#D1D5DB]'

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div
          className="absolute inset-0 animate-ping rounded-full bg-green-400/20"
          style={{ animationDuration: '1.5s' }}
        />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Heading className="text-2xl font-bold text-[#0F1B33]">
          Message envoyé !
        </Heading>
        <Text className="max-w-[360px] leading-relaxed text-[#5B6577]">
          Merci ! Notre équipe vous répondra à{' '}
          <strong>info@wisled.ma</strong> dans les 24 heures ouvrables.
        </Text>
      </div>
      <button
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-6 py-2.5 text-sm font-semibold text-[#0F1B33] transition-all duration-200 hover:bg-[#F7F8FC]"
      >
        Envoyer un autre message
      </button>
    </div>
  )
}

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

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstErrorEl = document.querySelector(
        '[aria-invalid="true"]'
      ) as HTMLElement
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
    <section className="bg-[#F7F8FC] py-16 large:py-24">
      <Container>
        <div className="mb-12 text-center">
          <Heading className="mb-3 text-3xl font-black tracking-tight text-[#0F1B33] small:text-4xl">
            {introData?.Title || 'Parlons de votre projet'}
          </Heading>
          <Text className="mx-auto max-w-[580px] leading-relaxed text-[#5B6577]">
            {introData?.Text ||
              'Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les plus brefs délais.'}
          </Text>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-7 shadow-[0_1px_3px_rgba(15,27,51,0.06),0_4px_20px_rgba(15,27,51,0.08)] large:p-10">
            {status === 'success' ? (
              <SuccessState onReset={resetForm} />
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-6"
              >
                {status === 'error' && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Une erreur est survenue
                      </p>
                      <p className="mt-0.5 text-xs text-red-600/80">
                        Veuillez réessayer ou nous contacter directement à{' '}
                        <a
                          href="mailto:info@wisled.ma"
                          className="underline"
                        >
                          info@wisled.ma
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-[#0F1B33]">
                    Envoyez-nous un message
                  </h3>
                  <p className="mt-1 text-[13px] text-[#5B6577]">
                    Tous les champs marqués{' '}
                    <span className="text-red-500">*</span> sont obligatoires.
                  </p>
                </div>

                <div className="grid gap-4 small:grid-cols-2">
                  <FormField
                    label="Nom complet"
                    id="contact-name"
                    error={errors.name}
                  >
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="ex. Mohammed Alami"
                      aria-describedby={
                        errors.name ? 'contact-name-error' : undefined
                      }
                      aria-invalid={!!errors.name}
                      className={`${baseInput} ${focusRing} ${errors.name ? errorBorder : normalBorder}`}
                    />
                  </FormField>

                  <FormField
                    label="Email"
                    id="contact-email"
                    error={errors.email}
                  >
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="exemple@wisled.ma"
                      aria-describedby={
                        errors.email ? 'contact-email-error' : undefined
                      }
                      aria-invalid={!!errors.email}
                      className={`${baseInput} ${focusRing} ${errors.email ? errorBorder : normalBorder}`}
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 small:grid-cols-2">
                  <FormField
                    label="Téléphone"
                    id="contact-phone"
                    error={errors.phone}
                    optional
                  >
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="6X XX XX XX"
                      className={`${baseInput} ${focusRing} ${errors.phone ? errorBorder : normalBorder}`}
                    />
                  </FormField>

                  <FormField
                    label="Sujet"
                    id="contact-subject"
                    error={errors.subject}
                  >
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      defaultValue=""
                      aria-describedby={
                        errors.subject ? 'contact-subject-error' : undefined
                      }
                      aria-invalid={!!errors.subject}
                      className={`${baseInput} ${focusRing} ${errors.subject ? errorBorder : normalBorder} cursor-pointer appearance-none bg-no-repeat`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E\")",
                        backgroundPosition: 'right 14px center',
                        backgroundSize: '16px',
                        paddingRight: '42px',
                      }}
                    >
                      <option value="" disabled>
                        Sélectionner un sujet
                      </option>
                      <option value="Devis pour projet d'éclairage">
                        Devis pour projet d&apos;éclairage
                      </option>
                      <option value="Support technique">
                        Support technique
                      </option>
                      <option value="Partenariat">Partenariat</option>
                      <option value="Question produit">
                        Question produit
                      </option>
                      <option value="Autre">Autre</option>
                    </select>
                  </FormField>
                </div>

                <FormField
                  label="Message"
                  id="contact-message"
                  error={errors.message}
                >
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Décrivez votre projet, votre question, ou comment nous pouvons vous aider..."
                    aria-describedby={
                      errors.message ? 'contact-message-error' : undefined
                    }
                    aria-invalid={!!errors.message}
                    className={`${baseInput} ${focusRing} ${errors.message ? errorBorder : normalBorder} resize-none`}
                  />
                </FormField>

                <label className="group flex cursor-pointer items-start gap-3">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="peer h-4 w-4 cursor-pointer rounded border-[#D1D5DB] text-[#1D4ED8] transition-all focus:ring-2 focus:ring-[#1D4ED8]/30"
                    />
                  </div>
                  <span className="text-[13px] leading-relaxed text-[#5B6577]">
                    J&apos;accepte la{' '}
                    <LocalizedClientLink
                      href="/privacy-policy"
                      className="font-semibold text-[#1D4ED8] underline-offset-2 hover:underline"
                    >
                      politique de confidentialité
                    </LocalizedClientLink>{' '}
                    et consens au traitement de mes données personnelles.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={status === 'loading' || !privacyAccepted}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#1D4ED8] py-4 text-[15px] font-bold text-white shadow-lg shadow-[#1D4ED8]/25 transition-all duration-300 hover:bg-[#1D4ED8]/90 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {status === 'loading' ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>

                <div className="text-center text-[12px] text-[#5B6577]">
                  Ou contactez-nous directement sur{' '}
                  <a
                    href="https://wa.me/212710420420"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-green-600 hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
