import { sdk } from '@lib/config'

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
