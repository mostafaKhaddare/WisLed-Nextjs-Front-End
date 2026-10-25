import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { WhatsappIcon } from '@modules/common/icons'
import { ContentAttributes } from 'types/strapi'

export const ContactHeaderSection = ({ data }: { data: ContentAttributes }) => {
  const title = data?.Title || 'Contactez notre équipe'
  const text =
    data?.Text ||
    'Nous sommes là pour répondre à vos questions sur nos solutions LED et systèmes DMX.'

  return (
    <section className="relative w-full overflow-hidden bg-[#0F1B33] py-16 text-white small:py-20 large:py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full opacity-15 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full opacity-10 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <Container className="relative flex flex-col items-center gap-8 large:gap-12">
        <Box className="text-center">
          <Heading className="mb-4 text-3xl font-black tracking-tight small:text-4xl large:text-5xl">
            {title}
          </Heading>
          <Text
            size="lg"
            className="mx-auto max-w-[640px] leading-relaxed text-white/70"
          >
            {text}
          </Text>
        </Box>

        <Box className="mt-2 flex flex-col items-center gap-3">
          <a
            href="https://wa.me/212710420420"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-[14px] bg-[#25D366] px-8 py-3.5 text-[15px] font-bold text-[#0F1B33] shadow-lg shadow-[#25D366]/25 transition-all duration-300 hover:scale-[1.03] hover:bg-[#1FBE5B] hover:shadow-xl"
          >
            <WhatsappIcon className="h-5 w-5 shrink-0" />
            <span>Discutez avec nous sur WhatsApp</span>
          </a>
          <Text className="text-center text-sm text-white/50">
            Réponse garantie en moins de 24h ouvrables
          </Text>
        </Box>
      </Container>
    </section>
  )
}
