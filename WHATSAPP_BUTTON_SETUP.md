# WhatsApp Button Integration Guide

## 📋 Setup Instructions

### 1. **Environment Variables**
Add to your `.env.local` file:

```env
NEXT_PUBLIC_WHATSAPP_PHONE=+212612345678
NEXT_PUBLIC_WHATSAPP_MESSAGE=Hello WisLed! I would like more information about your LED solutions.
```

**Note:** Phone number must include country code (e.g., `+212` for Morocco)

### 2. **Integration in Root Layout**

Add the WhatsApp button to your root layout (`src/app/[countryCode]/(main)/layout.tsx`):

```tsx
import { WhatsAppButton } from '@/components/whatsapp-button'

export default async function PageLayout(props: {
  params: Promise<{ countryCode: string }>
  children: React.ReactNode
}) {
  const { countryCode } = await props.params

  return (
    <>
      <NavWrapper countryCode={countryCode} />
      {props.children}
      <WhatsAppButton />
      <Footer countryCode={countryCode} />
    </>
  )
}
```

**Or** add to the root layout (`src/app/layout.tsx`) for global availability:

```tsx
import { WhatsAppButton } from '@/components/whatsapp-button'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  )
}
```

### 3. **Custom Usage (Optional)**

You can override the default values:

```tsx
<WhatsAppButton 
  phoneNumber="+212712345678"
  defaultMessage="Hi! I'm interested in your LED strips."
/>
```

## 🎨 Features

✅ **Fixed bottom-right position** - Always visible and accessible
✅ **Responsive design** - Adjusts padding on mobile (6px → 8px)
✅ **Smooth interactions** - Hover scale (110%), tap shrink (95%)
✅ **SSR safe** - Uses `useEffect` for client-side rendering
✅ **Accessible** - Keyboard support (Enter/Space), focus ring, aria-label
✅ **No breaking changes** - Self-contained component
✅ **Production ready** - No console logs, proper error handling

## 🔑 Key Implementation Details

| Feature | Details |
|---------|---------|
| **Icon** | Official WhatsApp SVG (25D366 green) |
| **Z-index** | 40 (below modals, above main content) |
| **Position** | `fixed bottom-6 right-6` (mobile: 8px) |
| **Accessibility** | Focus ring, keyboard navigation, aria-label |
| **Performance** | Minimal re-renders, lazy visibility check |

## 📱 Mobile Optimization

- Button appears with bottom: 8px, right: 8px on small screens
- Doesn't overlap bottom navigation or important UI
- Touch-friendly size (56px × 56px)
- Opens native WhatsApp app if installed, falls back to web

## 🔗 WhatsApp URL Format

The component generates URLs in this format:
```
https://wa.me/[PHONE]?text=[ENCODED_MESSAGE]
```

Example:
```
https://wa.me/212612345678?text=Hello%20WisLed%21%20I%20would%20like%20information.
```

## ✅ Verification Checklist

- [x] Component created at `src/components/whatsapp-button/index.tsx`
- [x] Environment variables configured
- [x] Imported in layout
- [x] Tested on mobile and desktop
- [x] Keyboard navigation works
- [x] Focus styles visible
- [x] WhatsApp opens in new tab
- [x] No console errors
