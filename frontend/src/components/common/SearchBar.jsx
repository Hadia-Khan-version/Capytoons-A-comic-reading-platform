import { useState, useRef, useEffect } from 'react'
import { useNavigate }                 from 'react-router-dom'
import { motion, AnimatePresence }     from 'framer-motion'
import { Search, X, Loader2 }          from 'lucide-react'
import useDebounce                     from '../../hooks/useDebounce'
import useClickOutside                 from '../../hooks/useClickOutside'
import { getSuggestions }              from '../../services/comic.service'

const SearchBar = ({ onClose }) => {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [open,        setOpen]        = useState(false)

  const navigate    = useNavigate()
  const wrapperRef  = useRef(null)
  const inputRef    = useRef(null)
  const debounced   = useDebounce(query, 350)

  useClickOutside(wrapperRef, () => setOpen(false))

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debounced.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await getSuggestions(debounced)
        setSuggestions(data || [])
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [debounced])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`)
    onClose?.()
  }

  const handleSelect = (comic) => {
    setOpen(false)
    setQuery('')
    navigate(`/comic/${comic.ComicID}`)
    onClose?.()
  }

  const clearQuery = () => {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search
            size={16}
            className="absolute left-3.5 text-text-muted pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search comics, manga, manhwa..."
            className="input pl-10 pr-10 text-sm h-10"
            autoComplete="off"
          />
          {/* Clear / Loader icon */}
          <div className="absolute right-3.5">
            {loading ? (
              <Loader2 size={15} className="text-text-muted animate-spin" />
            ) : query ? (
              <button type="button" onClick={clearQuery}>
                <X size={15} className="text-text-muted hover:text-text-primary
                                        transition-colors" />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-bg-secondary
                       border border-border rounded-xl shadow-card
                       overflow-hidden z-50"
          >
            {suggestions.map((comic) => (
              <button
                key={comic.ComicID}
                onClick={() => handleSelect(comic)}
                className="flex items-center gap-3 w-full px-4 py-3
                           hover:bg-bg-tertiary transition-colors text-left"
              >
                {/* Tiny cover */}
                <img
                  src={comic.CoverImageURL}
                  alt={comic.Title}
                  className="w-8 h-11 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">
                    {comic.Title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-accent-purple capitalize">
                      {comic.Type}
                    </span>
                    <span className="text-xs text-text-muted capitalize">
                      {comic.Status}
                    </span>
                  </div>
                </div>
                <Search size={13} className="text-text-muted flex-shrink-0" />
              </button>
            ))}

            {/* View all results */}
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 text-sm text-accent-purple
                         hover:bg-bg-tertiary transition-colors text-center
                         border-t border-border font-medium"
            >
              View all results for "{query}"
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar