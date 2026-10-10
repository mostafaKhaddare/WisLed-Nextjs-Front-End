/**
 * Shared visual tokens for the product card / option pill design taken from the
 * Figma mock. Keeping them in one place means the carousel card, the cart grid
 * and the product-detail option row cannot drift apart.
 */

/** Deep navy used for headings, badges and active states. */
export const NAVY = '#0F1B33'

/** Action blue used for "add to cart" affordances. */
export const ACTION_BLUE = '#1D4ED8'

/** Muted copy grey under product titles. */
export const MUTED = '#5B6577'

/** Light chrome grey used for variant chip fills. */
export const CHIP_BG = '#F0F2F8'

/** Variant chip label colour. */
export const CHIP_TEXT = '#3D4759'

/** Hairline border colour for unselected option pills. */
export const HAIRLINE = '#D5DAE6'

/** Warm product-photo backdrop — matches the mock's placeholder gradient. */
export const PHOTO_GRADIENT =
  'linear-gradient(135deg, #FFF3DC 0%, #FFE2A8 100%)'

/**
 * Maps a variant value onto a swatch colour.
 *
 * Kelvin colour temperatures and named colours get their own stops so the dot
 * on a chip reads as a plausible preview of the light it represents. Anything
 * unrecognised falls back to a neutral grey rather than an invisible dot.
 */
export function getVariantDotColor(value: string): string {
  const v = value.toLowerCase()

  // Colour temperatures, warmest first.
  if (v.includes('2200')) return '#FFB347'
  if (v.includes('2700')) return '#FFA726'
  if (v.includes('3000')) return '#FFD27A'
  if (v.includes('4000')) return '#FFF1C9'
  if (v.includes('5000')) return '#F3F8FF'
  if (v.includes('6000') || v.includes('6500')) return '#CFE4FF'

  // Special emitters.
  if (v.includes('rgb')) return '#E5484D'
  if (v.includes('cct')) return '#FFD27A'
  if (v.includes('tunable') || v.includes('variable')) return '#FFD27A'

  // Named colours (French and English).
  if (v === 'black' || v === 'noir') return '#1F2937'
  if (v === 'white' || v === 'blanc') return '#FFFFFF'
  if (v.includes('red') || v.includes('rouge')) return '#EF4444'
  if (v.includes('green') || v.includes('vert')) return '#22C55E'
  if (v.includes('blue') || v.includes('bleu')) return '#3B82F6'
  if (v.includes('gold') || v.includes('or')) return '#FFD700'
  if (v.includes('silver') || v.includes('argent')) return '#C0C0C0'
  if (v.includes('aluminium')) return '#C7CDD8'

  return HAIRLINE
}
