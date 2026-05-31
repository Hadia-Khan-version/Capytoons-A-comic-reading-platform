import { useState } from 'react'
import { Star }     from 'lucide-react'

const RatingStars = ({
  rating    = 0,
  max       = 10,
  size      = 'md',
  interactive = false,
  onChange,
}) => {
  const [hovered, setHovered] = useState(0)

  const sizes = {
    sm: { star: 12, gap: 'gap-0.5' },
    md: { star: 16, gap: 'gap-1'   },
    lg: { star: 22, gap: 'gap-1.5' },
  }
  const { star, gap } = sizes[size] || sizes.md

  // We display out of 5 stars, scale rating accordingly
  const outOf5    = (rating / max) * 5
  const displayed = interactive ? (hovered || outOf5) : outOf5

  return (
    <div className={`flex items-center ${gap}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled   = i + 1 <= Math.floor(displayed)
        const partial  = !filled && i < displayed
        const value    = ((i + 1) / 5) * max  // map back to 0-10

        return (
          <span
            key={i}
            onClick={() => interactive && onChange?.(value)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={interactive ? 'cursor-pointer' : ''}
          >
            <Star
              size={star}
              className={`transition-colors duration-150
                ${filled || partial
                  ? 'text-yellow-400'
                  : 'text-bg-tertiary'
                }
                ${interactive
                  ? 'hover:text-yellow-300'
                  : ''
                }`}
              fill={filled ? '#FACC15' : partial ? 'url(#half)' : 'transparent'}
            />
          </span>
        )
      })}
    </div>
  )
}

export default RatingStars