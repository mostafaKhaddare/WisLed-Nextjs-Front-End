import React from 'react'

import {
  Breadcrumbs,
  BreadcrumbsItem,
  BreadcrumbsLink,
  BreadcrumbsList,
  BreadcrumbsSeparator,
  BreadcrumbsStatic,
} from '@modules/common/components/breadcrumbs'
import { ArrowLeftIcon } from '@modules/common/icons'

export default function StoreBreadcrumbs({
  breadcrumb,
}: {
  breadcrumb?: string
}) {
  return (
    <>
      <Breadcrumbs className="text-basic-primary">
        <BreadcrumbsList className="hidden small:flex">
          <BreadcrumbsItem>
            <BreadcrumbsLink href="/">Page d’accueil</BreadcrumbsLink>
          </BreadcrumbsItem>
          <BreadcrumbsSeparator />
          <BreadcrumbsItem>
            <BreadcrumbsStatic>{breadcrumb ?? 'Boutique'}</BreadcrumbsStatic>
          </BreadcrumbsItem>
        </BreadcrumbsList>
        <BreadcrumbsList className="flex small:hidden">
          <BreadcrumbsItem>
            <BreadcrumbsLink
              href="/"
              className="flex items-center gap-2 text-md"
            >
              <ArrowLeftIcon className="h-[18px] w-[18px]" />
              Retour à la page d’accueil
            </BreadcrumbsLink>
          </BreadcrumbsItem>
        </BreadcrumbsList>
      </Breadcrumbs>
    </>
  )
}
