'use client'

import React, { useEffect, useRef, useState } from 'react'

interface LazyMountProps {
  children: React.ReactNode
  /** Reserved height while the section is not loaded yet (prevents the page from jumping) */
  minHeight?: number
  /** How early to start loading before the section scrolls into view */
  rootMargin?: string
}

/**
 * Renders its children only when they are about to scroll into view.
 * Sections far down the homepage then don't fetch data or render on first load,
 * so the top of the page (header, banners, first products) appears much faster.
 */
export default function LazyMount({ children, minHeight = 200, rootMargin = '600px 0px' }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [show, rootMargin])

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  )
}