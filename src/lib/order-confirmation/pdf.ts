import 'server-only'

import { getPaymentInfo } from '@lib/constants'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from 'pdf-lib'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const COLORS = {
  brand: rgb(29 / 255, 78 / 255, 216 / 255),
  ink: rgb(15 / 255, 23 / 255, 42 / 255),
  muted: rgb(100 / 255, 116 / 255, 139 / 255),
  line: rgb(226 / 255, 232 / 255, 240 / 255),
  soft: rgb(248 / 255, 250 / 255, 252 / 255),
  white: rgb(1, 1, 1),
}

type OrderWithDetails = HttpTypes.StoreOrder & {
  items?: HttpTypes.StoreOrderLineItem[] | null
}

type Fonts = {
  regular: PDFFont
  bold: PDFFont
}

/**
 * Standard PDF fonts use WinAnsi encoding. Normalise common typographic
 * characters and replace anything outside Latin-1 so French addresses and
 * product names never break PDF generation.
 */
const sanitize = (value: unknown) =>
  String(value ?? '')
    .normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\xFF]/g, '?')

const formatMoney = (amount: number | null | undefined, currency: string) =>
  convertToLocale({
    amount: Number(amount || 0),
    currency_code: currency,
    locale: 'fr-MA',
  })

const formatDate = (value?: string | Date | null) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const getOrderNumber = (order: OrderWithDetails) =>
  order.display_id
    ? `#${order.display_id}`
    : `#${order.id.slice(-8).toUpperCase()}`

const orderNumber = getOrderNumber

const paymentLabel = (order: OrderWithDetails) => {
  const payment =
    order.payment_collections?.[0]?.payments?.[0] ||
    order.payment_collections?.[0]?.payment_sessions?.[0]

  return getPaymentInfo(payment?.provider_id).title
}

const wrapText = (
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
) => {
  const lines: string[] = []
  const paragraphs = sanitize(text).split(/\r?\n/)

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      continue
    }

    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        line = candidate
      } else {
        if (line) lines.push(line)
        line = word
      }
    }
    if (line) lines.push(line)
  }

  return lines.length ? lines : ['']
}

const drawWrappedText = ({
  page,
  text,
  x,
  y,
  font,
  size,
  maxWidth,
  color = COLORS.ink,
  lineHeight = size * 1.35,
}: {
  page: PDFPage
  text: string
  x: number
  y: number
  font: PDFFont
  size: number
  maxWidth: number
  color?: ReturnType<typeof rgb>
  lineHeight?: number
}) => {
  const lines = wrapText(text, font, size, maxWidth)
  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - index * lineHeight,
      size,
      font,
      color,
    })
  })
  return y - lines.length * lineHeight
}

const drawLabelValue = ({
  page,
  label,
  value,
  x,
  y,
  fonts,
  width,
}: {
  page: PDFPage
  label: string
  value: string
  x: number
  y: number
  fonts: Fonts
  width: number
}) => {
  page.drawText(sanitize(label).toUpperCase(), {
    x,
    y,
    size: 7.5,
    font: fonts.bold,
    color: COLORS.muted,
  })

  return drawWrappedText({
    page,
    text: value || '-',
    x,
    y: y - 14,
    font: fonts.regular,
    size: 10,
    maxWidth: width,
    lineHeight: 14,
  })
}

const drawHeader = (page: PDFPage, fonts: Fonts) => {
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 108,
    width: PAGE_WIDTH,
    height: 108,
    color: COLORS.brand,
  })

  page.drawText('WISLED', {
    x: MARGIN,
    y: PAGE_HEIGHT - 54,
    size: 23,
    font: fonts.bold,
    color: COLORS.white,
  })

  page.drawText('LUMIERE LED & SOLUTIONS', {
    x: MARGIN,
    y: PAGE_HEIGHT - 73,
    size: 8,
    font: fonts.regular,
    color: COLORS.white,
  })

  page.drawText('CONFIRMATION DE COMMANDE', {
    x: PAGE_WIDTH - MARGIN - 190,
    y: PAGE_HEIGHT - 55,
    size: 11,
    font: fonts.bold,
    color: COLORS.white,
  })
}

const drawFooter = (page: PDFPage, fonts: Fonts, pageNumber: number) => {
  page.drawLine({
    start: { x: MARGIN, y: 36 },
    end: { x: PAGE_WIDTH - MARGIN, y: 36 },
    thickness: 0.7,
    color: COLORS.line,
  })

  page.drawText('WisLed - Eclairage LED professionnel - www.wisled.ma', {
    x: MARGIN,
    y: 22,
    size: 7.5,
    font: fonts.regular,
    color: COLORS.muted,
  })

  page.drawText(`Page ${pageNumber}`, {
    x: PAGE_WIDTH - MARGIN - 36,
    y: 22,
    size: 7.5,
    font: fonts.regular,
    color: COLORS.muted,
  })
}

const drawTableHeader = (page: PDFPage, fonts: Fonts, y: number) => {
  page.drawRectangle({
    x: MARGIN,
    y: y - 4,
    width: CONTENT_WIDTH,
    height: 22,
    color: COLORS.soft,
  })

  const columns = [
    { label: 'PRODUIT', x: MARGIN + 8 },
    { label: 'QTE', x: 356 },
    { label: 'P.U.', x: 420 },
    { label: 'TOTAL', x: 495 },
  ]

  columns.forEach((column) => {
    page.drawText(column.label, {
      x: column.x,
      y: y + 3,
      size: 7.5,
      font: fonts.bold,
      color: COLORS.muted,
    })
  })

  return y - 25
}

const drawTotals = ({
  page,
  fonts,
  y,
  order,
  currency,
  startOnNewPage,
}: {
  page: PDFPage
  fonts: Fonts
  y: number
  order: OrderWithDetails
  currency: string
  startOnNewPage: () => PDFPage
}) => {
  const rows: Array<[string, number | null | undefined, boolean?]> = [
    ['Sous-total', order.item_subtotal ?? order.subtotal],
    ['Livraison', order.shipping_total],
    ['Remise', order.discount_total ? -Number(order.discount_total) : 0],
    ['TVA', order.tax_total],
  ]

  let currentPage = page
  let currentY = y

  const ensureSpace = (required: number) => {
    if (currentY - required < 72) {
      currentPage = startOnNewPage()
      currentY = PAGE_HEIGHT - 138
    }
  }

  ensureSpace(120)

  const labelX = 360
  const valueX = 535

  currentPage.drawLine({
    start: { x: labelX, y: currentY },
    end: { x: valueX, y: currentY },
    thickness: 0.7,
    color: COLORS.line,
  })
  currentY -= 18

  rows.forEach(([label, amount, isNegative]) => {
    const numeric = Number(amount || 0)
    if (!numeric) {
      return
    }

    currentPage.drawText(label, {
      x: labelX,
      y: currentY,
      size: 9,
      font: fonts.regular,
      color: COLORS.muted,
    })

    const formatted = formatMoney(
      isNegative ? -Math.abs(numeric) : numeric,
      currency
    )
    const textWidth = fonts.regular.widthOfTextAtSize(formatted, 9)
    currentPage.drawText(formatted, {
      x: valueX - textWidth,
      y: currentY,
      size: 9,
      font: fonts.regular,
      color: COLORS.ink,
    })
    currentY -= 16
  })

  currentY -= 4
  currentPage.drawRectangle({
    x: labelX - 10,
    y: currentY - 25,
    width: valueX - labelX + 20,
    height: 33,
    color: COLORS.soft,
  })

  currentPage.drawText('TOTAL', {
    x: labelX,
    y: currentY - 13,
    size: 10,
    font: fonts.bold,
    color: COLORS.ink,
  })

  const total = formatMoney(Number(order.total || 0), currency)
  const totalWidth = fonts.bold.widthOfTextAtSize(total, 12)
  currentPage.drawText(total, {
    x: valueX - totalWidth,
    y: currentY - 14,
    size: 12,
    font: fonts.bold,
    color: COLORS.brand,
  })

  return currentY - 42
}

export async function generateOrderConfirmationPdf(
  order: OrderWithDetails
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  }

  pdf.setTitle(`Confirmation de commande ${orderNumber(order)} - WisLed`)
  pdf.setAuthor('WisLed')
  pdf.setSubject('Confirmation de commande')
  pdf.setCreator('WisLed')

  const pages: PDFPage[] = []
  let pageNumber = 0

  const startPage = () => {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    pages.push(page)
    pageNumber += 1
    drawHeader(page, fonts)
    drawFooter(page, fonts, pageNumber)
    return page
  }

  let page = startPage()
  let y = PAGE_HEIGHT - 138

  // ── Order identity ──────────────────────────────────────────────────────
  page.drawText('Merci pour votre commande !', {
    x: MARGIN,
    y,
    size: 18,
    font: fonts.bold,
    color: COLORS.ink,
  })
  y -= 22

  page.drawText(
    sanitize(
      `Commande ${orderNumber(order)} - ${formatDate(order.created_at)}`
    ),
    {
      x: MARGIN,
      y,
      size: 10,
      font: fonts.regular,
      color: COLORS.muted,
    }
  )
  y -= 30

  // ── Customer / delivery / payment ───────────────────────────────────────
  const shipping = order.shipping_address
  const customerName = [shipping?.first_name, shipping?.last_name]
    .filter(Boolean)
    .join(' ')
  const address = [
    shipping?.address_1,
    shipping?.address_2,
    [shipping?.postal_code, shipping?.city].filter(Boolean).join(' '),
    shipping?.country_code?.toUpperCase(),
  ]
    .filter(Boolean)
    .join(', ')

  page.drawRectangle({
    x: MARGIN,
    y: y - 102,
    width: CONTENT_WIDTH,
    height: 116,
    color: COLORS.soft,
  })

  let leftY = y - 18
  leftY = drawLabelValue({
    page,
    label: 'Livraison',
    value: [customerName, address].filter(Boolean).join('\n'),
    x: MARGIN + 14,
    y: leftY,
    fonts,
    width: 220,
  })

  leftY = drawLabelValue({
    page,
    label: 'Contact',
    value: [order.email, shipping?.phone].filter(Boolean).join('\n'),
    x: MARGIN + 14,
    y: leftY - 4,
    fonts,
    width: 220,
  })

  let rightY = y - 18
  rightY = drawLabelValue({
    page,
    label: 'Paiement',
    value: paymentLabel(order),
    x: 330,
    y: rightY,
    fonts,
    width: 210,
  })

  drawLabelValue({
    page,
    label: 'Livraison',
    value: order.shipping_methods?.[0]?.name || 'A domicile',
    x: 330,
    y: rightY - 8,
    fonts,
    width: 210,
  })

  y -= 134

  // ── Items ───────────────────────────────────────────────────────────────
  y = drawTableHeader(page, fonts, y)

  const items = order.items || []
  const currency = order.currency_code

  items.forEach((item) => {
    const lineItem = item as HttpTypes.StoreOrderLineItem & {
      product_title?: string
      variant_title?: string
      variant?: { title?: string }
    }

    const title = lineItem.product_title || lineItem.title || 'Produit'
    const variant = lineItem.variant_title || lineItem.variant?.title
    const quantity = Number(lineItem.quantity || 0)
    const total = Number(lineItem.total || 0)
    const unitPrice = Number(
      lineItem.unit_price ?? (quantity ? total / quantity : 0)
    )

    const titleLines = wrapText(title, fonts.bold, 9.5, 278)
    const variantLines = variant
      ? wrapText(variant, fonts.regular, 8, 278)
      : []
    const rowHeight = Math.max(34, (titleLines.length + variantLines.length) * 12 + 16)

    if (y - rowHeight < 95) {
      page = startPage()
      y = PAGE_HEIGHT - 138
      y = drawTableHeader(page, fonts, y)
    }

    drawWrappedText({
      page,
      text: title,
      x: MARGIN + 8,
      y: y - 11,
      font: fonts.bold,
      size: 9.5,
      maxWidth: 278,
      lineHeight: 12,
    })

    if (variant) {
      drawWrappedText({
        page,
        text: variant,
        x: MARGIN + 8,
        y: y - 11 - titleLines.length * 12,
        font: fonts.regular,
        size: 8,
        maxWidth: 278,
        color: COLORS.muted,
        lineHeight: 10,
      })
    }

    const drawRight = (text: string, x: number, font: PDFFont, size = 9) => {
      const width = font.widthOfTextAtSize(text, size)
      page.drawText(text, {
        x: x - width,
        y: y - 11,
        size,
        font,
        color: COLORS.ink,
      })
    }

    drawRight(String(quantity), 386, fonts.regular)
    drawRight(formatMoney(unitPrice, currency), 470, fonts.regular)
    drawRight(formatMoney(total, currency), 547, fonts.bold)

    y -= rowHeight
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: COLORS.line,
    })
  })

  y -= 18

  // ── Totals ──────────────────────────────────────────────────────────────
  y = drawTotals({
    page,
    fonts,
    y,
    order,
    currency,
    startOnNewPage: () => {
      page = startPage()
      return page
    },
  })

  if (y < 190) {
    page = startPage()
    y = PAGE_HEIGHT - 138
  }

  // ── Next steps ──────────────────────────────────────────────────────────
  page.drawText('Et maintenant ?', {
    x: MARGIN,
    y,
    size: 12,
    font: fonts.bold,
    color: COLORS.ink,
  })
  y -= 18

  const steps = [
    'Notre equipe prepare votre commande avec soin.',
    'Nous vous contactons pour confirmer la livraison.',
    'Le paiement est effectue a la reception de votre commande.',
  ]

  steps.forEach((step, index) => {
    page.drawCircle({
      x: MARGIN + 4,
      y: y - 3,
      size: 3,
      color: COLORS.brand,
    })
    page.drawText(sanitize(`${index + 1}. ${step}`), {
      x: MARGIN + 14,
      y: y - 7,
      size: 9.2,
      font: fonts.regular,
      color: COLORS.ink,
    })
    y -= 17
  })

  y -= 10
  page.drawText(
    sanitize(
      'Une question ? Ecrivez-nous a contact@wisled.ma ou sur WhatsApp au +212 648 522 511.'
    ),
    {
      x: MARGIN,
      y,
      size: 8.5,
      font: fonts.regular,
      color: COLORS.muted,
    }
  )

  return pdf.save()
}

export const orderConfirmationFileName = (order: OrderWithDetails) =>
  `confirmation-commande-${String(order.display_id || order.id.slice(-8))}.pdf`
