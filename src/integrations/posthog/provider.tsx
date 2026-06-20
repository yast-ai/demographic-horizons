import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com'

let initialized = false

export function initPostHog() {
  if (typeof window === 'undefined' || !POSTHOG_KEY || initialized) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
  })
  initialized = true
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (!POSTHOG_KEY || !initialized) return
    posthog.capture('$pageview', { path: pathname })
  }, [pathname])

  return <>{children}</>
}

export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  if (!POSTHOG_KEY || !initialized) return
  posthog.capture(event, properties)
}

export function identifyUser(id: string, traits?: Record<string, string>) {
  if (!POSTHOG_KEY || !initialized) return
  posthog.identify(id, traits)
}

export { posthog }
