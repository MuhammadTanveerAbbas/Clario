import { createClient } from '@/lib/supabase/server'

const sessionCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000

export async function getSessionUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Session error:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Failed to get session user:', error)
    return null
  }
}

/**
 * Returns the authenticated user using a short-lived
 * in-memory cache to avoid redundant Supabase round-trips on hot paths.
 * The session cache is keyed by the session cookie or user id.
 */
export async function validateSession(cacheKey?: string) {
  if (!cacheKey) return null
  
  const cached = sessionCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user
  }
  
  const user = await getSessionUser()
  if (user && cacheKey) {
    sessionCache.set(cacheKey, { user, timestamp: Date.now() })
  }
  
  return user
}

export function clearSessionCache(cacheKey?: string) {
  if (cacheKey) {
    sessionCache.delete(cacheKey)
  } else {
    sessionCache.clear()
  }
}

// Evict stale cache entries on the same interval as TTL
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      sessionCache.delete(key)
    }
  }
}, CACHE_TTL)
