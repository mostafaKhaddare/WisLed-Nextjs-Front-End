import type { Field } from 'payload'

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
export const contactCardFields = (): Field[] => [
  {
    name: 'Icon',
    type: 'upload',
    relationTo: 'media',
  },
  { name: 'Title', type: 'text' },
  { name: 'Text', type: 'text' },
  { name: 'Link', type: 'text' },
]

/**
 * Strapi component: sections.contact-grid
 * src/components/sections/contact-grid.json
 *
 *   Title          : string
 *   ContactMethods : contact.contact-card  repeatable
 *
 * Used by: contact-us.ContactMethods (repeatable)
 *
 * The inner repeatable is stored as `Cards`, not `ContactMethods`: it sits
 * inside an array row that is itself called `ContactMethods`, and drizzle
 * rejects two relations with the same name in one table ("There are multiple
 * relations with name \"ContactMethods\""). getContactUs() in
 * src/lib/data/cms.ts maps `Cards` back to `ContactMethods`.
 */
export const contactGridFields = (): Field[] => [
  { name: 'Title', type: 'text' },
  {
    name: 'Cards',
    type: 'array',
    fields: contactCardFields(),
  },
]

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
export const headerSectionFields = (): Field[] => [
  { name: 'Title', type: 'text' },
  { name: 'Text', type: 'textarea' },
  {
    name: 'Image',
    type: 'upload',
    relationTo: 'media',
    hasMany: true,
  },
]
