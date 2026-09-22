import test from 'node:test'
import assert from 'node:assert/strict'

import { getMedusaBackendUrl } from './medusa-env'

test('production falls back to the deployed Render URL when localhost is configured', () => {
  const url = getMedusaBackendUrl({
    NODE_ENV: 'production',
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'http://localhost:9000',
  })

  assert.equal(url, 'https://wisled-medusa-back-end-1.onrender.com')
})

test('explicit deploy URL is preserved', () => {
  const url = getMedusaBackendUrl({
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'https://wisled-medusa-back-end-1.onrender.com',
  })

  assert.equal(url, 'https://wisled-medusa-back-end-1.onrender.com')
})
