import type { GroupField } from 'payload'

/**
 * Strapi component: contact.contact-card
 * src/components/contact/contact-card.json
 *
 *   Icon  : media  single, any type
 *   Title : string
 *   Text  : string
 *   Link  : string
 *
 * Used by: sections.contact-grid.ContactMethods (repeatable)
 */
export const contactCardGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    {
      name: 'Icon',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'Title', type: 'text' },
    { name: 'Text', type: 'text' },
    { name: 'Link', type: 'text' },
  ],
})

/**
 * Strapi component: sections.contact-grid
 * src/components/sections/contact-grid.json
 *
 *   Title          : string
 *   ContactMethods : contact.contact-card  repeatable
 *
 * Used by: contact-us.ContactMethods (repeatable)
 */
export const contactGridGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Title', type: 'text' },
    {
      name: 'ContactMethods',
      type: 'array',
      fields: [contactCardGroup('row')],
    },
  ],
})

/**
 * Strapi component: sections.h-eader
 * src/components/sections/h-eader.json
 * (filename typo preserved in the comment; displayName "Header")
 *
 *   Title : string
 *   Text  : text
 *   Image : media  multiple
 *
 * Used by: contact-us.Header (repeatable)
 */
export const headerSectionGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Title', type: 'text' },
    { name: 'Text', type: 'textarea' },
    {
      name: 'Image',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
})
