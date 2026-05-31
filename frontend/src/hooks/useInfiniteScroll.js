import { useEffect, useRef } from 'react'

const useInfiniteScroll = (callback, hasMore, loading) => {
  const observerRef = useRef(null)

  useEffect(() => {
    if (loading || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callback()
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) observer.observe(observerRef.current)

    return () => observer.disconnect()
  }, [callback, hasMore, loading])

  return observerRef
}

export default useInfiniteScroll