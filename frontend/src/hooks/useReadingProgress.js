import { useEffect, useRef, useCallback } from 'react'
import { saveProgress } from '../services/history.service'
import useAuthStore     from '../store/authStore'

const useReadingProgress = (comicId, chapterId) => {
  const isAuth   = useAuthStore((s) => s.isAuthenticated())
  const savedRef = useRef(false)
  const timerRef = useRef(null)

  const save = useCallback(async () => {
    if (!isAuth || !comicId || !chapterId || savedRef.current) return
    try {
      await saveProgress(comicId, chapterId)
      savedRef.current = true
    } catch {
      // silently fail
    }
  }, [isAuth, comicId, chapterId])

  // Save after 10 seconds of reading
  useEffect(() => {
    savedRef.current = false
    timerRef.current = setTimeout(save, 10000)
    return () => clearTimeout(timerRef.current)
  }, [comicId, chapterId, save])

  // Also save when user leaves the page
  useEffect(() => {
    const handleUnload = () => save()
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [save])

  // Manual save trigger
  return { saveNow: save }
}

export default useReadingProgress