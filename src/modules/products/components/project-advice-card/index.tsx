import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'

import { NAVY } from '../product-tile/design-tokens'

/**
 * Navy advice panel with a WhatsApp call to action.
 *
 * Shared by the product page and the category page, both of which show it at
 * the foot of the listing so a customer who is unsure which strip fits their
 * room has a way to ask before they leave.
 */
export default function ProjectAdviceCard() {
  return (
    <Container className="!py-8">
      <Box
        className="mx-4 flex flex-col gap-3 rounded-3xl p-5 small:mx-6 small:p-6"
        style={{ backgroundColor: NAVY }}
      >
        <Heading
          as="h3"
          className="font-sora text-[19px] font-semibold text-white"
        >
          Pas sûr du bon ruban ?
        </Heading>
        <Text className="font-jakarta text-sm leading-[1.5] text-[#C9D1E3]">
          Dites-nous la pièce et la longueur : on vous conseille la puissance,
          l&apos;alimentation et la teinte adaptées.
        </Text>

        <LocalizedClientLink
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-3xl bg-[#25D366] font-jakarta text-[15px] font-bold leading-none text-[#06260F] transition-colors hover:bg-[#1FBE5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1B33]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06260F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20z" />
          </svg>
          Demander conseil sur WhatsApp
        </LocalizedClientLink>
      </Box>
    </Container>
  )
}
