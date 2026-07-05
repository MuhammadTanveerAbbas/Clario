import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

function extractTextFromHtml(html: string): { title: string; text: string } {
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = (ogTitleMatch?.[1] || titleMatch?.[1] || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')

  // Remove scripts, styles, nav, footer
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')

  // Prefer article/main content
  const articleMatch = cleaned.match(/<article[\s\S]*?<\/article>/i)
  const mainMatch = cleaned.match(/<main[\s\S]*?<\/main>/i)
  if (articleMatch) cleaned = articleMatch[0]
  else if (mainMatch) cleaned = mainMatch[0]

  const text = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  return { title, text }
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url)
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(req, 'api')
    if (!rateLimitCheck.allowed) return rateLimitCheck.response!

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { url?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const url = body.url?.trim()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    if (isYouTubeUrl(url)) {
      return NextResponse.json({ error: 'Use the YouTube tab for YouTube URLs' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    let html: string
    try {
      const res = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ClarioBot/1.0; +https://clario.ai)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      })
      clearTimeout(timeout)

      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch URL (${res.status})` }, { status: 422 })
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        return NextResponse.json({ error: 'URL must point to a web page with readable text' }, { status: 422 })
      }

      html = await res.text()
    } catch (err: unknown) {
      clearTimeout(timeout)
      const msg = err instanceof Error && err.name === 'AbortError'
        ? 'Request timed out'
        : 'Could not fetch URL'
      return NextResponse.json({ error: msg }, { status: 422 })
    }

    const { title, text } = extractTextFromHtml(html)

    if (text.length < 100) {
      return NextResponse.json({
        error: 'Could not extract enough text from this page. Try pasting the content directly.',
      }, { status: 422 })
    }

    const truncated = text.slice(0, 60000)

    return NextResponse.json({
      title: title || parsed.hostname,
      text: truncated,
      url: parsed.toString(),
      charCount: truncated.length,
      source: 'web',
    })
  } catch (error) {
    console.error('[fetch-url] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch URL content' }, { status: 500 })
  }
}
