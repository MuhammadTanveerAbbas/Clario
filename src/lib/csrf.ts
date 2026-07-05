import { NextResponse } from 'next/server';

/** Validates Origin/Referer header against the app URL for standard Request objects. */
export function validateRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!origin && !referer) return false

  try {
    const appOrigin = new URL(appUrl).origin
    if (origin && new URL(origin).origin !== appOrigin) return false
    if (referer && new URL(referer).origin !== appOrigin) return false
  } catch {
    return false
  }

  return true
}

/**
 * Wraps an API route handler with CSRF origin validation.
 */
export function csrfGuard<T extends Request>(handler: (req: T, ...args: any[]) => Promise<NextResponse>) {
  return async (req: T, ...args: any[]) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      if (process.env.E2E_TEST_MODE !== '1' && !validateRequestOrigin(req)) {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        )
      }
    }
    return handler(req, ...args)
  }
}
