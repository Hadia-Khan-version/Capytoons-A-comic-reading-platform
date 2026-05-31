import { Link } from 'react-router-dom'

const GenreTag = ({ genre, active = false }) => (
  <Link
    to={`/browse?genreId=${genre.GenreID}`}
    className={`px-4 py-2 rounded-full text-sm font-medium border
                transition-all duration-200 whitespace-nowrap
                ${active
                  ? 'bg-accent-purple border-accent-purple text-white'
                  : 'bg-bg-secondary border-border text-text-secondary hover:border-accent-purple hover:text-accent-purple'
                }`}
  >
    {genre.GenreName}
    {genre.ComicCount !== undefined && (
      <span className="ml-1.5 text-xs opacity-60">
        {genre.ComicCount}
      </span>
    )}
  </Link>
)

export default GenreTag