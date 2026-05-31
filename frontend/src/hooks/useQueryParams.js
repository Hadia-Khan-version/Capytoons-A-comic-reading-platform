import { useSearchParams } from 'react-router-dom'
import { useCallback }     from 'react'

const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = (key, fallback = '') =>
    searchParams.get(key) || fallback

  const setParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value === null || value === undefined) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      // Reset page when filter changes
      if (key !== 'page') next.delete('page')
      return next
    })
  }, [setSearchParams])

  const setParams = useCallback((obj) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(obj)) {
        if (value === '' || value === null || value === undefined) {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      next.delete('page')
      return next
    })
  }, [setSearchParams])

  const clearAll = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  return { getParam, setParam, setParams, clearAll, searchParams }
}

export default useQueryParams