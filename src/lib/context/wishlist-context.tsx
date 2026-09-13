'use client'

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import {
    addToWishlist as serverAddToWishlist,
    removeFromWishlist as serverRemoveFromWishlist,
    getWishlist as serverGetWishlist,
    getVariantIdByProductHandle,
    type WishlistItem,
} from '@lib/data/wishlist'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GuestWishlistItem {
    product_id: string
    variant_id: string
    product_handle: string
    title: string
    thumbnail: string
    added_at: string
}

interface WishlistContextValue {
    /** All items currently in the wishlist (guest + server merged) */
    items: WishlistItem[]
    /** Guest items stored in localStorage (for non-logged-in users) */
    guestItems: GuestWishlistItem[]
    /** Total count of wishlist items */
    count: number
    /** Whether the wishlist is loading */
    isLoading: boolean
    /** Whether the user is authenticated */
    isAuthenticated: boolean
    /** Check if a product handle is wishlisted */
    isWishlisted: (productHandle: string) => boolean
    /** Check if a variant ID is wishlisted */
    isVariantWishlisted: (variantId: string) => boolean
    /** Get the wishlist item ID for a product handle (for removal) */
    getItemId: (productHandle: string) => string | null
    /** Toggle wishlist for a product (add/remove) */
    toggleWishlist: (params: {
        productHandle: string
        variantId?: string
        regionId?: string
        title?: string
        thumbnail?: string
        productId?: string
    }) => Promise<{ success: boolean; error?: string }>
    /** Remove an item from wishlist by item ID */
    removeItem: (itemId: string) => Promise<{ success: boolean; error?: string }>
    /** Refresh wishlist from server */
    refresh: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const GUEST_WISHLIST_KEY = 'wisled_guest_wishlist'

function getGuestWishlist(): GuestWishlistItem[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function setGuestWishlist(items: GuestWishlistItem[]) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items))
    } catch {
        // Storage full or disabled
    }
}

function clearGuestWishlist() {
    if (typeof window === 'undefined') return
    try {
        localStorage.removeItem(GUEST_WISHLIST_KEY)
    } catch {
        // Ignore
    }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function WishlistProvider({
    children,
    initialAuthenticated = false,
}: {
    children: ReactNode
    initialAuthenticated?: boolean
}) {
    const [serverItems, setServerItems] = useState<WishlistItem[]>([])
    const [guestItems, setGuestItems] = useState<GuestWishlistItem[]>([])
    const [isLoading, _setIsLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated)
    const hasMerged = useRef(false)
    const isFetching = useRef(false)

    // Load guest wishlist on mount
    useEffect(() => {
        setGuestItems(getGuestWishlist())
    }, [])

    // Fetch server wishlist
    const fetchServerWishlist = useCallback(async () => {
        if (isFetching.current) return
        isFetching.current = true

        try {
            const { items, error } = await serverGetWishlist()

            if (error === 'Not logged in' || error === 'Not authenticated') {
                setIsAuthenticated(false)
                setServerItems([])
                return
            }

            if (!error && items) {
                setIsAuthenticated(true)
                setServerItems(items)
            }
        } catch {
            // Silently fail
        } finally {
            isFetching.current = false
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchServerWishlist()
    }, [fetchServerWishlist])

    // Merge guest wishlist into server when user becomes authenticated
    useEffect(() => {
        if (!isAuthenticated || hasMerged.current) return

        const guestList = getGuestWishlist()
        if (guestList.length === 0) {
            hasMerged.current = true
            return
        }

        // Merge: add guest items that aren't already in server wishlist
        const merge = async () => {
            hasMerged.current = true
            const serverVariantIds = new Set(
                serverItems.map((item) => item.product_variant_id)
            )

            for (const guestItem of guestList) {
                if (!serverVariantIds.has(guestItem.variant_id)) {
                    try {
                        await serverAddToWishlist(guestItem.variant_id)
                    } catch {
                        // Skip failed items
                    }
                }
            }

            // Clear guest wishlist after merge
            clearGuestWishlist()
            setGuestItems([])

            // Refresh server wishlist to get merged state
            await fetchServerWishlist()
        }

        merge()
    }, [isAuthenticated, serverItems, fetchServerWishlist])

    // Check if a product handle is wishlisted
    const isWishlisted = useCallback(
        (productHandle: string): boolean => {
            // Check server items
            const inServer = serverItems.some(
                (item) => item.product_variant?.product?.handle === productHandle
            )
            if (inServer) return true

            // Check guest items (only if not authenticated)
            if (!isAuthenticated) {
                return guestItems.some(
                    (item) => item.product_handle === productHandle
                )
            }

            return false
        },
        [serverItems, guestItems, isAuthenticated]
    )

    // Check if a variant ID is wishlisted
    const isVariantWishlisted = useCallback(
        (variantId: string): boolean => {
            const inServer = serverItems.some(
                (item) => item.product_variant_id === variantId
            )
            if (inServer) return true

            if (!isAuthenticated) {
                return guestItems.some((item) => item.variant_id === variantId)
            }

            return false
        },
        [serverItems, guestItems, isAuthenticated]
    )

    // Get wishlist item ID for a product handle
    const getItemId = useCallback(
        (productHandle: string): string | null => {
            const serverItem = serverItems.find(
                (item) => item.product_variant?.product?.handle === productHandle
            )
            if (serverItem) return serverItem.id

            if (!isAuthenticated) {
                const guestItem = guestItems.find(
                    (item) => item.product_handle === productHandle
                )
                if (guestItem) return `guest_${guestItem.variant_id}`
            }

            return null
        },
        [serverItems, guestItems, isAuthenticated]
    )

    // Toggle wishlist
    const toggleWishlist = useCallback(
        async (params: {
            productHandle: string
            variantId?: string
            regionId?: string
            title?: string
            thumbnail?: string
            productId?: string
        }): Promise<{ success: boolean; error?: string }> => {
            const {
                productHandle,
                variantId: providedVariantId,
                regionId,
                title,
                thumbnail,
                productId,
            } = params
            const alreadyWishlisted = isWishlisted(productHandle)

            if (alreadyWishlisted) {
                // ── REMOVE ──
                const itemId = getItemId(productHandle)
                if (!itemId) return { success: false, error: 'Item not found' }

                if (itemId.startsWith('guest_')) {
                    // Remove from guest wishlist (optimistic)
                    const newGuest = guestItems.filter(
                        (g) => g.product_handle !== productHandle
                    )
                    setGuestItems(newGuest)
                    setGuestWishlist(newGuest)
                    return { success: true }
                }

                // Optimistic update
                setServerItems((prev) => prev.filter((item) => item.id !== itemId))

                const result = await serverRemoveFromWishlist(itemId)
                if (!result.success) {
                    // Revert optimistic update
                    await fetchServerWishlist()
                    return {
                        success: false,
                        error:
                            typeof result.error === 'string'
                                ? result.error
                                : 'Failed to remove',
                    }
                }

                return { success: true }
            } else {
                // ── ADD ──
                let vid = providedVariantId

                // Fetch variant ID if not provided
                if (!vid && regionId) {
                    const { variantId: fetchedId, error } =
                        await getVariantIdByProductHandle(productHandle, regionId)
                    if (error || !fetchedId) {
                        return {
                            success: false,
                            error: error || 'Could not find product variant',
                        }
                    }
                    vid = fetchedId
                }

                if (!vid) {
                    return { success: false, error: 'Variant ID is required' }
                }

                if (!isAuthenticated) {
                    // ── Guest wishlist (localStorage) ──
                    const newItem: GuestWishlistItem = {
                        product_id: productId || '',
                        variant_id: vid,
                        product_handle: productHandle,
                        title: title || productHandle,
                        thumbnail: thumbnail || '',
                        added_at: new Date().toISOString(),
                    }

                    // Prevent duplicates
                    const exists = guestItems.some(
                        (g) => g.variant_id === vid || g.product_handle === productHandle
                    )
                    if (exists) return { success: true }

                    const newGuest = [...guestItems, newItem]
                    setGuestItems(newGuest)
                    setGuestWishlist(newGuest)
                    return { success: true }
                }

                // ── Server wishlist (optimistic) ──
                const optimisticItem: WishlistItem = {
                    id: `optimistic_${Date.now()}`,
                    product_variant_id: vid,
                    product_variant: {
                        id: vid,
                        product_id: productId || '',
                        product: {
                            id: productId || '',
                            title: title || productHandle,
                            handle: productHandle,
                            thumbnail: thumbnail || '',
                        },
                    },
                }

                setServerItems((prev) => [...prev, optimisticItem])

                const result = await serverAddToWishlist(vid)
                if (!result.success) {
                    // Revert optimistic update
                    setServerItems((prev) =>
                        prev.filter((item) => item.id !== optimisticItem.id)
                    )
                    return {
                        success: false,
                        error:
                            typeof result.error === 'string'
                                ? result.error
                                : 'Failed to add to wishlist',
                    }
                }

                // Refresh to get real item IDs
                await fetchServerWishlist()
                return { success: true }
            }
        },
        [
            isWishlisted,
            getItemId,
            guestItems,
            isAuthenticated,
            fetchServerWishlist,
        ]
    )

    // Remove item
    const removeItem = useCallback(
        async (
            itemId: string
        ): Promise<{ success: boolean; error?: string }> => {
            if (itemId.startsWith('guest_')) {
                const variantId = itemId.replace('guest_', '')
                const newGuest = guestItems.filter((g) => g.variant_id !== variantId)
                setGuestItems(newGuest)
                setGuestWishlist(newGuest)
                return { success: true }
            }

            // Optimistic removal
            const removedItem = serverItems.find((item) => item.id === itemId)
            setServerItems((prev) => prev.filter((item) => item.id !== itemId))

            const result = await serverRemoveFromWishlist(itemId)
            if (!result.success) {
                // Revert
                if (removedItem) {
                    setServerItems((prev) => [...prev, removedItem])
                }
                return {
                    success: false,
                    error:
                        typeof result.error === 'string'
                            ? result.error
                            : 'Failed to remove',
                }
            }

            return { success: true }
        },
        [guestItems, serverItems]
    )

    // Combined items
    const allItems = useMemo((): WishlistItem[] => {
        if (isAuthenticated) return serverItems

        // Convert guest items to WishlistItem format
        const guestAsWishlist: WishlistItem[] = guestItems.map((g) => ({
            id: `guest_${g.variant_id}`,
            product_variant_id: g.variant_id,
            product_variant: {
                id: g.variant_id,
                product_id: g.product_id,
                product: {
                    id: g.product_id,
                    title: g.title,
                    handle: g.product_handle,
                    thumbnail: g.thumbnail,
                },
            },
        }))

        return [...serverItems, ...guestAsWishlist]
    }, [serverItems, guestItems, isAuthenticated])

    const value = useMemo<WishlistContextValue>(
        () => ({
            items: allItems,
            guestItems,
            count: allItems.length,
            isLoading,
            isAuthenticated,
            isWishlisted,
            isVariantWishlisted,
            getItemId,
            toggleWishlist,
            removeItem,
            refresh: fetchServerWishlist,
        }),
        [
            allItems,
            guestItems,
            isLoading,
            isAuthenticated,
            isWishlisted,
            isVariantWishlisted,
            getItemId,
            toggleWishlist,
            removeItem,
            fetchServerWishlist,
        ]
    )

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    )
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
