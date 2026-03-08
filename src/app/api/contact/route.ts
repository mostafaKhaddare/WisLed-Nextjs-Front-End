import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// ── Subject config ─────────────────────────────────────────────────────────────
// Each subject gets its own accent color, emoji, and priority label.
const SUBJECT_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string; priority: string }> = {
  "Devis pour projet d'éclairage": {
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    emoji: '💡',
    priority: 'Haute priorité',
  },
  'Support technique': {
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    emoji: '🔧',
    priority: 'Support',
  },
  'Partenariat': {
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    emoji: '🤝',
    priority: 'Partenariat',
  },
  'Question produit': {
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    emoji: '❓',
    priority: 'Question',
  },
  'Autre': {
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    emoji: '📩',
    priority: 'Général',
  },
}

const DEFAULT_SUBJECT_CONFIG = {
  color: '#6b7280',
  bg: '#f9fafb',
  border: '#e5e7eb',
  emoji: '📩',
  priority: 'Général',
}

function buildEmailHtml({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}): string {
  const cfg = SUBJECT_CONFIG[subject || ''] || DEFAULT_SUBJECT_CONFIG
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const safeMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nouveau contact WisLed</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

        <!-- ══ LOGO HEADER ══════════════════════════════════════════════ -->
        <tr>
          <td style="padding-bottom:20px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block;">
              <tr>
                <td style="background:#0f172a;border-radius:12px;padding:12px 24px;">
                  <span style="font-size:20px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">Wis<span style="color:#f59e0b;">Led</span></span>
                  <span style="font-size:11px;color:rgba(255,255,255,0.4);margin-left:8px;letter-spacing:0.08em;text-transform:uppercase;">Maroc</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ MAIN CARD ═════════════════════════════════════════════════ -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">

            <!-- Top accent gradient bar -->
            <div style="height:4px;background:linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#10b981 100%);"></div>

            <!-- ── CARD HEADER ──────────────────────────────────────── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 36px 28px;">

                  <!-- Subject badge -->
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                    <tr>
                      <td style="background:${cfg.bg};border:1.5px solid ${cfg.border};border-radius:100px;padding:6px 14px;">
                        <span style="font-size:12px;font-weight:700;color:${cfg.color};letter-spacing:0.04em;">
                          ${cfg.emoji}&nbsp;&nbsp;${cfg.priority}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">
                    Nouveau message de contact
                  </h1>
                  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);">
                    Reçu le ${dateStr} à ${timeStr}
                  </p>
                </td>
              </tr>
            </table>

            <!-- ── SUBJECT HIGHLIGHT BANNER ─────────────────────────── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:${cfg.bg};border-bottom:1px solid ${cfg.border};padding:16px 36px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:40px;height:40px;background:${cfg.color};border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">
                        ${cfg.emoji}
                      </td>
                      <td style="padding-left:14px;">
                        <div style="font-size:11px;font-weight:700;color:${cfg.color};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px;">Sujet de la demande</div>
                        <div style="font-size:17px;font-weight:800;color:#0f172a;">${subject || 'Non spécifié'}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- ── CONTACT INFO ─────────────────────────────────────── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 36px 0;">

              <!-- Name + Email row -->
              <tr>
                <td width="50%" style="padding-bottom:20px;padding-right:12px;vertical-align:top;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:10.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">👤 Nom</div>
                    <div style="font-size:16px;font-weight:700;color:#0f172a;">${name}</div>
                  </div>
                </td>
                <td width="50%" style="padding-bottom:20px;padding-left:12px;vertical-align:top;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:10.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">✉️ Email</div>
                    <a href="mailto:${email}" style="font-size:15px;font-weight:700;color:#3b82f6;text-decoration:none;">${email}</a>
                  </div>
                </td>
              </tr>

              <!-- Phone row -->
              <tr>
                <td colspan="2" style="padding-bottom:24px;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:10.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">📞 Téléphone</div>
                    <div style="font-size:16px;font-weight:700;color:${phone ? '#0f172a' : '#cbd5e1'};">
                      ${phone ? `+212 ${phone}` : 'Non renseigné'}
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- ── MESSAGE BOX ─────────────────────────────────────── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px 28px;">
              <tr>
                <td>
                  <div style="font-size:10.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px;">💬 Message</div>
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${cfg.color};border-radius:12px;padding:20px 22px;font-size:15px;color:#334155;line-height:1.75;">
                    ${safeMessage}
                  </div>
                </td>
              </tr>
            </table>

            <!-- ── REPLY CTA ────────────────────────────────────────── -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px 36px;">
              <tr>
                <td>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="48%" style="padding-right:8px;">
                        <a href="mailto:${email}?subject=Re%3A%20${encodeURIComponent(subject || 'Votre demande')}"
                           style="display:block;text-align:center;background:#0f172a;color:#ffffff;padding:14px 20px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.01em;">
                          ↩&nbsp; Répondre à ${name}
                        </a>
                      </td>
                      <td width="52%" style="padding-left:8px;">
                        <a href="https://wa.me/212710420420?text=${encodeURIComponent(`Bonjour ${name}, j'ai bien reçu votre message concernant "${subject}". `)}"
                           style="display:block;text-align:center;background:#25d366;color:#ffffff;padding:14px 20px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;">
                          WhatsApp ${name} →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ══ FOOTER ════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
              Formulaire de contact — <strong style="color:#64748b;">wisled.ma</strong>
            </p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">
              Ce message est confidentiel et destiné uniquement à l'équipe WisLed.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Server-side validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Le nom est requis (min. 2 caractères)' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Le message est requis (min. 10 caractères)' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey || resendApiKey === 're_PASTE_YOUR_KEY_HERE') {
      console.warn('[Contact] RESEND_API_KEY not configured — email not sent.')
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const resend = new Resend(resendApiKey)

    // ▶ TO SWITCH to info@wisled.ma:
    //   1. Verify wisled.ma at resend.com/domains
    //   2. Change contactEmail to 'info@wisled.ma'
    //   3. Change 'from' to: 'WisLed Contact <contact@wisled.ma>'
    // ════════════════════════════════════════════════════════════════
    // TODO: After verifying wisled.ma at resend.com/domains → change:
    //   LINE A: 'mostafa.khaddare@gmail.com'  →  'info@wisled.ma'
    //   LINE B: 'onboarding@resend.dev'        →  'contact@wisled.ma'
    // ════════════════════════════════════════════════════════════════
    const contactEmail = 'info@wisled.ma'             // ← LINE A ✔ verified

    const { error: sendError } = await resend.emails.send({
      from: 'WisLed Contact <contact@wisled.ma>',       // ← LINE B ✔ verified
      to: [contactEmail],
      replyTo: email,
      subject: `${SUBJECT_CONFIG[subject || '']?.emoji || '📩'} [WisLed] ${subject || 'Nouveau message'} — ${name}`,
      html: buildEmailHtml({ name, email, phone, subject, message }),
    })

    if (sendError) {
      console.error('[Contact] Resend error:', sendError)
      return NextResponse.json(
        { error: "Erreur lors de l'envoi. Veuillez réessayer ou nous écrire directement." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès' }, { status: 200 })
  } catch (err) {
    console.error('[Contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
