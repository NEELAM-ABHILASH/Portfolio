import { useEffect, useRef, useState } from 'react'

const OBS_OPTIONS: IntersectionObserverInit = {
  root: null,
  threshold: 0.12,
  rootMargin: '0px 0px -8% 0px',
}

export function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    }, OBS_OPTIONS)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}
