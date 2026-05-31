import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const SectionHeader = ({ title, viewAllLink, viewAllLabel = 'View All' }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="section-title">{title}</h2>
    {viewAllLink && (
      <Link
        to={viewAllLink}
        className="flex items-center gap-1.5 text-sm text-accent-purple
                   hover:text-accent-purpleHover transition-colors font-medium"
      >
        {viewAllLabel}
        <ArrowRight size={15} />
      </Link>
    )}
  </div>
)

export default SectionHeader