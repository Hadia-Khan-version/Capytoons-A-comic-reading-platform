import { Link }   from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => (
  <div className="min-h-screen bg-bg-primary flex items-center
                  justify-center text-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6"
    >
      <h1 className="text-[120px] font-display leading-none gradient-text">
        404
      </h1>
      <p className="text-text-secondary text-lg max-w-md">
        This page got lost in the multiverse. The comic you're looking for
        doesn't exist or was moved.
      </p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </motion.div>
  </div>
)

export default NotFound