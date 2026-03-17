import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('habits-dark-mode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('habits-dark-mode', JSON.stringify(darkMode))
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      const saved = localStorage.getItem('habits-dark-mode')
      if (saved === null) setDarkMode(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return [darkMode, setDarkMode]
}
