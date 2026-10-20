import React from 'react'

import { CreditCard } from '@medusajs/icons'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import {
  BancontactIcon,
  BlikIcon,
  IdealIcon,
  PayPalIcon,
  Przelewy24Icon,
  StripeIcon,
} from '@modules/common/icons'

// Product filters
export const FILTER_KEYS = {
  ORDER_BY_KEY: 'sort_by',
  PRICE_KEY: 'price',
  MATERIAL_KEY: 'material',
  TYPE_KEY: 'type',
  COLLECTION_KEY: 'collection',
  COLOR_KEY: 'color',
  LIGHT_COLOR_KEY: 'light_color',
  COLOR_TEMPERATURE_KEY: 'color_temperature',
  WATTAGE_KEY: 'wattage',
  WATTAGE_PER_METRE_KEY: 'wattage_per_metre',
  POWER_KEY: 'power',
  VOLTAGE_KEY: 'voltage',
  ROLL_LENGTH_KEY: 'roll_length',
  LENGTH_KEY: 'length',
  IP_RATING_KEY: 'ip_rating',
  IP_KEY: 'ip',
  LED_TYPE_KEY: 'led_type',
  LED_DENSITY_KEY: 'led_density',
  DENSITY_KEY: 'density',
  PRODUCT_TYPE_KEY: 'product_type',
  STRIP_WIDTH_KEY: 'strip_width',
  PROFILE_KEY: 'profile',
  DIMENSIONS_KEY: 'dimensions',
  MATERIAL_KEY_ATTR: 'material',
  FINISH_KEY: 'finish',
  INSTALLATION_TYPE_KEY: 'installation_type',
  MOUNTING_TYPE_KEY: 'mounting_type',
  COMPATIBLE_ACCESSORIES_KEY: 'compatible_accessories',
  OUTPUT_WATTAGE_KEY: 'output_wattage',
  OUTPUT_VOLTAGE_KEY: 'output_voltage',
  CURRENT_KEY: 'current',
  OUTPUT_CURRENT_KEY: 'output_current',
  INPUT_VOLTAGE_KEY: 'input_voltage',
  PROTOCOL_KEY: 'protocol',
  PROTOCOLS_KEY: 'protocols',
  CONTROL_PROTOCOL_KEY: 'control_protocol',
  COMPATIBILITY_KEY: 'compatibility',
  CONTROL_COMPATIBILITY_KEY: 'control_compatibility',
  CONTROLLER_TYPE_KEY: 'controller_type',
  BEAM_ANGLE_KEY: 'beam_angle',
  CUTTABLE_KEY: 'cuttable',
  BRAND_KEY: 'brand',
  LED_TECHNOLOGY_KEY: 'led_technology',
  TECHNOLOGY_KEY: 'technology',
  PROFILE_TYPE_KEY: 'profile_type',
  SHAPE_KEY: 'shape',
  WIDTH_KEY: 'width',
  HEIGHT_KEY: 'height',
  DIFFUSER_TYPE_KEY: 'diffuser_type',
  FORM_FACTOR_KEY: 'form_factor',
  DIMMABLE_KEY: 'dimmable',
  DIMMING_KEY: 'dimming',
  CHANNELS_KEY: 'channels',
  NUMBER_OF_CHANNELS_KEY: 'number_of_channels',
  CONNECTIVITY_KEY: 'connectivity',
  REMOTE_CONTROL_TYPE_KEY: 'remote_control_type',
}

export const PRODUCT_LIST_PATHNAMES = {
  CATEGORY: '/categories',
  COLLECTION: '/collections',
  EXPLORE: '/shop',
  SEARCH: '/results',
} as const

export const blogSortOptions = [
  {
    value: 'desc',
    label: 'Les plus récents',
  },
  {
    value: 'asc',
    label: 'Les plus anciens',
  },
]

export const storeSortOptions = [
  {
    value: 'relevance',
    label: 'Pertinence',
  },
  {
    value: 'created_at',
    label: 'Nouveautés',
  },
  {
    value: 'price_asc',
    label: 'Prix : Bas → Élevé',
  },
  {
    value: 'price_desc',
    label: 'Prix : Élevé → Bas',
  },
]


/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: 'Carte de crédit',
    icon: <StripeIcon />,
  },
  'pp_stripe-blik_stripe': {
    title: 'BLIK',
    icon: <BlikIcon size={26} />,
  },
  'pp_stripe-przelewy24_stripe': {
    title: 'Przelewy24',
    icon: <Przelewy24Icon size={34} />,
  },
  'pp_stripe-ideal_stripe': {
    title: 'iDeal',
    icon: <IdealIcon />,
  },
  'pp_stripe-bancontact_stripe': {
    title: 'Bancontact',
    icon: <BancontactIcon />,
  },
  pp_paypal_paypal: {
    title: 'PayPal',
    icon: <PayPalIcon />,
  },
  pp_system_default: {
    title: 'Paiement manuel',
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe for card payments, it ignores the other stripe-based providers
export const isStripe = (providerId?: string) => {
  return providerId?.startsWith('pp_stripe_')
}
export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith('pp_paypal')
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith('pp_system_default')
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  'krw',
  'jpy',
  'vnd',
  'clp',
  'pyg',
  'xaf',
  'xof',
  'bif',
  'djf',
  'gnf',
  'kmf',
  'mga',
  'rwf',
  'xpf',
  'htg',
  'vuv',
  'xag',
  'xdr',
  'xau',
  'mad'
]

export const passwordRequirements = [
  'Au moins 8 caractères',
  'Une lettre minuscule',
  'Une lettre majuscule',
  'Un chiffre ou un symbole',
]

export const createNavigation = (
  productCategories: StoreProductCategory[],
  collections?: StoreCollection[]
) => [
    {
      name: 'Boutique',
      handle: '/shop',
      category_children: productCategories
        .filter((category) => !category.parent_category)
        .map((category) => {
          // Get the first image from product_category_image if available
          const categoryImage =
            (category as any).product_category_image?.[0] || null
          return {
            name: category.name,
            type: 'parent_category',
            handle: `/categories/${category.handle}`,
            image: categoryImage
              ? {
                url: categoryImage.url,
                alt: categoryImage.alternative_text || category.name,
              }
              : null,
            category_children: category.category_children.map((subCategory) => {
              const subCategoryImage =
                (subCategory as any).product_category_image?.[0] || null
              return {
                name: subCategory.name,
                handle: `/categories/${subCategory.handle}`,
                icon: null,
                image: subCategoryImage
                  ? {
                    url: subCategoryImage.url,
                    alt: subCategoryImage.alternative_text || subCategory.name,
                  }
                  : null,
                category_children: null,
              }
            }),
          }
        }),
    },
    {
      name: 'Collections',
      handle: '/shop',
      category_children: !collections
        ? null
        : collections.map((collection) => ({
          name: collection.title,
          type: 'collection',
          handle: `/collections/${collection.handle}`,
          handle_id: collection.handle,
          category_children: null,
        })),
    },
    {
      name: 'À propos',
      handle: '/about-us',
      category_children: null,
    },
  ]

export const createFooterNavigation = (
  productCategories: StoreProductCategory[]
) => {
  return {
    navigation: [
      {
        header: 'Catégories',
        links: [
          ...productCategories
            .filter((category) => !category.parent_category)
            .slice(0, 6)
            .map((category) => ({
              title: category.name,
              href: `/categories/${category.handle}`,
            })),
        ],
      },
      {
        header: 'Commandes',
        links: [
          {
            title: 'Commandes et livraison',
            href: '/terms-and-conditions',
          },
          {
            title: 'Retours et remboursements',
            href: '/terms-and-conditions',
          },
          {
            title: 'Paiement et tarifs',
            href: '/terms-and-conditions',
          },
        ],
      },
      {
        header: 'À propos',
        links: [
          {
            title: 'À propos de nous',
            href: '/about-us',
          },
          {
            title: 'Blog',
            href: '/blog',
          },

        ],
      },
      {
        header: 'Besoin d\'aide ?',
        links: [
          {
            title: 'FAQ',
            href: '/faq',
          },
          {
            title: 'Contactez-nous',
            href: '/contact-us',
          },
        ],
      },
    ],
    contact: {
      header: "Restons en contact",
      text: 'Tenez-vous au courant des derniers lancements de produits et des actualités. Découvrez nos marques et obtenez des codes promo exclusifs.',
    },
    other: [
      {
        title: 'Politique de confidentialité',
        href: '/privacy-policy',
      },
      {
        title: 'Conditions générales',
        href: '/terms-and-conditions',
      },
    ],
  }
}

export const checkoutFooterNavigation = [
  {
    title: 'Politique de confidentialité',
    href: '/privacy-policy',
  },
  {
    title: 'Conditions générales',
    href: '/terms-and-conditions',
  },
]

export const emailRegex = new RegExp(
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)
