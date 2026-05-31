const SkeletonCard = () => (
  <div className="animate-pulse">
    {/* Cover skeleton */}
    <div className="aspect-[2/3] rounded-card bg-bg-tertiary" />
    {/* Title skeleton */}
    <div className="mt-2.5 space-y-2">
      <div className="h-3 bg-bg-tertiary rounded-full w-full" />
      <div className="h-3 bg-bg-tertiary rounded-full w-2/3" />
    </div>
    {/* Badge skeleton */}
    <div className="mt-2 h-3 bg-bg-tertiary rounded-full w-1/3" />
  </div>
)

export default SkeletonCard