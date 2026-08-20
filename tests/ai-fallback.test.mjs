import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_MODEL,
  FALLBACK_MODELS,
  MODELS_CACHE_TTL_MS,
  RATE_LIMIT_MAX_RETRIES,
  TRANSIENT_MAX_RETRIES,
  calculateRetryDelayMs,
  createReliableClient,
  isConnectionError,
  isModelUnavailableError,
  isRateLimitError,
  isServerError,
  parseRetryAfterMs,
} from '../src/lib/ai-fallback.ts'

const FAST = {
  modelsCacheTtlMs: 60 * 1000,
  rateLimitMaxRetries: RATE_LIMIT_MAX_RETRIES,
  rateLimitBaseDelayMs: 5,
  rateLimitMaxDelayMs: 20,
  transientMaxRetries: TRANSIENT_MAX_RETRIES,
}

function headers(init = {}) {
  return { get: (name) => init[name] ?? null }
}

function modelData(ids) {
  return { data: ids.map((id) => ({ id, object: 'model', created: 0, owned_by: 'test' })) }
}

/**
 * Builds a fake Groq client. `handler` receives { params, calls, models } and
 * returns either a completion response or throws. `models` is a mutable array
 * the handler may modify to simulate model deprecation between requests.
 */
function makeMockClient({ models, handler, listError }) {
  const calls = { create: [], list: 0 }
  const state = { models: [...models] }
  return {
    calls,
    state,
    models: {
      list: async () => {
        calls.list += 1
        if (listError) throw listError
        return modelData(state.models)
      },
    },
    chat: {
      completions: {
        create: async (params) => {
          calls.create.push(params)
          return handler({ params, calls, models: state })
        },
      },
    },
  }
}

function okResponse(content = 'ok') {
  return { choices: [{ message: { content } }] }
}

// ─── Model discovery & selection ───────────────────────────────────────────

test('uses the preferred model when it is available', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: ({ params }) => {
      assert.equal(params.model, DEFAULT_MODEL)
      return okResponse('hello')
    },
  })
  const client = createReliableClient(mock, FAST)
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'hello')
  assert.equal(mock.calls.list, 1)
})

test('model list is cached within the TTL (fetched once for repeated calls)', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => okResponse(),
  })
  const client = createReliableClient(mock, { ...FAST, modelsCacheTtlMs: MODELS_CACHE_TTL_MS })
  await client.completion('a', 'system')
  await client.completion('b', 'system')
  await client.completion('c', 'system')
  assert.equal(mock.calls.list, 1)
})

test('model list is refreshed after the TTL expires', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => okResponse(),
  })
  const client = createReliableClient(mock, { ...FAST, modelsCacheTtlMs: 30 })
  await client.completion('a', 'system')
  await new Promise((r) => setTimeout(r, 45))
  await client.completion('b', 'system')
  assert.equal(mock.calls.list, 2)
})

test('selects a compatible fallback when the preferred model is not in the list', async () => {
  const mock = makeMockClient({
    models: ['llama-3.1-8b-instant'],
    handler: ({ params }) => {
      assert.equal(params.model, 'llama-3.1-8b-instant')
      return okResponse()
    },
  })
  const client = createReliableClient(mock, FAST)
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'ok')
})

test('does not fail when the model list cannot be fetched (falls back to preferred)', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    listError: new Error('network down'),
    handler: ({ params }) => {
      assert.equal(params.model, DEFAULT_MODEL)
      return okResponse()
    },
  })
  const client = createReliableClient(mock, FAST)
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'ok')
})

test('avoids hammering the model endpoint when discovery keeps failing', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    listError: new Error('network down'),
    handler: () => okResponse(),
  })
  const client = createReliableClient(mock, { ...FAST, modelsCacheTtlMs: 60 * 60 * 1000 })
  await client.completion('a', 'system')
  await client.completion('b', 'system')
  await client.completion('c', 'system')
  assert.equal(mock.calls.list, 1)
})

// ─── Model fallback on unavailable model ───────────────────────────────────

test('refreshes the model list and retries on a fallback when the model is unavailable', async () => {
  const mock = makeMockClient({
    models: [DEFAULT_MODEL, 'llama-3.1-8b-instant'],
    handler: ({ params, models }) => {
      if (params.model === DEFAULT_MODEL) {
        // Simulate the model being removed between requests.
        models.models = models.models.filter((m) => m !== DEFAULT_MODEL)
        throw { status: 404, message: `The model ${DEFAULT_MODEL} does not exist` }
      }
      assert.equal(params.model, 'llama-3.1-8b-instant')
      return okResponse('fallback ok')
    },
  })
  const client = createReliableClient(mock, FAST)
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'fallback ok')
  // initial discovery + forced refresh after the model error
  assert.equal(mock.calls.list, 2)
  // first attempt (preferred, failed) + one retry (fallback)
  assert.equal(mock.calls.create.length, 2)
})

test('throws a controlled error when the model is unavailable and no fallback exists', async () => {
  const mock = makeMockClient({
    models: [DEFAULT_MODEL],
    handler: ({ params, models }) => {
      models.models = models.models.filter((m) => m !== DEFAULT_MODEL)
      throw { status: 404, message: `The model ${DEFAULT_MODEL} does not exist` }
    },
  })
  const client = createReliableClient(mock, FAST)
  await assert.rejects(
    () => client.completion('prompt', 'system'),
    /no compatible fallback model is available/
  )
  assert.equal(mock.calls.create.length, 1)
})

// ─── Rate limits ───────────────────────────────────────────────────────────

test('respects Retry-After and recovers from a 429', async () => {
  let attempts = 0
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      attempts += 1
      if (attempts === 1) {
        throw { status: 429, headers: headers({ 'retry-after': '1' }) }
      }
      return okResponse('recovered')
    },
  })
  const client = createReliableClient(mock, { ...FAST, rateLimitMaxDelayMs: 10 })
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'recovered')
  assert.equal(mock.calls.create.length, 2)
})

test('uses bounded exponential backoff with jitter for 429 without Retry-After', async () => {
  let attempts = 0
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      attempts += 1
      if (attempts <= 2) throw { status: 429 }
      return okResponse('recovered')
    },
  })
  const client = createReliableClient(mock, FAST)
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'recovered')
  assert.equal(mock.calls.create.length, 3)
})

test('stops retrying 429 after the maximum retry limit', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      throw { status: 429 }
    },
  })
  const client = createReliableClient(mock, { ...FAST, rateLimitMaxRetries: 2 })
  await assert.rejects(() => client.completion('prompt', 'system'), /rate limit/i)
  // 1 initial + 2 retries, then stops
  assert.equal(mock.calls.create.length, 3)
})

// ─── Transient failures ────────────────────────────────────────────────────

test('retries a 5xx response and succeeds on a later attempt', async () => {
  let attempts = 0
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      attempts += 1
      if (attempts === 1) throw { status: 503 }
      return okResponse('after 503')
    },
  })
  const client = createReliableClient(mock, FAST)
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'after 503')
  assert.equal(mock.calls.create.length, 2)
})

test('fails gracefully and in a bounded way after persistent 5xx errors', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      throw { status: 500 }
    },
  })
  const client = createReliableClient(mock, { ...FAST, transientMaxRetries: 2 })
  await assert.rejects(
    () => client.completion('prompt', 'system'),
    /AI service temporarily unavailable/
  )
  // 1 initial + 2 retries
  assert.equal(mock.calls.create.length, 3)
})

test('retries connection/timeout errors and recovers', async () => {
  let attempts = 0
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      attempts += 1
      if (attempts === 1) {
        const err = new Error('Connection error.')
        err.name = 'APIConnectionError'
        throw err
      }
      return okResponse('reconnected')
    },
  })
  const client = createReliableClient(mock, FAST)
  const result = await client.completion('prompt', 'system')
  assert.equal(result, 'reconnected')
})

test('fails gracefully after connection errors are exhausted', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      const err = new Error('fetch failed')
      err.name = 'APIConnectionError'
      throw err
    },
  })
  const client = createReliableClient(mock, { ...FAST, transientMaxRetries: 1 })
  await assert.rejects(
    () => client.completion('prompt', 'system'),
    /AI service temporarily unavailable/
  )
})

// ─── Controlled failure behavior ───────────────────────────────────────────

test('surfaces 401 immediately with a controlled message (no retries)', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      throw { status: 401 }
    },
  })
  const client = createReliableClient(mock, FAST)
  await assert.rejects(
    () => client.completion('prompt', 'system'),
    /Invalid Groq API key/
  )
  assert.equal(mock.calls.create.length, 1)
})

test('throws a controlled error on an empty provider response', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => ({ choices: [] }),
  })
  const client = createReliableClient(mock, FAST)
  await assert.rejects(() => client.completion('prompt', 'system'), /Empty response/)
})

test('redacts the api key from surfaced provider error messages', async () => {
  const mock = makeMockClient({
    models: [...FALLBACK_MODELS],
    handler: () => {
      throw new Error('request failed: sk-secret-test-key')
    },
  })
  const client = createReliableClient(mock, { ...FAST, apiKey: 'sk-secret-test-key' })
  await assert.rejects(
    () => client.completion('prompt', 'system'),
    (err) => {
      assert.match(err.message, /request failed/)
      assert.ok(!err.message.includes('sk-secret-test-key'))
      return true
    }
  )
})

// ─── Pure helpers ──────────────────────────────────────────────────────────

test('isRateLimitError detects 429', () => {
  assert.equal(isRateLimitError({ status: 429 }), true)
  assert.equal(isRateLimitError({ status: 500 }), false)
  assert.equal(isRateLimitError(new Error('nope')), false)
})

test('isServerError detects 5xx only', () => {
  assert.equal(isServerError({ status: 500 }), true)
  assert.equal(isServerError({ status: 503 }), true)
  assert.equal(isServerError({ status: 404 }), false)
})

test('isConnectionError detects SDK connection errors', () => {
  const err = new Error('Connection error.')
  err.name = 'APIConnectionTimeoutError'
  assert.equal(isConnectionError(err), true)
  assert.equal(isConnectionError({ status: 500 }), false)
})

test('isModelUnavailableError detects missing/deprecated model errors', () => {
  assert.equal(isModelUnavailableError({ status: 404 }), true)
  assert.equal(
    isModelUnavailableError({ message: 'The model llama-3.3-70b-versatile does not exist' }),
    true
  )
  assert.equal(isModelUnavailableError({ message: 'bad request' }), false)
})

test('parseRetryAfterMs respects Retry-After in seconds and ms', () => {
  assert.equal(parseRetryAfterMs({ headers: headers({ 'retry-after': '5' }) }), 5000)
  assert.equal(parseRetryAfterMs({ headers: headers({ 'retry-after-ms': '250' }) }), 250)
  assert.equal(parseRetryAfterMs({ headers: headers({ 'retry-after-ms': '999999' }) }), 15000)
  assert.equal(parseRetryAfterMs({}), null)
  assert.equal(parseRetryAfterMs(null), null)
})

test('calculateRetryDelayMs is bounded and grows with attempts', () => {
  const first = calculateRetryDelayMs(0, 1000, 15000)
  const second = calculateRetryDelayMs(1, 1000, 15000)
  const capped = calculateRetryDelayMs(10, 1000, 15000)
  assert.ok(first >= 500 && first <= 1000)
  assert.ok(second >= 1000 && second <= 2000)
  assert.ok(capped <= 15000)
  assert.ok(capped >= 7500)
})