import { sdk } from '@lib/config'
import { logMedusaRequestError } from '@lib/util/medusa-request'

export const listCategories = async function () {
  return sdk.store.category
    .list(
      {
        fields:
          '*category_children, *category_children.product_category_image, *products, *parent_category, *parent_category.parent_category, *product_category_image',
      },
      { next: { tags: ['categories'] } }
    )
    .then(({ product_categories }) => product_categories)
    .catch((error) => {
      logMedusaRequestError('/store/product-categories', error)
      return []
    })
}

export const getCategoriesList = async function (
  offset: number = 0,
  limit: number = 100
) {
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset },
    { next: { tags: ['categories'] } }
  )
}

export const getCategoryByHandle = async function (
  categoryHandle: string[] | string
) {
  const handleParam = Array.isArray(categoryHandle)
    ? categoryHandle[categoryHandle.length - 1]
    : categoryHandle

  return sdk.store.category.list(
    {
      handle: handleParam,
      fields:
        '*category_children, *category_children.product_category_image, *products, *parent_category, *parent_category.parent_category, *product_category_image',
    },
    { next: { tags: ['categories'] } }
  )
}
