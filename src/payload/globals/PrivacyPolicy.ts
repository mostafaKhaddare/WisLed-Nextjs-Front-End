import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'

/**
 * Strapi: api::privacy-policy.privacy-policy
 * (singleType, collectionName "privacy_policies")
 *
 *   kind            : singleType
 *   draftAndPublish : true   -> versions.drafts
 *   PageContent     : richtext (Markdown) -> Lexical richText
 */
export const PrivacyPolicy: GlobalConfig = {
  slug: 'privacy-policy',
  label: 'Privacy Policy',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Content' },
  versions: { drafts: true },
  fields: [{ name: 'PageContent', type: 'richText' }],
}
