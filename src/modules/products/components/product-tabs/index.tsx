'use client'

import { useMemo } from 'react'
import Link from 'next/link'

import { HttpTypes } from '@medusajs/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@modules/common/components/accordion'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { MinusThinIcon, PlusIcon } from '@modules/common/icons'

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const specifications = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('spec_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const technicalDocuments = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('doc_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const features = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('feat_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const design = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('des_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const tabs = [
    {
      label: 'Description',
      component: <ProductDescriptionTab description={product.description} />,
    },
    Object.entries(specifications).length > 0 && {
      label: 'Caractéristiques',
      component: <ProductSpecificationsTab specifications={specifications} />,
    },
    Object.entries(technicalDocuments).length > 0 && {
      label: 'Documents techniques',
      component: (
        <ProductTechnicalDocumentsTab technicalDocuments={technicalDocuments} />
      ),
    },
    Object.entries(features).length > 0 && {
      label: 'Fonctionnalités',
      component: <ProductFeaturesTab features={features} />,
    },
    Object.entries(design).length > 0 && {
      label: 'Design',
      component: <ProductDesignTab design={design} />,
    },
    {
      label: 'Politique de retour',
      component: <ShippingInfoTab />,
    },
  ].filter(Boolean)

  // Logic to set default tab 
  const specsTabIndex = tabs.findIndex((tab) => tab && tab.label.trim() === 'Caractéristiques')
  const defaultValue = specsTabIndex !== -1 ? `item-${specsTabIndex}` : undefined

  return (
    <div className="w-full">
      <Accordion
        type="single"
        collapsible
        className="flex w-full flex-col"
        defaultValue={defaultValue}
      >
        {tabs.map((tab, id) => {
          if (!tab) return null
          return (
            <AccordionItem
              key={id}
              value={`item-${id}`}
              className="border-basic-primary"
              data-testid="product-tab"
            >
              <AccordionTrigger className="!rounded-none !py-2 transition-all duration-200 ease-in-out [&[data-state=closed]>#minusIconSvg]:hidden [&[data-state=open]>#plusIconSvg]:hidden">
                <Heading
                  className="text-lg font-medium text-basic-primary"
                  as="h3"
                >
                  {tab.label}
                </Heading>
                <div
                  id="plusIconSvg"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-action-primary hover:text-action-primary-hover active:text-action-primary-pressed"
                >
                  <PlusIcon />
                </div>
                <div
                  id="minusIconSvg"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-action-primary hover:text-action-primary-hover active:text-action-primary-pressed"
                >
                  <MinusThinIcon />
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3 !pb-4">
                {tab.component}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

const ProductDescriptionTab = ({ description }: { description: string | null }) => {
  return (
    <Text
      data-testid="product-description-tab"
      size="md"
      className="whitespace-pre-line text-secondary"
    >
      {description}
    </Text>
  )
}

const ProductSpecificationsTab = ({
  specifications,
}: {
  specifications: Record<string, unknown>
}) => {
  const entries = Object.entries(specifications)

  if (entries.length === 0) return null

  return (
    <Box data-testid="product-dimensions-tab" className="mt-4 w-full">
      <table className="w-full table-auto rounded-lg border border-gray-200 shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
              Spécifications
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
              Valeur
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map(([key, value], index) => (
            <tr
              key={key}
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } transition-colors duration-200 hover:bg-indigo-50`}
            >
              <td className="break-words px-3 py-3 text-sm font-medium text-gray-800">
                {formatKey(key, 'spec_')}
              </td>
              <td className="break-words px-5 py-3 text-sm text-gray-600">
                {value as string}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}

const ProductTechnicalDocumentsTab = ({
  technicalDocuments,
}: {
  technicalDocuments: Record<string, unknown>
}) => {
  const docEntries = Object.entries(technicalDocuments)

  if (docEntries.length === 0) return null

  return (
    <Box className="mt-2 w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {docEntries.map(([key, value]) => {
          const label = formatKey(key, 'doc_')
          const href = String(value || '')
          const isLink = /^https?:\/\//i.test(href)
          if (!isLink) return null

          const isPdf = href.toLowerCase().endsWith('.pdf') || href.toLowerCase().includes('.pdf')

          return (
            <Link
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-basic-primary/10 bg-primary p-4 shadow-sm transition-all duration-200 hover:border-action-primary/40 hover:bg-secondary/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25 dark:hover:bg-white/[0.07]"
            >
              {/* Document icon */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isPdf
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}
              >
                {isPdf ? (
                  // PDF icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                    <path fill="white" d="M9 13h1.5c.83 0 1.5.67 1.5 1.5S11.33 16 10.5 16H9v-3zm0 4h2.5c.83 0 1.5.67 1.5 1.5S12.33 20 11.5 20H9v-3zm5-4h1.5c.83 0 1.5.67 1.5 1.5S16.33 16 15.5 16H14v-3z" />
                    <text x="4.5" y="20.5" fontSize="6" fontWeight="bold" fill="white" fontFamily="sans-serif">PDF</text>
                  </svg>
                ) : (
                  // Generic document / fiche technique icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                )}
              </div>

              {/* Label + hint */}
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-basic-primary transition-colors group-hover:text-action-primary dark:text-white/90 dark:group-hover:text-brand-400">
                  {label}
                </span>
                <span className="text-xs text-secondary dark:text-white/40">
                  {isPdf ? 'Fichier PDF' : 'Document technique'} · Ouvrir ↗
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </Box>
  )
}

const ProductFeaturesTab = ({
  features,
}: {
  features: Record<string, unknown>
}) => {
  const entries = Object.entries(features)

  if (entries.length === 0) return null

  return (
    <Box className="mt-2 w-full">
      <ul className="list-disc pl-5">
        {entries.map(([key, value]) => {
          const text = String(value || '').trim()
          if (!text) return null
          return (
            <li key={key} className="mb-1 text-sm">
              <Text as="span" className="text-secondary">
                {text}
              </Text>
            </li>
          )
        })}
      </ul>
    </Box>
  )
}

const ProductDesignTab = ({ design }: { design: Record<string, unknown> }) => {
  return (
    <Box data-testid="product-design-tab">
      {Object.entries(design).map(([key, value]) => (
        <div key={key}>
          <Text as="span" className="font-medium text-basic-primary">
            {formatKey(key, 'des_')}:
          </Text>{' '}
          <Text as="span" className="text-secondary">
            {value as string}
          </Text>
        </div>
      ))}
    </Box>
  )
}

const ShippingInfoTab = () => {
  return (
    <ul className="list-disc pl-4 text-md text-secondary 2xl:pl-5">
      <li>
        🚚 Livraison au Maroc

        Nous assurons la livraison dans tout le Maroc.
        La livraison est effectuée via Ghazala, SaT Express , Sun Express ou un service de messagerie local, selon votre localisation.

        Les commandes sont généralement expédiées sous 24 à 72 heures ouvrables après confirmation.
        Les frais de livraison sont calculés lors de la validation de la commande.

        Le paiement à la livraison (contre-remboursement) est disponible selon la ville.
      </li>
      <br />
      <li>
        🔁 Politique de retour

        Nous offrons une politique de retour de 7 jours.
        Si vous n’êtes pas satisfait de votre achat, vous pouvez retourner le produit pour un échange ou un remboursement, à condition qu’il soit dans son état et emballage d’origine.

        ⚠️ Les frais de retour sont à la charge du client, sauf en cas de produit défectueux ou erreur de notre part.
      </li>
    </ul>
  )
}

const formatKey = (key: string, prefix: string): string => {
  return key
    .replace(prefix, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}