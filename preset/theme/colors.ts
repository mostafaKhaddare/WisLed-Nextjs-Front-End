export const colors = {
  colors: {
    // Twitter Grayscale (Mapped from provided values)
    grey: {
      10: 'rgb(255, 255, 255)',    // White
      50: 'rgb(245, 248, 250)',    // Extra Extra Light Gray
      100: 'rgb(235, 240, 245)',   // Interpolated
      200: 'rgb(225, 232, 237)',   // Extra Light Gray
      300: 'rgb(200, 210, 220)',   // Interpolated
      400: 'rgb(170, 184, 194)',   // Light Gray
      500: 'rgb(136, 153, 166)',   // Interpolated
      600: 'rgb(101, 119, 134)',   // Dark Gray
      700: 'rgb(60, 70, 80)',      // Interpolated
      800: 'rgb(20, 23, 26)',      // Black (Twitter)
      900: 'rgb(0, 0, 0)',         // Pure Black
    },
    // Twitter Blue Scale (#1DA1F2)
    brand: {
      10: 'rgb(255, 255, 255)',
      50: 'rgb(232, 245, 254)',
      100: 'rgb(207, 236, 253)',
      200: 'rgb(160, 219, 251)',
      300: 'rgb(118, 201, 249)',
      400: 'rgb(75, 183, 245)',
      500: 'rgb(29, 161, 242)',    // Main Twitter Blue
      600: 'rgb(26, 145, 218)',
      700: 'rgb(23, 120, 180)',
      800: 'rgb(20, 23, 26)',      // Twitter Black
      900: 'rgb(0, 0, 0)',
    },
    // Twitter "Like" Red (#E0245E)
    red: {
      50: 'rgb(253, 235, 240)',
      100: 'rgb(250, 210, 220)',
      200: 'rgb(245, 160, 180)',
      300: 'rgb(240, 110, 140)',
      400: 'rgb(235, 70, 110)',
      500: 'rgb(224, 36, 94)',     // Twitter Heart Red
      600: 'rgb(190, 30, 80)',
      700: 'rgb(150, 25, 65)',
      800: 'rgb(110, 18, 50)',
      900: 'rgb(80, 12, 35)',
    },
    // Twitter "Retweet" Green (#17BF63)
    green: {
      50: 'rgb(235, 250, 242)',
      100: 'rgb(200, 245, 225)',
      200: 'rgb(150, 235, 200)',
      300: 'rgb(100, 220, 170)',
      400: 'rgb(60, 205, 135)',
      500: 'rgb(23, 191, 99)',     // Twitter Retweet Green
      600: 'rgb(20, 160, 85)',
      700: 'rgb(15, 130, 70)',
      800: 'rgb(10, 100, 55)',
      900: 'rgb(5, 70, 40)',
    },
    // Twitter Yellow/Gold (#FFAD1F)
    yellow: {
      50: 'rgb(255, 250, 235)',
      100: 'rgb(255, 240, 215)',
      200: 'rgb(255, 225, 175)',
      300: 'rgb(255, 205, 135)',
      400: 'rgb(255, 190, 85)',
      500: 'rgb(255, 173, 31)',    // Twitter Star/Gold
      600: 'rgb(225, 150, 25)',
      700: 'rgb(190, 125, 20)',
      800: 'rgb(150, 100, 15)',
      900: 'rgb(110, 75, 10)',
    },
  },
  backgroundImage: {
    // Updated to Twitter Blue gradient
    'doc-gradient':
      'linear-gradient(to left top, rgba(29, 161, 242, 0.85) 0%, rgba(29, 161, 242, 0.7) 50%, rgb(20, 23, 26) 100%)',
  },
  backgroundColor: {
    static: 'rgb(var(--bg-static) / <alpha-value>)',
    primary: 'rgb(var(--bg-primary) / <alpha-value>)',
    secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
    brand: 'rgb(var(--bg-brand) / <alpha-value>)',
    hover: 'rgb(var(--bg-hover) / <alpha-value>)',
    pressed: 'rgb(var(--bg-pressed) / <alpha-value>)',
    disabled: 'rgb(var(--bg-disabled) / <alpha-value>)',
    'fg-primary': 'rgb(var(--fg-primary) / <alpha-value>)',
    'fg-primary-hover': 'rgb(var(--fg-primary-hover) / <alpha-value>)',
    'fg-primary-pressed': 'rgb(var(--fg-primary-pressed) / <alpha-value>)',
    'fg-secondary': 'rgb(var(--fg-secondary))',
    'fg-secondary-hover': 'rgb(var(--fg-secondary-hover))',
    'fg-secondary-pressed': 'rgb(var(--fg-secondary-pressed))',
    'fg-tertiary': 'rgb(var(--fg-tertiary))',
    'fg-tertiary-hover': 'rgb(var(--fg-tertiary-hover))',
    'fg-tertiary-pressed': 'rgb(var(--fg-tertiary-pressed))',
    'fg-primary-negative': 'rgb(var(--fg-primary-negative) / <alpha-value>)',
    'fg-primary-negative-hover':
      'rgb(var(--fg-primary-negative-hover) / <alpha-value>)',
    'fg-primary-negative-pressed':
      'rgb(var(--fg-primary-negative-pressed) / <alpha-value>)',
    'fg-secondary-negative': 'rgb(var(--fg-secondary-negative))',
    'fg-positive': 'rgb(var(--fg-positive))',
    'skeleton-primary': 'rgb(var(--bg-skeleton-primary))',
    'skeleton-secondary': 'rgb(var(--bg-skeleton-secondary))',
  },
  textColor: {
    static: 'rgb(var(--content-static) / <alpha-value>)',
    'basic-primary': 'rgb(var(--content-basic-primary) / <alpha-value>)',
    'inverse-primary': 'rgb(var(--content-inverse-primary) / <alpha-value>)',
    secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
    disabled: 'rgb(var(--content-disabled) / <alpha-value>)',
    'action-primary': 'rgb(var(--content-action-primary) / <alpha-value>)',
    'action-primary-hover':
      'rgb(var(--content-action-primary-hover) / <alpha-value>)',
    'action-primary-pressed':
      'rgb(var(--content-action-primary-pressed) / <alpha-value>)',
    negative: 'rgb(var(--content-negative) / <alpha-value>)',
    positive: 'rgb(var(--content-positive) / <alpha-value>)',
    warning: 'rgb(var(--content-warning) / <alpha-value>)',
    yellow: 'rgb(var(--content-yellow) / <alpha-value>)',
  },
  borderColor: {
    'basic-primary': 'rgb(var(--border-basic-primary) / <alpha-value>)',
    secondary: 'rgb(var(--border-secondary))',
    disabled: 'rgb(var(--border-disabled) / <alpha-value>)',
    'action-primary': 'rgb(var(--border-action-primary) / <alpha-value>)',
    'action-primary-inverse':
      'rgb(var(--border-action-primary-inverse) / <alpha-value>)',
    'action-primary-hover':
      'rgb(var(--border-action-primary-hover) / <alpha-value>)',
    'action-primary-pressed':
      'rgb(var(--border-action-primary-pressed) / <alpha-value>)',
    negative: 'rgb(var(--border-negative) / <alpha-value>)',
    positive: 'rgb(var(--border-positive) / <alpha-value>)',
    warning: 'rgb(var(--border-warning) / <alpha-value>)',
  },
}

export const boxShadow = {
  'complementary-basic': '0 2px 10px rgba(0, 0, 0, 0.2)',
  'black-basic': '0px 2px 10px 0px rgba(20, 23, 26, 0.1)', // Twitter Black shadow
}