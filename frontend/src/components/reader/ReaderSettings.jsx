import { motion, AnimatePresence } from 'framer-motion'
import { X, Monitor, Smartphone }  from 'lucide-react'

const SettingRow = ({ label, children }) => (
  <div className="flex items-center justify-between py-3
                  border-b border-border last:border-0">
    <span className="text-text-secondary text-sm">{label}</span>
    <div>{children}</div>
  </div>
)

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-colors duration-200
                relative flex-shrink-0
                ${value ? 'bg-accent-purple' : 'bg-bg-tertiary border border-border'}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white
                      shadow transition-transform duration-200
                      ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
    />
  </button>
)

const ReaderSettings = ({ open, onClose, settings, onChange }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{    x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-72
                       bg-bg-secondary border-l border-border
                       z-[70] p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-text-primary">
                Reader Settings
              </h3>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary
                           transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Settings */}
            <div>
              <SettingRow label="Fit to Width">
                <Toggle
                  value={settings.fitWidth}
                  onChange={(v) => onChange('fitWidth', v)}
                />
              </SettingRow>

              <SettingRow label="Light Reader">
                <Toggle
                  value={settings.lightMode}
                  onChange={(v) => onChange('lightMode', v)}
                />
              </SettingRow>

              <SettingRow label="Show Page Numbers">
                <Toggle
                  value={settings.showPageNumbers}
                  onChange={(v) => onChange('showPageNumbers', v)}
                />
              </SettingRow>

              <SettingRow label="Gap Between Pages">
                <Toggle
                  value={settings.pageGap}
                  onChange={(v) => onChange('pageGap', v)}
                />
              </SettingRow>
            </div>

            {/* Keyboard shortcuts */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-text-muted text-xs uppercase tracking-wider
                            mb-3">
                Keyboard Shortcuts
              </p>
              {[
                { key: '← / A', action: 'Previous chapter' },
                { key: '→ / D', action: 'Next chapter'     },
                { key: 'Space', action: 'Toggle controls'  },
              ].map(({ key, action }) => (
                <div key={key}
                     className="flex items-center justify-between py-2">
                  <span className="text-text-muted text-xs">{action}</span>
                  <kbd className="text-xs bg-bg-tertiary border border-border
                                  px-2 py-0.5 rounded-md text-text-secondary
                                  font-mono">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ReaderSettings