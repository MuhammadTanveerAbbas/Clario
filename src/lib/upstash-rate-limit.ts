import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit as checkInProcessRateLimit } from '@/middleware/rate-limit'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function getRatelimit(type: 'auth' | 'api'): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null
  const max = type === 'auth'
    ? parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? '5', 10)
    : parseInt(process.env.RATE_LIMIT_API_MAX ?? '100', 10)
  const window = type === 'auth'
    ? parseInt(process.env.RATE_LIMIT_AUTH_WINDOW ?? '900', 10)
    : parseInt(process.env.RATE_LIMIT_API_WINDOW ?? '60', 10)
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${window} s`),
    analytics: true,
    prefix: `ratelimit:${type}`,
  })
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  )
}

export async function checkRateLimit(
  request: NextRequest,
  type: 'auth' | 'api'
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const ratelimit = getRatelimit(type)

  if (!ratelimit) {
    return checkInProcessRateLimit(request, type)
  }

  const ip = getClientIp(request)
  const { success, reset } = await ratelimit.limit(ip)

  if (!success) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(type === 'auth' ? 5 : 100),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
          },
        }
      ),
    }
  }

  return { allowed: true }
}
