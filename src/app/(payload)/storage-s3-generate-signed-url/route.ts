import config from '@payload-config'
import { REST_POST } from '@payloadcms/next/routes'

/**
 * Required by `clientUploads: true` in src/payload/storage.ts.
 *
 * The S3 plugin registers a POST endpoint at this exact path
 * (`serverHandlerPath: '/storage-s3-generate-signed-url'`, see
 * plugin-cloud-storage/dist/utilities/initClientUploads.js) which mints the
 * presigned PUT the browser uses to send a file straight to the bucket.
 *
 * Payload registers that endpoint on its own router, but this app only wires
 * `/api/[...slug]` to the REST handlers, so nothing exposed the endpoint over
 * HTTP. The request fell through to the Next.js 404 page and every admin upload
 * failed, even though the handler itself was working.
 *
 * Without this route the admin cannot create media at all: the browser asks for
 * a signed URL, gets HTML back instead of JSON, and the upload never starts.
 *
 * The bucket must also allow CORS `PUT` from the site origin, otherwise the
 * browser blocks the upload even with a valid presigned URL.
 */
export const POST = REST_POST(config)
