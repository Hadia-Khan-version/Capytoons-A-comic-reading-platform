import dotenv from 'dotenv'
dotenv.config()

const required = (key) => {
  const value = process.env[key]
  if (!value) {
    console.error(`❌  Missing required env variable: ${key}`)
    process.exit(1)
  }
  return value
}

const optional = (key, fallback) => process.env[key] || fallback

export const env = {
  NODE_ENV:    optional('NODE_ENV', 'development'),
  PORT:        optional('PORT', '5000'),
  isDev:       optional('NODE_ENV', 'development') === 'development',

  db: {
    host:     required('DB_HOST'),
    port:     parseInt(optional('DB_PORT', '3306')),
    user:     required('DB_USER'),
    password: required('DB_PASSWORD'),
    name:     required('DB_NAME'),
  },

  jwt: {
    secret:          required('JWT_SECRET'),
    expiresIn:       optional('JWT_EXPIRES_IN', '7d'),
    refreshSecret:   required('JWT_REFRESH_SECRET'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  bcryptRounds: parseInt(optional('BCRYPT_ROUNDS', '12')),

  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000')),
    max:      parseInt(optional('RATE_LIMIT_MAX', '100')),
  },
}