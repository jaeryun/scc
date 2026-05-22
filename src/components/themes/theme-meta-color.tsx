'use client'

import { useEffect } from 'react'

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
}

export function ThemeMetaColor() {
  useEffect(() => {
    try {
      if (
        localStorage.theme === 'dark' ||
        ((!('theme' in localStorage) || localStorage.theme === 'system') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute('content', META_THEME_COLORS.dark)
      }
    } catch (_) {}
  }, [])

  return null
}
