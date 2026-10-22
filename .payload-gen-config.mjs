// src/payload.config.ts
import path2 from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

// src/payload/access.ts
var authenticated = ({ req: { user } }) => Boolean(user);

// src/payload/fields/about-us.ts
var contentSectionFields = () => [
  { name: "Title", type: "text", required: true },
  { name: "Text", type: "textarea", required: true },
  {
    name: "Image",
    type: "upload",
    relationTo: "media",
    required: true
  }
];
var tileFields = () => [
  {
    name: "Image",
    type: "upload",
    relationTo: "media",
    required: true
  },
  { name: "Title", type: "text", required: true },
  { name: "Text", type: "textarea", required: true }
];
var whyUsFields = () => [
  { name: "Title", type: "text", required: true },
  {
    name: "Tile",
    type: "array",
    fields: tileFields()
  }
];
var numericalContentFields = () => [
  { name: "Title", type: "text", required: true },
  { name: "Text", type: "text", required: true }
];

// src/payload/fields/group.ts
var namedGroup = (name, fields) => ({
  name,
  type: "group",
  fields
});

// src/payload/revalidate.ts
var CACHE_TAGS = {
  // Media can appear anywhere, so an upload clears the content-bearing tags.
  media: ["hero-banner", "mid-banner", "inspirations", "collections-main", "explore-blog", "blog"],
  blogs: ["explore-blog", "blog", "blog-slugs"],
  "blog-post-categories": ["blog-categories"],
  inspirations: ["inspirations"],
  collections: ["collections-main"],
  categories: ["collections-main"],
  "product-variants-colors": ["variants-colors"],
  homepage: ["hero-banner", "mid-banner"],
  "about-us": ["about-us"],
  "contact-us": ["contact-us"],
  faq: ["faq"],
  "privacy-policy": ["privacy-policy"],
  "terms-and-condition": ["terms"]
};
var revalidateFor = async (slug) => {
  const tags = CACHE_TAGS[slug];
  if (!tags?.length) return;
  try {
    const { revalidateTag } = await import("next/cache");
    for (const tag of tags) revalidateTag(tag);
    console.log(`[revalidate] ${slug} -> ${tags.join(", ")}`);
  } catch (error) {
    console.log(
      `[revalidate] skipped for ${slug}: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
};
var revalidateHooks = (slug) => ({
  afterChange: [async () => void await revalidateFor(slug)],
  afterDelete: [async () => void await revalidateFor(slug)]
});

// src/payload/collections/AboutUs.ts
var AboutUs = {
  slug: "about-us",
  labels: { singular: "About Us", plural: "About Us" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    defaultColumns: ["OurStory.Title", "updatedAt"],
    group: "Content",
    description: "Single record \u2014 the About Us page content."
  },
  versions: { drafts: true },
  hooks: revalidateHooks("about-us"),
  fields: [
    { name: "Banner", type: "upload", relationTo: "media", hasMany: true },
    namedGroup("OurStory", contentSectionFields()),
    namedGroup("WhyUs", whyUsFields()),
    namedGroup("OurCraftsmanship", contentSectionFields()),
    // Named `KeyFigures`, not `Numbers`: Payload reserves the table suffix
    // `_numbers` for per-field numeric localization, so an array field called
    // `Numbers` produces the table `about_us_numbers`, which Payload then
    // mistakes for that localization table and asks drizzle to join via a
    // `_numbers` relation that does not exist. Every read fails with
    // "Cannot read properties of undefined (reading 'referencedTable')".
    // getAboutUs() maps `KeyFigures` back to `Numbers` for the frontend.
    {
      name: "KeyFigures",
      type: "array",
      fields: numericalContentFields()
    }
  ]
};

// src/payload/collections/BlogPostCategories.ts
var BlogPostCategories = {
  slug: "blog-post-categories",
  labels: { singular: "Blog post category", plural: "Blog post categories" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    useAsTitle: "Title",
    defaultColumns: ["Title", "Slug"],
    group: "Content"
  },
  versions: { drafts: true },
  hooks: revalidateHooks("blog-post-categories"),
  fields: [
    { name: "Title", type: "text" },
    { name: "Slug", type: "text", unique: true, index: true }
  ]
};

// src/payload/collections/Blogs.ts
var Blogs = {
  slug: "blogs",
  labels: { singular: "Blog", plural: "Blogs" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    useAsTitle: "Title",
    defaultColumns: ["Title", "Slug", "publishedAt"],
    group: "Content"
  },
  versions: { drafts: true },
  hooks: revalidateHooks("blogs"),
  fields: [
    { name: "Title", type: "text", required: true },
    { name: "Slug", type: "text", unique: true, index: true },
    { name: "Content", type: "richText", required: true },
    { name: "FeaturedImage", type: "upload", relationTo: "media", required: true },
    {
      name: "Categories",
      type: "relationship",
      relationTo: "blog-post-categories",
      hasMany: true
    }
  ]
};

// src/payload/collections/Categories.ts
var Categories = {
  slug: "categories",
  labels: { singular: "Category", plural: "Categories" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "handle", "updatedAt"],
    group: "Content"
  },
  versions: { drafts: true },
  hooks: revalidateHooks("categories"),
  fields: [
    { name: "title", type: "text", required: true },
    { name: "handle", type: "text", required: true, index: true },
    { name: "image", type: "upload", relationTo: "media", hasMany: true, required: true },
    { name: "description", type: "textarea" }
  ]
};

// src/payload/collections/Collections.ts
var Collections = {
  slug: "collections",
  labels: { singular: "Collection", plural: "Collections" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    useAsTitle: "Title",
    defaultColumns: ["Title", "Handle", "updatedAt"],
    group: "Content"
  },
  versions: { drafts: true },
  hooks: revalidateHooks("collections"),
  fields: [
    { name: "Title", type: "text", required: true },
    { name: "Handle", type: "text", required: true, unique: true, index: true },
    { name: "Image", type: "upload", relationTo: "media", required: true },
    { name: "Description", type: "textarea", required: true }
  ]
};

// src/payload/fields/hotspot.ts
var hotspotFields = () => [
  { name: "product_handle", type: "text", required: true },
  { name: "position_x", type: "number" },
  { name: "position_y", type: "number" }
];

// src/payload/collections/Inspirations.ts
var ROOM_TYPES = [
  "CUISINE MODERNE",
  "H\xD4TEL LUXE",
  "JARDIN & EXT\xC9RIEUR",
  "SALLE DE SPORT",
  "ENTREP\xD4T INDUSTRIEL",
  "SALLE DE BAIN",
  "SHOWROOM",
  "PISCINE"
];
var Inspirations = {
  slug: "inspirations",
  labels: { singular: "Inspiration", plural: "Inspirations" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "room_type", "updatedAt"],
    group: "Content"
  },
  versions: { drafts: true },
  hooks: revalidateHooks("inspirations"),
  fields: [
    { name: "title", type: "text" },
    {
      name: "room_type",
      type: "select",
      options: ROOM_TYPES.map((value) => ({
        value,
        label: value.toLowerCase().replace(/^./, (c) => c.toUpperCase()).replace(/ & /, " et ")
      }))
    },
    { name: "image", type: "upload", relationTo: "media", hasMany: true },
    {
      name: "hotspots",
      type: "array",
      fields: hotspotFields()
    }
  ]
};

// src/payload/collections/Media.ts
import path from "path";
var Media = {
  slug: "media",
  labels: {
    singular: "Media",
    plural: "Media"
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    useAsTitle: "filename",
    group: "Media"
  },
  upload: {
    // Resolved from the working directory rather than from `import.meta.url`
    // on purpose: the migration and admin scripts are bundled with esbuild
    // before they run, which rewrites `import.meta.url` to the bundle's
    // location. Resolving from the module path made the bundled migration
    // write its uploads three directories above the project root. Both Next
    // and the scripts run with the project root as the working directory, so
    // cwd is the stable anchor; PAYLOAD_MEDIA_DIR overrides it where the
    // process does not start in the project root (e.g. a deploy that mounts
    // an upload volume elsewhere).
    staticDir: path.resolve(
      process.env.PAYLOAD_MEDIA_DIR ?? path.join(process.cwd(), "public", "media")
    ),
    // Union of every `allowedTypes` used across the Strapi schemas:
    // images, files, videos, audios.
    mimeTypes: ["image/*", "video/*", "audio/*", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 400, position: "centre" },
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "banner", width: 1920, height: 820, position: "centre" }
    ],
    adminThumbnail: "thumbnail"
  },
  hooks: revalidateHooks("media"),
  fields: [
    {
      name: "alternativeText",
      type: "text",
      admin: { description: "Alt text, migrated from Strapi alternativeText" }
    },
    {
      name: "caption",
      type: "text",
      admin: { description: "Caption, migrated from Strapi caption" }
    }
  ]
};

// src/payload/fields/color.ts
var variantColorBlocks = {
  name: "Type",
  type: "blocks",
  labels: {
    singular: "Colour variant",
    plural: "Colour variants"
  },
  blocks: [
    {
      slug: "color-image",
      labels: { singular: "Colour image", plural: "Colour images" },
      fields: [
        {
          name: "Image",
          type: "upload",
          relationTo: "media"
        }
      ]
    },
    {
      slug: "color-hex",
      labels: { singular: "Colour hex", plural: "Colour hexes" },
      fields: [
        { name: "Color", type: "text" }
      ]
    }
  ]
};

// src/payload/collections/ProductVariantColors.ts
var ProductVariantColors = {
  slug: "product-variants-colors",
  labels: { singular: "Variant colour", plural: "Variant colours" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  admin: {
    useAsTitle: "Name",
    defaultColumns: ["Name"],
    group: "Catalogue"
  },
  versions: false,
  hooks: revalidateHooks("product-variants-colors"),
  fields: [
    { name: "Name", type: "text", required: true },
    variantColorBlocks
  ]
};

// src/payload/collections/Users.ts
var Users = {
  slug: "users",
  labels: { singular: "User", plural: "Users" },
  auth: true,
  access: {
    // Only signed-in admins may read or edit other users.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    create: authenticated
  },
  admin: {
    useAsTitle: "email",
    group: "Admin",
    defaultColumns: ["email", "updatedAt"]
  },
  fields: []
};

// src/payload/fields/banners.ts
var ctaFields = () => [
  { name: "BtnText", type: "text" },
  { name: "BtnLink", type: "text" }
];

// src/payload/fields/contact.ts
var contactCardFields = () => [
  {
    name: "Icon",
    type: "upload",
    relationTo: "media"
  },
  { name: "Title", type: "text" },
  { name: "Text", type: "text" },
  { name: "Link", type: "text" }
];
var contactGridFields = () => [
  { name: "Title", type: "text" },
  {
    name: "Cards",
    type: "array",
    fields: contactCardFields()
  }
];
var headerSectionFields = () => [
  { name: "Title", type: "text" },
  { name: "Text", type: "textarea" },
  {
    name: "Image",
    type: "upload",
    relationTo: "media",
    hasMany: true
  }
];

// src/payload/globals/ContactUs.ts
var ContactUs = {
  slug: "contact-us",
  label: "Contact Us",
  access: { read: () => true, update: authenticated },
  admin: { group: "Content" },
  versions: { drafts: true },
  hooks: revalidateHooks("contact-us"),
  fields: [
    { name: "Header", type: "array", fields: headerSectionFields() },
    { name: "ContactMethods", type: "array", fields: contactGridFields() },
    { name: "FormIntro", type: "array", fields: ctaFields() }
  ]
};

// src/payload/fields/faq.ts
var faqQuestionFields = () => [
  { name: "Title", type: "text", required: true },
  { name: "Text", type: "textarea", required: true }
];
var faqSectionFields = () => [
  { name: "Title", type: "text", required: true },
  {
    name: "Question",
    type: "array",
    fields: faqQuestionFields()
  },
  { name: "Bookmark", type: "text", required: true }
];

// src/payload/globals/Faq.ts
var Faq = {
  slug: "faq",
  label: "FAQ",
  access: { read: () => true, update: authenticated },
  admin: { group: "Content" },
  versions: { drafts: true },
  hooks: revalidateHooks("faq"),
  fields: [
    { name: "FAQSection", type: "array", fields: faqSectionFields() }
  ]
};

// src/payload/fields/hero-banner.ts
var heroBannerFields = () => [
  { name: "Headline", type: "text", required: true },
  { name: "Text", type: "textarea" },
  namedGroup("CTA", ctaFields()),
  {
    name: "Image",
    type: "upload",
    relationTo: "media",
    hasMany: true
  }
];

// src/payload/fields/hero-slides.ts
var heroSlidesField = () => ({
  name: "Slides",
  type: "array",
  admin: {
    description: "One row per hero image, each with its own headline and button. Leave empty to fall back to the single headline above with every image."
  },
  fields: [
    {
      name: "Image",
      type: "upload",
      relationTo: "media",
      required: true
    },
    {
      name: "Headline",
      type: "text",
      required: true
    },
    {
      name: "Text",
      type: "textarea"
    },
    ...ctaFields()
  ]
});
var heroSlidesFields = () => [heroSlidesField()];

// src/payload/globals/Homepage.ts
var Homepage = {
  slug: "homepage",
  label: "Homepage",
  access: { read: () => true, update: authenticated },
  admin: { group: "Content" },
  versions: false,
  hooks: revalidateHooks("homepage"),
  fields: [
    namedGroup("HeroBanner", [...heroBannerFields(), ...heroSlidesFields()]),
    namedGroup("MidBanner", heroBannerFields())
  ]
};

// src/payload/globals/PrivacyPolicy.ts
var PrivacyPolicy = {
  slug: "privacy-policy",
  label: "Privacy Policy",
  access: { read: () => true, update: authenticated },
  admin: { group: "Content" },
  versions: { drafts: true },
  hooks: revalidateHooks("privacy-policy"),
  fields: [{ name: "PageContent", type: "richText" }]
};

// src/payload/globals/TermsAndCondition.ts
var TermsAndCondition = {
  slug: "terms-and-condition",
  label: "Terms & Conditions",
  access: { read: () => true, update: authenticated },
  admin: { group: "Content" },
  versions: { drafts: true },
  hooks: revalidateHooks("terms-and-condition"),
  fields: [{ name: "PageContent", type: "richText" }]
};

// src/payload/storage.ts
import { s3Storage } from "@payloadcms/storage-s3";
var bucket = process.env.S3_BUCKET;
var accessKeyId = process.env.S3_ACCESS_KEY_ID;
var secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
var region = process.env.S3_REGION;
var isObjectStorageEnabled = Boolean(
  bucket && accessKeyId && secretAccessKey && region
);
if (bucket && !region) {
  console.warn(
    "[storage] S3_BUCKET is set but S3_REGION is not. Object storage is disabled and uploads will fall back to the local disk. Set S3_REGION (for Backblaze B2 this looks like eu-central-003)."
  );
}
if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  const required = ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
  const optional = ["S3_ENDPOINT", "S3_FORCE_PATH_STYLE"];
  const present = required.filter((k) => Boolean(process.env[k]));
  const missing = required.filter((k) => !process.env[k]);
  const optionalState = optional.map((k) => `${k}=${process.env[k] ? "set" : "unset"}`).join(" ");
  console.log(
    `[storage] S3 config -> enabled=${isObjectStorageEnabled} present=[${present.join(",") || "none"}] missing=[${missing.join(",") || "none"}] ${optionalState}`
  );
}
var mediaStorage = s3Storage({
  enabled: isObjectStorageEnabled,
  bucket: bucket ?? "disabled",
  collections: {
    media: {
      /**
       * Signed downloads are required, not optional.
       *
       * The S3 adapter builds URLs from the S3 API endpoint
       * (s3.<region>.backblazeb2.com). Backblaze authenticates *every* request
       * to that endpoint, including for buckets set to Public — public read
       * only works through the separate CDN URLs (f2.dev / f00X.backblazeb2.com
       * /file/<bucket>/...), which this adapter does not generate. Setting
       * signedDownloads to false would therefore 403 every image regardless of
       * the bucket's visibility setting.
       *
       * Signing sidesteps that entirely and keeps the bucket private, which is
       * the safer default for a bucket holding unpublished catalogue imagery.
       *
       * URLs expire, but Next.js' image optimizer fetches each file once and
       * serves the optimized result from its own cache, so expiry only matters
       * on a cache miss.
       */
      signedDownloads: true
    }
  },
  config: {
    region,
    // R2 and other S3-compatible providers require an explicit endpoint.
    ...process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {},
    ...process.env.S3_FORCE_PATH_STYLE === "1" ? { forcePathStyle: true } : {},
    credentials: {
      accessKeyId: accessKeyId ?? "",
      secretAccessKey: secretAccessKey ?? ""
    }
  },
  /**
   * Upload from the browser straight to the bucket.
   *
   * Without this, every file passes through the Next.js server and is subject
   * to Vercel's request body limit, which will reject larger product imagery.
   * It requires the bucket to allow CORS `PUT` from your site origin:
   *
   *   AllowedMethods: [PUT, GET, HEAD]
   *   AllowedOrigins: [https://wisled.ma]
   */
  clientUploads: true
});

// src/payload.config.ts
var dirname = path2.dirname(fileURLToPath(import.meta.url));
var resolveServerURL = () => {
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[payload] NEXT_PUBLIC_SERVER_URL is not set. The admin panel will not be able to reach the API. Set it to the public origin, e.g. https://www.wisled.ma"
    );
    return "";
  }
  return "http://localhost:8000";
};
var payload_config_default = buildConfig({
  // Must match the mounted route group `src/app/(payload)/payload-admin`.
  // These live at the TOP level of the config, not under `admin.routes`:
  // `config.routes` is built only from `config.routes` (payload defaults.js),
  // so an `admin.routes.admin` value is silently ignored. Left at the default
  // `/admin`, every sidebar link, redirect and the post-login callback point at
  // a path that does not exist (404) and the panel is unusable.
  routes: {
    admin: "/payload-admin",
    api: "/api"
  },
  /**
   * The admin panel is useless without this.
   *
   * Payload's own default is a bare `serverURL: ''` (payload defaults.js) and,
   * unlike several third-party starters, core Payload does NOT fall back to
   * NEXT_PUBLIC_SERVER_URL. With it empty the server-rendered shell still
   * returns 200 and the title resolves, but the client bundle has no API origin
   * to talk to, fails to mount, and the browser shows a blank page. The 200 is
   * genuinely misleading here: assets all load and the DOM is well formed.
   *
   * It must be the same origin the browser actually uses, including the `www`
   * host, because the admin calls the API relative to it. Must NOT carry a
   * trailing slash.
   */
  serverURL: resolveServerURL(),
  admin: {
    user: "users",
    importMap: { baseDir: path2.resolve(dirname) },
    meta: {
      titleSuffix: "\u2014 WISLED CMS"
    }
  },
  editor: lexicalEditor(),
  // Sends Media uploads to S3/R2 when the S3_* variables are present, so files
  // survive a Vercel redeploy. Inactive locally — see src/payload/storage.ts.
  plugins: [mediaStorage],
  collections: [
    Users,
    Media,
    Collections,
    Categories,
    Blogs,
    BlogPostCategories,
    Inspirations,
    ProductVariantColors,
    AboutUs
  ],
  globals: [
    Homepage,
    ContactUs,
    Faq,
    PrivacyPolicy,
    TermsAndCondition
  ],
  db: postgresAdapter({
    pool: {
      /**
       * The Neon Vercel integration injects DATABASE_URL / DATABASE_URL_UNPOOLED,
       * not PAYLOAD_DATABASE_URI, so accept both and let an explicit Payload
       * variable win.
       *
       * The *unpooled* (direct) connection is preferred: it bypasses PgBouncer,
       * which Payload's postgres adapter does not work reliably with.
       */
      connectionString: process.env.PAYLOAD_DATABASE_URI ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
    },
    // Dev-only convenience that syncs the schema straight from the config.
    // Off by default because it is NOT idempotent (drizzle-kit's dev push
    // re-issues DDL that can collide with constraints it just created) and
    // because production must use versioned migrations instead.
    // Set PAYLOAD_PUSH_SCHEMA=1 for a throwaway local database only.
    push: process.env.PAYLOAD_PUSH_SCHEMA === "1"
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET
});
export {
  payload_config_default as default
};
