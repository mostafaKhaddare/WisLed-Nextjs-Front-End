import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function BlogContent({ content }: { content: string }) {
  return (
    <Markdown
      components={{
        img: ({ node, ...props }) => (
          <Box className="my-8 overflow-hidden rounded-lg shadow-md medium:my-12">
            <Box className="relative h-[300px] w-full medium:h-[400px]">
              <Image
                fill
                src={props.src}
                alt={props.alt}
                className="w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </Box>
          </Box>
        ),
        h2: ({ node, ...props }) => (
          <Heading
            id={props.children.toString().toLowerCase().replace(/\s+/g, '-')}
            as="h2"
            className="mb-4 mt-8 text-2xl font-bold text-basic-primary medium:mb-6 medium:mt-10 medium:text-3xl scroll-mt-20"
          >
            {props.children}
          </Heading>
        ),
        h3: ({ node, ...props }) => (
          <Heading
            as="h3"
            className="mb-3 mt-6 text-xl font-semibold text-basic-primary medium:mb-4 medium:mt-8 medium:text-2xl"
          >
            {props.children}
          </Heading>
        ),
        p: ({ node, ...props }) => (
          <Text className="mb-6 leading-relaxed text-secondary medium:mb-8">
            {props.children}
          </Text>
        ),
        ul: ({ node, ...props }) => (
          <ul className="mb-6 ml-6 list-disc space-y-2 text-secondary medium:mb-8">
            {props.children}
          </ul>
        ),
        ol: ({ node, ...props }) => (
          <ol className="mb-6 ml-6 list-decimal space-y-2 text-secondary medium:mb-8">
            {props.children}
          </ol>
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed">{props.children}</li>
        ),
        blockquote: ({ node, ...props }) => (
          <Box className="my-6 border-l-4 border-action-primary bg-secondary/5 py-4 pl-6 pr-4 italic text-secondary medium:my-8">
            {props.children}
          </Box>
        ),
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code className="rounded bg-secondary/10 px-2 py-1 font-mono text-sm text-action-primary">
              {props.children}
            </code>
          ) : (
            <pre className="my-6 overflow-x-auto rounded-lg bg-secondary/10 p-4 medium:my-8">
              <code className="font-mono text-sm text-secondary">
                {props.children}
              </code>
            </pre>
          ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </Markdown>
  )
}
