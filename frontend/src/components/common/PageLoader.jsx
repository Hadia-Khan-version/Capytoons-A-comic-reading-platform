import { motion } from 'framer-motion'

const PageLoader = () => {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br
                     from-accent-purple to-accent-pink
                     flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-white font-display text-2xl">C</span>
        </motion.div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-purple to-accent-pink rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <p className="text-text-muted text-sm font-mono tracking-widest uppercase">
          Loading
        </p>
      </div>
    </div>
  )
}

export default PageLoader