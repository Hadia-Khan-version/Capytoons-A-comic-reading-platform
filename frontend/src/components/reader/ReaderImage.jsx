import { useState, useRef, useEffect } from 'react'
import { motion }                      from 'framer-motion'

const ReaderImage = ({ page, fitWidth = true }) => {
  const [loaded,   setLoaded]   = useState(false)
  const [error,    setError]    = useState(false)
  const [visible,  setVisible]  = useState(false)
  const imgRef  = useRef(null)
  const wrapRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' } // preload 400px before entering viewport
    )
    if (wrapRef.current) observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto
                  ${fitWidth ? 'w-full max-w-3xl' : 'w-auto'}`}
    >
      {/* Skeleton while loading */}
      {!loaded && !error && (
        <div
          className="w-full bg-bg-tertiary animate-pulse"
          style={{ aspectRatio: '2/3', minHeight: '400px' }}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div
          className="w-full bg-bg-tertiary flex items-center
                     justify-center text-text-muted text-sm"
          style={{ minHeight: '200px' }}
        >
          Failed to load page {page.PageNumber}
        </div>
      )}

      {/* Actual image — only rendered when visible */}
      {visible && (
        <motion.img
  src={page.ImageURL}
  alt={`Page ${page.PageNumber}`}
  initial={{ opacity: 0 }}
  animate={{ opacity: loaded ? 1 : 0 }}
  transition={{ duration: 0.3 }}
  onLoad={() => setLoaded(true)}
  onError={() => { setError(true); setLoaded(true) }}
  className={`w-full h-auto block select-none
              ${loaded ? 'block' : 'absolute opacity-0'}`}
  draggable={false}
  referrerPolicy="no-referrer"
  crossOrigin="anonymous"
/>
      )}

      {/* Page number indicator */}
      {loaded && !error && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white/60
                        text-xs px-2 py-0.5 rounded-full font-mono">
          {page.PageNumber}
        </div>
      )}
    </div>
  )
}

export default ReaderImage