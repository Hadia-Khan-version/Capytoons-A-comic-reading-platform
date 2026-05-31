import { useState, useEffect }         from 'react'
import { Link, useNavigate }           from 'react-router-dom'
import { motion }                      from 'framer-motion'
import { Mail, Lock, User, Loader2 }   from 'lucide-react'
import FormInput                       from '../../components/common/FormInput'
import useAuthStore                    from '../../store/authStore'

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email:    '',
    password: '',
    confirm:  '',
  })
  const [errors, setErrors] = useState({})

  const { register, isLoading, error, clearError, isAuthenticated } =
    useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true })
  }, [])

  useEffect(() => {
    return () => clearError()
  }, [])

  const validate = () => {
    const e = {}

    if (!form.username.trim())
      e.username = 'Username is required'
    else if (form.username.length < 3)
      e.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = 'Letters, numbers and underscores only'

    if (!form.email.trim())
      e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email'

    if (!form.password)
      e.password = 'Password is required'
    else if (form.password.length < 8)
      e.password = 'At least 8 characters'
    else if (!/[A-Z]/.test(form.password))
      e.password = 'Must include an uppercase letter'
    else if (!/[0-9]/.test(form.password))
      e.password = 'Must include a number'

    if (!form.confirm)
      e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password)
      e.confirm = 'Passwords do not match'

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
    const result = await register(form.username, form.email, form.password)
    if (result.success) navigate('/', { replace: true })
  }

  // Password strength indicator
  const getStrength = () => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8)          score++
    if (/[A-Z]/.test(p))        score++
    if (/[0-9]/.test(p))        score++
    if (/[^a-zA-Z0-9]/.test(p)) score++
    return score
  }

  const strength      = getStrength()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = [
    '',
    'bg-red-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ][strength]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center
                    justify-center px-4 py-12">
      <div className="w-full max-w-md">

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
              Create Account
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Join CapyToons and start reading
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="Username"
              type="text"
              icon={User}
              value={form.username}
              onChange={handleChange('username')}
              error={errors.username}
              placeholder="coolreader99"
              autoComplete="username"
            />
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
            <div className="flex flex-col gap-1.5">
              <FormInput
                label="Password"
                type="password"
                icon={Lock}
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
              />
              {/* Strength bar */}
              {form.password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors
                                    duration-300
                                    ${i < strength
                                      ? strengthColor
                                      : 'bg-bg-tertiary'
                                    }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted w-12 text-right">
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <FormInput
              label="Confirm Password"
              type="password"
              icon={Lock}
              value={form.confirm}
              onChange={handleChange('confirm')}
              error={errors.confirm}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary h-11 flex items-center
                         justify-center gap-2 mt-2"
            >
              {isLoading
                ? <><Loader2 size={16} className="animate-spin" /> Creating...</>
                : 'Create Account'
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-text-muted text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent-purple hover:text-accent-purpleHover
                         font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>

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

export default Register