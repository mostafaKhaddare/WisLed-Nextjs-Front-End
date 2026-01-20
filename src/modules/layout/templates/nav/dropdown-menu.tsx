'use client'

import React, { useRef } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

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

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  item,
  activeItem,
  children,
  customContent,
  isOpen,
  onOpenChange,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    onOpenChange(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onOpenChange(false)
    }, 200)
  }

  const renderSubcategories = (categories: CategoryItem[]) => (
    <Container className="flex flex-col gap-6 !px-14 !pb-10 !pt-8">
      {/* Header Link */}
      <div className="flex w-full justify-end border-b border-basic-primary/10 pb-4">
         <LocalizedClientLink 
            href={`${activeItem?.handle ?? '/'}`}
            className="text-sm font-medium text-action-primary hover:underline"
         >
           Shop all {activeItem?.name === 'Shop' || activeItem?.name === 'Collections' ? '' : activeItem?.name} &rarr;
         </LocalizedClientLink>
      </div>

      {/* Grid Layout: 4 Columns -> 8 items will form 2 rows */}
      <div className="grid grid-cols-4 gap-x-10 gap-y-12">
        {categories.map((subItem, index) => (
          <div key={index} className="flex flex-col gap-4">
            
            {/* Image & Title */}
            <Box className="flex flex-col gap-3">
              {subItem.image && (
                <LocalizedClientLink
                  href={subItem.handle}
                  className="group block overflow-hidden rounded-md bg-secondary/20"
                >
                  <Box className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={subItem.image.url}
                      alt={subItem.image.alt || `${subItem.name} category image`}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                  </Box>
                </LocalizedClientLink>
              )}
              
              <LocalizedClientLink
                href={subItem.handle}
                className="text-lg font-medium text-basic-primary transition-colors hover:text-action-primary"
                data-testid={formatNameForTestId(`${subItem.name}-category-title`)}
              >
                {subItem.name}
              </LocalizedClientLink>
            </Box>

            {/* Sub-links */}
            {subItem.category_children && (
              <div className="flex flex-col gap-2.5">
                {subItem.category_children.map((childItem, childIndex) => (
                  <LocalizedClientLink
                    key={childIndex}
                    href={childItem.handle}
                    className="text-sm text-secondary transition-colors duration-200 hover:text-action-primary hover:translate-x-1"
                    data-testid={formatNameForTestId(`${childItem.name}-category-item`)}
                  >
                    {childItem.name}
                  </LocalizedClientLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Container>
  )

  return (
    <div
      className="flex h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {item.category_children && (
        <Box
          className={cn(
            'absolute left-0 top-full z-50 w-full pt-0 transition-all duration-300',
            isOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none invisible opacity-0'
          )}
        >
          {/* SCROLLABLE CONTAINER: max-height of 70% viewport + vertical scroll */}
          <div className="bg-primary shadow-xl border-t border-basic-primary/5 max-h-[70vh] overflow-y-auto">
             {customContent ?? renderSubcategories(item.category_children)}
          </div>
        </Box>
      )}
    </div>
  )
}

export default DropdownMenu