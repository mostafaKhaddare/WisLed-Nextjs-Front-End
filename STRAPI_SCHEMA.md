# Strapi Schema Setup for "Shop the Look"

Follow these steps to configure your Strapi backend to support the "Shop the Look" feature.

## 1. Create a Component: `Hotspot`

First, create a reusable component for the product hotspots.

1.  Go to **Content-Type Builder** > **Create new component**.
2.  **Name**: `Hotspot`
3.  **Category**: `elements` (or `shared`)
4.  Add the following fields:
    *   **Text** (Short Text) -> Name: `product_handle` (Required)
        *   *Description*: The handle of the product in Medusa (e.g., `led-strip-24v`).
    *   **Number** (Float) -> Name: `position_x` (Required)
        *   *Description*: Horizontal position in percentage (0-100).
    *   **Number** (Float) -> Name: `position_y` (Required)
        *   *Description*: Vertical position in percentage (0-100).

## 2. Create a Collection Type: `Inspiration`

Now, create the main content type for the lookbook entries.

1.  Go to **Content-Type Builder** > **Create new collection type**.
2.  **Display Name**: `Inspiration`
3.  **API ID**: `inspiration` (Singular) / `inspirations` (Plural)
4.  Add the following fields:
    *   **Text** (Short Text) -> Name: `title` (Required)
    *   **Media** (Single Media) -> Name: `image` (Required)
    *   **Enumeration** -> Name: `room_type`
        *   *Values*:
            *   Kitchen
            *   Living Room
            *   Office
            *   Outdoor
            *   Bedroom
            *   Bathroom
    *   **Component** (Repeatable) -> Name: `hotspots`
        *   Select existing component `elements.Hotspot`.

## 3. Permissions

1.  Go to **Settings** > **Users & Permissions Plugin** > **Roles** > **Public**.
2.  Under **Inspiration**, check `find` and `findOne`.
3.  Click **Save**.

## 4. API Response Structure

The `LookbookSection` expects the API response to look like this (standard Strapi v4):

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Modern Kitchen",
        "room_type": "Kitchen",
        "image": {
          "data": {
            "attributes": {
              "url": "/uploads/kitchen_1.jpg"
            }
          }
        },
        "hotspots": [
          {
            "id": 1,
            "product_handle": "my-product-handle",
            "position_x": 45.5,
            "position_y": 20.0
          }
        ]
      }
    }
  ]
}
```

Ensure your `.env.local` in Next.js has:
```bash
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```
