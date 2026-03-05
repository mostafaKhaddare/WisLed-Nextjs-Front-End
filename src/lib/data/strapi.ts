export const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function getStrapiData(path: string) {
    const url = `${STRAPI_API_URL}/api/${path}`;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers,
            cache: 'no-store',  // Always fresh — use fetch.ts functions with tags for cached endpoints
        });

        if (!response.ok) {
            console.error(`Error fetching Strapi data from ${url}: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Strapi fetch error:", error);
        return null;
    }
}

export type StrapiImage = {
    id: number;
    attributes: {
        url: string;
        alternativeText: string;
        width: number;
        height: number;
    }
}

export type Hotspot = {
    id: number;
    product_handle: string;
    position_x: number;
    position_y: number;
}

export type InspirationAttributes = {
    title: string;
    room_type: string;
    image: {
        data: StrapiImage;
    };
    hotspots: Hotspot[];
}

export type Inspiration = {
    id: number;
    attributes: InspirationAttributes;
}

export const getAttributes = (item: any) => {
    if (!item) return null;
    return item.attributes || item;
}
