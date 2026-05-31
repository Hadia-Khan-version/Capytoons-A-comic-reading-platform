import { useEffect } from 'react'

const useKeyboardNav = ({ onPrev, onNext, onToggleControls }) => {
  useEffect(() => {
    const handler = (e) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          onPrev?.()
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          onNext?.()
          break
        case ' ':
          e.preventDefault()
          onToggleControls?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPrev, onNext, onToggleControls])
}

export default useKeyboardNav