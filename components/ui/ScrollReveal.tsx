'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    // Small delay so Next.js finishes rendering the new page DOM
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
      )

      document.querySelectorAll('[data-reveal]').forEach((el) => {
        // Reset so elements that re-entered viewport animate again
        el.classList.remove('reveal-visible')
        observer.observe(el)
      })

      return () => observer.disconnect()
    }, 60)

    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}
