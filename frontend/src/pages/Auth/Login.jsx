import { useState, useEffect }    from 'react'
import { Link, useNavigate,
         useLocation }            from 'react-router-dom'
import { motion }                 from 'framer-motion'
import { Mail, Lock, Loader2 }    from 'lucide-react'
import FormInput                  from '../../components/common/FormInput'
import useAuthStore               from '../../store/authStore'

const Login = () => {
  const [form,   setForm]   = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) navigate(from, { replace: true })
  }, [])

  useEffect(() => {
    return () => clearError()
  }, [])

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await login(form.email, form.password)
    if (result.success) navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center
                    justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
          className="card p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br
                            from-accent-purple to-accent-pink
                            flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-display tracking-wider
                           text-text-primary">
              Welcome Back
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Sign in to continue reading
            </p>
          </div>

          {/* Global error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0  }}
              className="bg-red-500/10 border border-red-500/30
                         rounded-xl px-4 py-3 mb-6"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="Email"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormInput
              label="Password"
              type="password"
              icon={Lock}
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
              placeholder="Your password"
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary h-11 flex items-center
                         justify-center gap-2 mt-2"
            >
              {isLoading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-text-muted text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-accent-purple hover:text-accent-purpleHover
                         font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>

        {/* Back home */}
        <p className="text-center mt-4">
          <Link
            to="/"
            className="text-text-muted text-sm hover:text-text-primary
                       transition-colors"
          >
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login