'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { FaWhatsapp } from "react-icons/fa";
import { addToCart } from '@lib/data/cart'
import { useCartStore } from '@lib/store/useCartStore'
import { HttpTypes } from '@medusajs/types'
import ItemQtySelect from '@modules/cart/components/item-qty-select'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import Divider from '@modules/common/components/divider'
import { Text } from '@modules/common/components/text'
import { toast } from '@modules/common/components/toast'
import OptionSelect from '@modules/products/components/product-actions/option-select'
import { isEqual } from 'lodash'
import { VariantColor } from 'types/strapi'
import ProductPrice from '../product-price'

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  cartItems: HttpTypes.StoreCartLineItem[]
  colors: VariantColor[]
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant['options']
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  cartItems,
  colors,
  disabled,
}: ProductActionsProps) {
  const { openCartDropdown } = useCartStore()
  const actionsRef = useRef<HTMLDivElement>(null)
  const [qty, setQty] = useState(1)
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: qty,
        countryCode,
      })
    } catch (error) {
      toast('error', error)
    } finally {
      setTimeout(() => {
        openCartDropdown()
        toast('success', 'Product was added to cart!')
      }, 1000)

      setIsAdding(false)
    }
  }

  // --- NEW WHATSAPP FUNCTION START ---
  const handleWhatsAppClick = () => {
    // 1. Get the current URL
    const productLink = window.location.href;

    // 2. Build the Title dynamically
    // If a variant is selected (e.g. Red, Size M), we add it to the title
    const variantSuffix = selectedVariant?.title ? ` - ${selectedVariant.title}` : '';
    const fullProductTitle = `${product.title}${variantSuffix}`;

    // 3. Your Phone Number (Update this!)
    const phoneNumber = "212648522511"; 

    // 4. Create the message
    const message = `Bonjour, j'aimerais commander : ${fullProductTitle}.\n\nLien : ${productLink}\n\nMerci.`;

    // 5. Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  // --- NEW WHATSAPP FUNCTION END ---

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  // Get the max quantity
  const maxQuantity = useMemo(() => {
    if (!selectedVariant || !cartItems) return 10

    const cartQuantity =
      cartItems.reduce((sum, item) => {
        if (item.variant_id === selectedVariant?.id) {
          return sum + item.quantity
        }
        return sum
      }, 0) || 0

    if (
      selectedVariant?.inventory_quantity !== null &&
      selectedVariant?.inventory_quantity !== undefined
    ) {
      return Math.max(0, selectedVariant.inventory_quantity - cartQuantity)
    }

    return 10 - cartQuantity
  }, [selectedVariant, cartItems])

  // Preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    } else if (product.variants && product.variants.length > 1) {
      const sortedVariants = [...product.variants].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      )
      const firstAlphabeticalVariant = sortedVariants[0]
      if (firstAlphabeticalVariant) {
        const variantOptions = optionsAsKeymap(firstAlphabeticalVariant.options)
        setOptions(variantOptions ?? {})
      }
    }
  }, [product.variants])

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        <ProductPrice product={product} variant={selectedVariant} />
        <Divider />
        <div>
          {product.variants.length > 0 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      variantsColors={colors}
                      title={option.title ?? ''}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <Box className="flex items-center gap-x-3">
          <Box className="min-w-[96px]">
            <ItemQtySelect
              qty={qty}
              maxQuantity={maxQuantity}
              action={setQty}
            />
          </Box>
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              maxQuantity === 0
            }
            className="w-full"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? 'Select variant'
              : !inStock
                ? 'Out of stock'
                : 'Add to cart'}
          </Button> 
        </Box>
        
        {/* WhatsApp Button */}
          <Button 
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-full font-medium flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <FaWhatsapp size={20} />
            <span>Chat on WhatsApp</span>
          </Button>

        {maxQuantity === 0 && inStock && (
          <Text size="sm" className="text-negative">
            You cannot add more items to your cart - you already have the
            maximum number in cart.
          </Text>
        )}
      </div>
    </>
  )
}