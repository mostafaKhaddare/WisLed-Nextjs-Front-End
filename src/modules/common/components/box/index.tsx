import * as React from 'react'

import { Slot } from '@lib/util/slot'

export type BoxProps<T extends React.ElementType = 'div'> = {
  as?: T
  asChild?: boolean
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<T> & {
      ref?: React.Ref<T>
    }

export const Box = React.forwardRef(
  <T extends React.ElementType = 'div'>(
    {
      as,
      asChild,
      children,
      ...props
    }: BoxProps<T>,
    ref: React.Ref<T>
  ) => {
    const Component = asChild ? Slot : as || 'div'

    return (
      <Component ref={ref as React.Ref<T>} {...props}>
        {children}
      </Component>
    )
  }
)

Box.displayName = 'Box'
