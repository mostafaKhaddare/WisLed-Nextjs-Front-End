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

  // Determine if this product has real selectable options
  const hasOptions = (product.options || []).length > 0

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }
    // If the product has no options configured, just use the first variant automatically
    if (!hasOptions) {
      return product.variants[0]
    }
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options, hasOptions])

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
      setTimeout(() => {
        openCartDropdown()
        toast('success', 'Produit ajouté au panier !')
      }, 1000)
    } catch (error) {
      toast('error', error)
    } finally {
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

    // 3. Phone number from env — NEXT_PUBLIC_WHATSAPP_PHONE in .env (e.g. 212710420420)
    const phoneNumber = (process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '212710420420').replace(/\D/g, '')

    // 4. Create the message
    const message = `Bonjour, j'aimerais commander : ${fullProductTitle}.\n\nLien : ${productLink}\n\nMerci.`;

    // 5. Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  // --- NEW WHATSAPP FUNCTION END ---

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // No variant configured at all — treat as available
    if (!selectedVariant) return false
    if (!selectedVariant.manage_inventory) return true
    if (selectedVariant.allow_backorder) return true
    if (
      selectedVariant.manage_inventory &&
      (selectedVariant.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  /** How many of the selected variant are already in the cart. */
  const cartQuantity = useMemo(() => {
    if (!selectedVariant) return 0
    return (cartItems ?? []).reduce((sum, item) => {
      if (item.variant_id === selectedVariant.id) {
        return sum + item.quantity
      }
      return sum
    }, 0)
  }, [selectedVariant, cartItems])

  /**
   * Highest quantity the customer may add.
   *
   * `Infinity` means Medusa does not track this variant's stock (or backorders
   * are allowed), so it will not reject a larger line and we must not invent a
   * ceiling. Otherwise it is the real stock figure for the selected variant,
   * minus what is already in the cart — which is what stops an oversale.
   */
  const maxQuantity = useMemo(() => {
    if (!selectedVariant) return 0

    if (!selectedVariant.manage_inventory || selectedVariant.allow_backorder) {
      return Infinity
    }

    const available = selectedVariant.inventory_quantity ?? 0
    return Math.max(0, available - cartQuantity)
  }, [selectedVariant, cartQuantity])

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
          {hasOptions && (
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
        {/* Quantity stepper + add to cart, as one row per the mock */}
        <Box className="flex flex-wrap items-stretch gap-x-3 gap-y-2 small:flex-nowrap">
          <Box className="flex h-14 items-center rounded-[28px] bg-white px-1.5 shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-14px_rgba(20,20,59,0.12)] dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]">
            <ItemQtySelect
              qty={qty}
              maxQuantity={maxQuantity}
              action={setQty}
              bare
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
            className="!h-14 flex-1 !rounded-[28px] !bg-[#1D4ED8] !font-jakarta !text-base !font-bold !text-white hover:!bg-[#1B45C4]"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && hasOptions
              ? 'Choisir une variante'
              : !inStock
                ? 'Rupture de stock'
                : 'Ajouter au panier'}
          </Button>
        </Box>

        {/* Reassurance strip directly under the buy controls */}
        <Box className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(20,20,59,0.05),0_8px_24px_-14px_rgba(20,20,59,0.12)] dark:bg-[#141A2B] dark:shadow-none dark:ring-1 dark:ring-white/[0.06]">
          {[
            'Paiement à la livraison disponible',
            'Conseil pour choisir l’alimentation adaptée',
          ].map((label) => (
            <Box key={label} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-4 w-4 shrink-0 place-items-center rounded-full"
                style={{
                  background: 'rgba(255,200,87,0.6)',
                  boxShadow: '0 0 10px 2px rgba(255,200,87,0.55)',
                }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFC857]" />
              </span>
              <span className="font-jakarta text-sm font-semibold text-[#0F1B33] dark:text-white">
                {label}
              </span>
            </Box>
          ))}
        </Box>

        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsAppClick}
          className="!h-[52px] w-full !rounded-[26px] !bg-[#25D366] !font-jakarta !text-[15px] !font-bold !text-[#06260F] hover:!bg-[#1FBE5B]"
        >
          <FaWhatsapp size={20} />
          <span>Poser une question sur WhatsApp</span>
        </Button>

        {maxQuantity === 0 && inStock && (
          <Text size="sm" className="text-negative">
            Vous ne pouvez pas ajouter plus d&apos;articles — vous avez déjà la
            quantité maximale dans votre panier.
          </Text>
        )}
      </div>
    </>
  )
}