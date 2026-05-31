import { motion }    from 'framer-motion'
import { SearchX }   from 'lucide-react'

const EmptyState = ({
  icon: Icon = SearchX,
  title   = 'Nothing found',
  message = 'Try adjusting your filters or search term.',
  action,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0  }}
    className="flex flex-col items-center justify-center
               py-24 text-center px-4"
  >
    <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border
                    flex items-center justify-center mb-4">
      <Icon size={28} className="text-text-muted" />
    </div>
    <h3 className="text-text-primary font-semibold text-lg mb-2">
      {title}
    </h3>
    <p className="text-text-muted text-sm max-w-sm leading-relaxed">
      {message}
    </p>
    {action && (
      <div className="mt-6">{action}</div>
    )}
  </motion.div>
)

export default EmptyState