import { useState, useEffect }  from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Loader2 }  from 'lucide-react'
import { getReviews, addReview } from '../../services/review.service'
import useAuthStore              from '../../store/authStore'

// Single review card
const ReviewCard = ({ review }) => {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })

  return (
    <div className="card p-4 flex gap-3">
      <img
        src={review.AvatarURL}
        alt={review.Username}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0
                   border-2 border-border"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-text-primary font-medium text-sm">
            {review.Username}
          </span>
          <span className="text-text-muted text-xs">
            {formatDate(review.ReviewDate)}
          </span>
        </div>
        {/* Stars */}
        <div className="flex items-center gap-1.5 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.round((review.Rating / 10) * 5)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-bg-tertiary'
              }
            />
          ))}
          <span className="text-text-muted text-xs ml-1">
            {review.Rating}/10
          </span>
        </div>
        {review.ReviewText && (
          <p className="text-text-secondary text-sm mt-2 leading-relaxed">
            {review.ReviewText}
          </p>
        )}
      </div>
    </div>
  )
}

// Star picker for review form
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0)
  const displayed = hovered || Math.round((value / 10) * 5)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(((i + 1) / 5) * 10)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={24}
            className={`transition-colors duration-100
              ${i < displayed
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-bg-tertiary hover:text-yellow-300'
              }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-text-muted text-sm ml-2">
          {value.toFixed(1)} / 10
        </span>
      )}
    </div>
  )
}

const ReviewSection = ({ comicId }) => {
  const [reviews,  setReviews]  = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [hasMore,  setHasMore]  = useState(false)

  // Form state
  const [rating,      setRating]      = useState(0)
  const [reviewText,  setReviewText]  = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted,   setSubmitted]   = useState(false)

  const isAuth = useAuthStore((s) => s.isAuthenticated())

  const fetchReviews = async (p = 1, append = false) => {
    setLoading(true)
    try {
      const result = await getReviews(comicId, { page: p, limit: 5 })
      setReviews((prev) =>
        append ? [...prev, ...result.data] : result.data
      )
      setTotal(result.pagination.total)
      setHasMore(result.pagination.hasMore)
      setPage(p)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(1)
  }, [comicId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setSubmitError('Please select a rating')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const newReview = await addReview(comicId, { rating, reviewText })
      setReviews((prev) => [newReview, ...prev])
      setTotal((t) => t + 1)
      setRating(0)
      setReviewText('')
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to submit review'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Write review form ── */}
      {isAuth && !submitted && (
        <div className="card p-5">
          <h4 className="text-text-primary font-semibold mb-4">
            Write a Review
          </h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-text-muted text-xs uppercase
                                tracking-wider block mb-2">
                Your Rating
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase
                                tracking-wider block mb-2">
                Review (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this comic..."
                rows={3}
                maxLength={2000}
                className="input resize-none"
              />
              <div className="text-right text-xs text-text-muted mt-1">
                {reviewText.length}/2000
              </div>
            </div>
            {submitError && (
              <p className="text-red-400 text-sm">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary self-end flex items-center gap-2"
            >
              {submitting
                ? <Loader2 size={15} className="animate-spin" />
                : <Send size={15} />
              }
              Submit Review
            </button>
          </form>
        </div>
      )}

      {submitted && (
        <div className="card p-4 border-green-500/30 bg-green-500/5">
          <p className="text-green-400 text-sm text-center">
            ✓ Review submitted successfully!
          </p>
        </div>
      )}

      {/* ── Reviews list ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-text-primary font-semibold">
            Reviews
            {total > 0 && (
              <span className="text-text-muted font-normal ml-2 text-sm">
                ({total})
              </span>
            )}
          </h4>
        </div>

        {loading && reviews.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <AnimatePresence>
            {reviews.map((review, i) => (
              <motion.div
                key={review.ReviewID}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: i * 0.05 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {hasMore && (
          <button
            onClick={() => fetchReviews(page + 1, true)}
            disabled={loading}
            className="btn-secondary text-sm self-center mt-2
                       flex items-center gap-2"
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : 'Load more reviews'
            }
          </button>
        )}
      </div>
    </div>
  )
}

export default ReviewSection