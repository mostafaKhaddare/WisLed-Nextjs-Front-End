import { Text } from '@modules/common/components/text'
import { Box } from '@modules/common/components/box'

export function BlogInfo({ createdAt, readTime }) {
  return (
    <Box className="flex flex-wrap items-center gap-4">
      <Text className="text-sm text-secondary medium:text-base">
        <time dateTime={new Date(createdAt).toISOString()}>
          {new Date(createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </Text>
      <Text className="text-sm text-secondary/60 medium:text-base">•</Text>
      <Text className="text-sm text-secondary medium:text-base">
        {readTime} min read
      </Text>
    </Box>
  )
}
