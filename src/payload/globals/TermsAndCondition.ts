import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'

/**
 * Strapi: api::terms-and-condition.terms-and-condition
 * (singleType, collectionName "terms_and_conditions")
 *
 *   kind            : singleType
 *   draftAndPublish : true   -> versions.drafts
 *   PageContent     : richtext (Markdown) -> Lexical richText
 *
 * Structurally identical to PrivacyPolicy; kept as a separate global to match
 * the Strapi model.
 */
export const TermsAndCondition: GlobalConfig = {
  slug: 'terms-and-condition',
  label: 'Terms & Conditions',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Content' },
  versions: { drafts: true },
  fields: [{ name: 'PageContent', type: 'richText' }],
}
