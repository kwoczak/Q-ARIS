import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStableBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://q-aris.vercel.app'
  }

  if (window.location.hostname === 'localhost') {
    // Return localhost origin, e.g. http://localhost:3000
    return window.location.origin
  }

// For all other environments (preview, production), use the configured stable URL
  // or fallback to production if not set.
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://q-aris.vercel.app'
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
