import React, { useMemo } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { NavigationItem } from '@modules/common/components/navigation-item'

interface CategoryImage {
  url: string
  alt?: string
}

interface CategoryItem {
  name: string
  handle: string
  image?: CategoryImage | null
  category_children?: CategoryItem[]
}

interface DropdownMenuProps {
  item: CategoryItem
  activeItem: {
    name: string
    handle: string
  }
  children: React.ReactNode
  customContent?: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const SubCategory = ({ item }: { item: CategoryItem }) => (
  <div className="flex flex-col">
    {item.category_children?.map((child, index) => (
      <NavigationItem
        key={index}
        href={child.handle}
        className="py-1.5 text-md text-secondary"
        data-testid={formatNameForTestId(`${child.name}-category-item`)}
      >
        {child.name}
      </NavigationItem>
    ))}
  </div>
)

const Category = ({ item }: { item: CategoryItem }) => (
  <div className="flex flex-col gap-2">
    <Box className="flex flex-col gap-2">
      {item.image && (
        <LocalizedClientLink href={item.handle} className="group block">
          <Box className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={item.image.url}
              alt={item.image.alt || `${item.name} category image`}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </Box>
        </LocalizedClientLink>
      )}
      <NavigationItem
        href={item.handle}
        className="w-max py-2 text-lg text-basic-primary !duration-150 hover:border-b hover:border-action-primary"
        data-testid={formatNameForTestId(`${item.name}-category-title`)}
      >
        {item.name}
      </NavigationItem>
    </Box>
    {item.category_children && <SubCategory item={item} />}
  </div>
)

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  item,
  activeItem,
  children,
  customContent,
  isOpen,
  onOpenChange,
}) => {
  const subcategories = useMemo(
    () =>
      item.category_children?.map((subItem, index) => (
        <Category key={index} item={subItem} />
      )),
    [item.category_children]
  )

  const renderSubcategories = (
    <Container className="flex flex-col gap-6 !px-14 !pb-8 !pt-5">
      <Button
        variant="tonal"
        className="w-max !px-3 !py-2"
        onClick={() => onOpenChange(false)}
        asChild
      >
        <LocalizedClientLink href={`${activeItem?.handle ?? '/'}`}>
          Shop all{' '}
          {activeItem?.name === 'Shop' || activeItem?.name === 'Collections'
            ? ''
            : activeItem?.name}
        </LocalizedClientLink>
      </Button>
      <div className="grid grid-cols-4 gap-8">{subcategories}</div>
    </Container>
  )

  return (
    <div
      className="flex"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      {children}

      {item.category_children && (
        <Box
          className={cn(
            'absolute left-0 top-full z-50 w-full translate-y-0 bg-primary shadow-lg transition-all duration-300',
            isOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none invisible opacity-0'
          )}
          role="menu"
        >
          {customContent ?? renderSubcategories}
        </Box>
      )}
    </div>
  )
}

export default React.memo(DropdownMenu)