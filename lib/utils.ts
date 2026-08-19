import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStableBaseUrl() {
  // Always prioritize the configured public domain (e.g. https://q-aris.vercel.app)
  // so QR codes scanned by physical phones can always connect.
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin
  }

  return 'https://q-aris.vercel.app'
}

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
