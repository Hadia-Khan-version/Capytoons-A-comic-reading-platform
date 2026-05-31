import { useState }     from 'react'
import { useNavigate }  from 'react-router-dom'
import { Bookmark }     from 'lucide-react'
import { toggleBookmark } from '../../services/bookmark.service'
import useAuthStore       from '../../store/authStore'

const BookmarkButton = ({
  comicId,
  initialState = false,
  size = 'md',
}) => {
  const [bookmarked, setBookmarked] = useState(initialState)
  const [loading,    setLoading]    = useState(false)
  const isAuth   = useAuthStore((s) => s.isAuthenticated())
  const navigate = useNavigate()

  const sizeMap = {
    sm: 'px-3 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  const handleClick = async () => {
    if (!isAuth) {
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      const result = await toggleBookmark(comicId)
      setBookmarked(result.bookmarked)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center rounded-xl font-semibold
                  border transition-all duration-200
                  disabled:opacity-60 ${sizeMap[size]}
                  ${bookmarked
                    ? 'bg-accent-purple/20 border-accent-purple text-accent-purple hover:bg-accent-purple/30'
                    : 'bg-bg-tertiary border-border text-text-secondary hover:border-accent-purple hover:text-accent-purple'
                  }`}
    >
      <Bookmark
        size={size === 'lg' ? 18 : 15}
        className={bookmarked ? 'fill-accent-purple' : ''}
      />
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  )
}

export default BookmarkButton