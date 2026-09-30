import type { GroupField } from 'payload'

/**
 * Strapi component: faq.faq-question
 * src/components/faq/faq-question.json
 *
 *   Title : string  required
 *   Text  : text    required
 *
 * Used by: faq.faq.Question (repeatable)
 */
export const faqQuestionGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Title', type: 'text', required: true },
    { name: 'Text', type: 'textarea', required: true },
  ],
})

/**
 * Strapi component: faq.faq
 * src/components/faq/faq.json
 *
 *   Title    : string            required
 *   Question : faq.faq-question  repeatable
 *   Bookmark : string            required
 *
 * Used by: faq.FAQSection (repeatable)
 */
export const faqSectionGroup = (name: string): GroupField => ({
  name,
  type: 'group',
  fields: [
    { name: 'Title', type: 'text', required: true },
    {
      name: 'Question',
      type: 'array',
      fields: [faqQuestionGroup('row')],
    },
    { name: 'Bookmark', type: 'text', required: true },
  ],
})
