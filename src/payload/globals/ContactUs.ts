import type { GlobalConfig } from 'payload'

import { authenticated } from '../access'
import { ctaGroup } from '../fields/banners'
import { contactGridGroup, headerSectionGroup } from '../fields/contact'

/**
 * Strapi: api::contact-us.contact-us  (singleType, collectionName "contact_uses")
 *
 *   kind            : singleType
 *   draftAndPublish : true   -> versions.drafts
 *   Header          : sections.h-eader    repeatable
 *   ContactMethods  : sections.contact-grid repeatable
 *   FormIntro       : homepage.cta        repeatable
 *
 * All three are repeatable in Strapi even though Header/FormIntro read like
 * single values. That shape is preserved so the migration is lossless.
 */
export const ContactUs: GlobalConfig = {
  slug: 'contact-us',
  label: 'Contact Us',
  access: { read: () => true, update: authenticated },
  admin: { group: 'Content' },
  versions: { drafts: true },
  fields: [
    { name: 'Header', type: 'array', fields: [headerSectionGroup('row')] },
    { name: 'ContactMethods', type: 'array', fields: [contactGridGroup('row')] },
    { name: 'FormIntro', type: 'array', fields: [ctaGroup('row')] },
  ],
}
