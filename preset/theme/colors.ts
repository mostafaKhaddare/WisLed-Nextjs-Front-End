export const colors = {
  colors: {
    // WISLED Neutral Grayscale
    grey: {
      10: 'rgb(255, 255, 255)',    // White
      50: 'rgb(248, 250, 252)',    // Slate 50
      100: 'rgb(241, 245, 249)',   // Slate 100
      200: 'rgb(226, 232, 240)',   // Slate 200
      300: 'rgb(203, 213, 225)',   // Slate 300
      400: 'rgb(148, 163, 184)',   // Slate 400
      500: 'rgb(100, 116, 139)',   // Slate 500
      600: 'rgb(71, 85, 105)',     // Slate 600
      700: 'rgb(51, 65, 85)',      // Slate 700
      800: 'rgb(30, 41, 59)',      // Slate 800
      900: 'rgb(15, 23, 42)',      // Slate 900
      950: 'rgb(2, 6, 23)',        // Slate 950
    },

    // WISLED Blue Palette
    wisled: {
      50: 'rgb(239, 246, 255)',    // #eff6ff
      100: 'rgb(219, 234, 254)',   // #dbeafe
      200: 'rgb(190, 219, 255)',   // #bedbff
      300: 'rgb(142, 197, 255)',   // #8ec5ff
      400: 'rgb(81, 162, 255)',    // #51a2ff
      500: 'rgb(43, 127, 255)',    // #2b7fff - PRIMARY BRAND
      600: 'rgb(21, 93, 252)',     // #155dfc
      700: 'rgb(20, 71, 230)',     // #1447e6
      800: 'rgb(25, 60, 184)',     // #193cb8
      900: 'rgb(28, 57, 142)',     // #1c398e
      950: 'rgb(22, 36, 86)',      // #162456 - DARKEST
    },

    // Twitter "Like" Red (#E0245E) - kept for error states
    red: {
      50: 'rgb(253, 235, 240)',
      100: 'rgb(250, 210, 220)',
      200: 'rgb(245, 160, 180)',
      300: 'rgb(240, 110, 140)',
      400: 'rgb(235, 70, 110)',
      500: 'rgb(224, 36, 94)',
      600: 'rgb(190, 30, 80)',
      700: 'rgb(150, 25, 65)',
      800: 'rgb(110, 18, 50)',
      900: 'rgb(80, 12, 35)',
    },

    // Twitter "Retweet" Green (#17BF63) - kept for success states
    green: {
      50: 'rgb(235, 250, 242)',
      100: 'rgb(200, 245, 225)',
      200: 'rgb(150, 235, 200)',
      300: 'rgb(100, 220, 170)',
      400: 'rgb(60, 205, 135)',
      500: 'rgb(23, 191, 99)',
      600: 'rgb(20, 160, 85)',
      700: 'rgb(15, 130, 70)',
      800: 'rgb(10, 100, 55)',
      900: 'rgb(5, 70, 40)',
    },

    // Twitter Yellow/Gold (#FFAD1F) - kept for warning states
    yellow: {
      50: 'rgb(255, 250, 235)',
      100: 'rgb(255, 240, 215)',
      200: 'rgb(255, 225, 175)',
      300: 'rgb(255, 205, 135)',
      400: 'rgb(255, 190, 85)',
      500: 'rgb(255, 173, 31)',
      600: 'rgb(225, 150, 25)',
      700: 'rgb(190, 125, 20)',
      800: 'rgb(150, 100, 15)',
      900: 'rgb(110, 75, 10)',
    },
  },
  backgroundImage: {
    'wisled-gradient-primary': 'linear-gradient(135deg, #2b7fff 0%, #1447e6 100%)',
    'wisled-gradient-light': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    'wisled-gradient-dark': 'linear-gradient(135deg, #162456 0%, #1c398e 100%)',
  },
  backgroundColor: {
    static: 'rgb(var(--bg-static) / <alpha-value>)',
    primary: 'rgb(var(--bg-primary) / <alpha-value>)',
    secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
    'category-image-tile': 'rgb(var(--bg-category-image-tile) / <alpha-value>)',
    'wisled-50': 'rgb(var(--wisled-50) / <alpha-value>)',
    'wisled-100': 'rgb(var(--wisled-100) / <alpha-value>)',
    'wisled-200': 'rgb(var(--wisled-200) / <alpha-value>)',
    'wisled-500': 'rgb(var(--wisled-500) / <alpha-value>)',
    'wisled-600': 'rgb(var(--wisled-600) / <alpha-value>)',
    'wisled-700': 'rgb(var(--wisled-700) / <alpha-value>)',
    'wisled-900': 'rgb(var(--wisled-900) / <alpha-value>)',
    'wisled-950': 'rgb(var(--wisled-950) / <alpha-value>)',
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
  'wisled-primary': '0 4px 14px rgba(43, 127, 255, 0.25)',
  'wisled-primary-hover': '0 6px 20px rgba(43, 127, 255, 0.35)',
  'wisled-focus': '0 0 0 3px rgba(43, 127, 255, 0.20)',
  'card-subtle': '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
  'card-hover': '0 10px 25px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(15, 23, 42, 0.08)',
}