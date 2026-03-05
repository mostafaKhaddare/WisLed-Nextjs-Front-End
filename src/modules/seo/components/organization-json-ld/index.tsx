
export default function OrganizationJsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "WisLed",
        "url": "https://wisled.com",
        "logo": "https://wisled.com/logo.png", // Replace with actual logo URL if available
        "sameAs": [
            "https://www.facebook.com/wisled",
            "https://www.instagram.com/wisled"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+212-000-000000",
            "contactType": "customer service"
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
