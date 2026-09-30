import type { Access } from 'payload'

/** Only signed-in CMS users may write content. Anyone may read it. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
