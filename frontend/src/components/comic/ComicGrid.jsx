import ComicCard        from './ComicCard'
import SkeletonCard     from '../common/SkeletonCard'

const ComicGrid = ({ comics = [], loading = false, skeletonCount = 12 }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                      lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                    lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {comics.map((comic) => (
        <ComicCard key={comic.ComicID} comic={comic} />
      ))}
    </div>
  )
}

export default ComicGrid