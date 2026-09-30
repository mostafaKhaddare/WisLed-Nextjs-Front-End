import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'
import { faqSectionFields } from '../fields/faq'

/**
 * Strapi: api::faq.faq  (singleType, collectionName "faqs")
 *
 *   kind            : singleType
 *   draftAndPublish : true   -> versions.drafts
 *   FAQSection      : faq.faq repeatable
 */
export const Faq: GlobalConfig = {
  slug: 'faq',
  label: 'FAQ',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Content' },
  versions: { drafts: true },
  fields: [
    { name: 'FAQSection', type: 'array', fields: faqSectionFields() },
  ],
}
