type RateLimitEntry = {
  count: number
  expiresAt: number
}

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5

const store = new Map<string, RateLimitEntry>()

export function checkRateLimit(key: string) {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count += 1
  store.set(key, entry)

  return { allowed: true, remaining: MAX_REQUESTS - entry.count }
}


