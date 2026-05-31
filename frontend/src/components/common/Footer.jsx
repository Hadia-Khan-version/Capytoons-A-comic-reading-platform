import { Link } from 'react-router-dom'
import {
  Github, Twitter, Heart,
} from 'lucide-react'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-bg-secondary border-t border-border mt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br
                              from-accent-purple to-accent-pink
                              flex items-center justify-center">
                <span className="text-white font-display text-base">C</span>
              </div>
              <span className="font-display text-lg tracking-wider
                               gradient-text">
                CAPYTOONS
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Your home for manga, manhwa and comics. Read anything,
              anywhere, anytime.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-text-primary font-semibold text-sm uppercase
                           tracking-wider">
              Navigate
            </h4>
            {[
              { to: '/',          label: 'Home'      },
              { to: '/browse',    label: 'Browse'    },
              { to: '/bookmarks', label: 'Bookmarks' },
              { to: '/history',   label: 'History'   },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-text-muted hover:text-accent-purple
                           transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
  <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider">
    Connect
  </h4>

  <div className="flex gap-3">
    {[
      { icon: Github, href: '#', label: 'GitHub' },
      { icon: Twitter, href: '#', label: 'Twitter' },
    ].map(({ icon: Icon, href, label }) => (
      <a
        key={label}
        href={href}
        aria-label={label}
        className="w-9 h-9 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center text-text-muted hover:text-accent-purple hover:border-accent-purple/40 transition-all duration-200"
      >
        <Icon size={16} />
      </a>
    ))}
  </div>

  <p className="text-text-muted text-xs mt-2">
    Images sourced from MangaDex API.
    <br />
    For educational purposes only.
  </p>
</div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col
                        sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs">
            © {year} CapyToons. All rights reserved.
          </p>
          <p className="text-text-muted text-xs flex items-center gap-1.5">
            Made with <Heart size={11} className="text-accent-pink fill-accent-pink" /> for readers
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer