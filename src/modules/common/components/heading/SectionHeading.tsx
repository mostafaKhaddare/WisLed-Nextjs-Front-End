import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '@lib/util/cn'

export type SectionHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type SectionHeadingProps<T extends SectionHeadingLevel> = Omit<
  ComponentPropsWithoutRef<T>,
  'as' | 'subtitle' | 'accent' | 'align' | 'children'
> & {
  as?: T
  subtitle?: React.ReactNode
  accent?: boolean
  align?: 'left' | 'center' | 'right'
  children?: React.ReactNode
}

const SectionHeading = forwardRef<HTMLHeadingElement, SectionHeadingProps<'h2'>>(
  (
    {
      as,
      children,
      subtitle,
      accent = true,
      align = 'left',
      className,
      ...restProps
    },
    ref
  ) => {
    const Component = as ?? 'h2'
    const alignClasses = {
      left: 'items-start text-left',
      center: 'items-center text-center',
      right: 'items-end text-right',
    }[align]

    const headingProps = restProps as React.HTMLAttributes<HTMLHeadingElement>

    return (
      <div className={cn('flex flex-col gap-3', alignClasses, className)}>
        <div className="relative flex w-full items-center gap-4">
          <Component
            ref={ref}
            className={cn(
              'text-2xl font-bold text-basic-primary small:text-3xl large:text-4xl relative z-10',
              headingProps.className
            )}
            {...omit(headingProps, ['className'])}
          >
            {children}
          </Component>

          {accent && (
            <div
              aria-hidden="true"
              className="relative flex-1 h-1.5 w-24 min-w-[80px] max-w-[120px] overflow-hidden rounded-full bg-fg-secondary"
            >
              <span className="absolute inset-y-0 left-0 w-2/3 origin-left rounded-full bg-gradient-to-r from-wisled-500 to-wisled-400 [transform:skewX(-20deg)]" />
            </div>
          )}
        </div>

        {subtitle && (
          <div className="w-full">
            <p className="text-md text-secondary small:text-lg">{subtitle}</p>
          </div>
        )}
      </div>
    )
  }
)

SectionHeading.displayName = 'SectionHeading'

export { SectionHeading }

// Helper for omitting keys
function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}