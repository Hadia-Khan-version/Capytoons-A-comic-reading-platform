import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal }    from 'lucide-react'

const STATUSES  = ['ongoing', 'completed', 'hiatus', 'cancelled']
const TYPES     = ['manga', 'manhwa', 'manhua', 'comic']
const LANGUAGES = [
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean'   },
  { value: 'zh', label: 'Chinese'  },
  { value: 'en', label: 'English'  },
]
const SORT_OPTIONS = [
  { value: 'AverageRating', label: 'Top Rated'    },
  { value: 'TotalViews',    label: 'Most Viewed'  },
  { value: 'Title',         label: 'A – Z'        },
  { value: 'ReleaseYear',   label: 'Release Year' },
]

const FilterGroup = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-xs font-semibold text-text-muted uppercase
                   tracking-widest">
      {label}
    </h4>
    {children}
  </div>
)

const Pill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm border transition-all
                duration-200 text-left capitalize
                ${active
                  ? 'bg-accent-purple/20 border-accent-purple text-accent-purple'
                  : 'bg-bg-tertiary border-border text-text-secondary hover:border-accent-purple/50 hover:text-text-primary'
                }`}
  >
    {children}
  </button>
)

const FilterContent = ({ genres, filters, onChange, onClear }) => {
  const activeCount = [
    filters.status,
    filters.type,
    filters.language,
    filters.genreId,
    filters.sortBy,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent-purple" />
          <h3 className="font-semibold text-text-primary">Filters</h3>
          {activeCount > 0 && (
            <span className="badge bg-accent-purple text-white text-[10px]">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-text-muted hover:text-red-400
                       transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Sort By */}
      <FilterGroup label="Sort By">
        <div className="flex flex-col gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              active={filters.sortBy === opt.value}
              onClick={() =>
                onChange('sortBy',
                  filters.sortBy === opt.value ? '' : opt.value
                )
              }
            >
              {opt.label}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      {/* Status */}
      <FilterGroup label="Status">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Pill
              key={s}
              active={filters.status === s}
              onClick={() =>
                onChange('status', filters.status === s ? '' : s)
              }
            >
              {s}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      {/* Type */}
      <FilterGroup label="Type">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Pill
              key={t}
              active={filters.type === t}
              onClick={() =>
                onChange('type', filters.type === t ? '' : t)
              }
            >
              {t}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      {/* Language */}
      <FilterGroup label="Language">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <Pill
              key={l.value}
              active={filters.language === l.value}
              onClick={() =>
                onChange('language',
                  filters.language === l.value ? '' : l.value
                )
              }
            >
              {l.label}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      {/* Genre */}
      {genres.length > 0 && (
        <FilterGroup label="Genre">
          <div className="flex flex-col gap-1.5">
            {genres.map((g) => (
              <Pill
                key={g.GenreID}
                active={filters.genreId === String(g.GenreID)}
                onClick={() =>
                  onChange('genreId',
                    filters.genreId === String(g.GenreID)
                      ? ''
                      : String(g.GenreID)
                  )
                }
              >
                {g.GenreName}
                {g.ComicCount !== undefined && (
                  <span className="ml-1.5 text-xs opacity-50">
                    {g.ComicCount}
                  </span>
                )}
              </Pill>
            ))}
          </div>
        </FilterGroup>
      )}
    </div>
  )
}

const FilterSidebar = ({
  genres     = [],
  filters    = {},
  onChange,
  onClear,
  mobileOpen,
  onMobileClose,
}) => {
  return (
    <>
      {/* ── Desktop sidebar — scrollable ── */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div
          className="card p-5 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 7rem)', position: 'sticky', top: '5.5rem' }}
        >
          <FilterContent
            genres={genres}
            filters={filters}
            onChange={onChange}
            onClear={onClear}
          />
        </div>
      </aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0       }}
              exit={{    x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72
                         bg-bg-secondary border-r border-border
                         z-50 lg:hidden flex flex-col"
            >
              {/* Drawer header — fixed */}
              <div className="flex items-center justify-between p-5
                              border-b border-border flex-shrink-0">
                <span className="font-semibold text-text-primary">
                  Filter & Sort
                </span>
                <button
                  onClick={onMobileClose}
                  className="text-text-muted hover:text-text-primary
                             transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer content — scrollable */}
              <div className="flex-1 overflow-y-auto p-5">
                <FilterContent
                  genres={genres}
                  filters={filters}
                  onChange={(key, val) => {
                    onChange(key, val)
                  }}
                  onClear={() => {
                    onClear()
                    onMobileClose()
                  }}
                />
              </div>

              {/* Drawer footer — fixed */}
              <div className="p-5 border-t border-border flex-shrink-0">
                <button
                  onClick={onMobileClose}
                  className="btn-primary w-full"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default FilterSidebar