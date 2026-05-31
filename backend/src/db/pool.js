import mysql from 'mysql2/promise'
import { env } from '../config/env.js'

const pool = mysql.createPool({
  host:               env.db.host,
  port:               env.db.port,
  user:               env.db.user,
  password:           env.db.password,
  database:           env.db.name,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  decimalNumbers:     true,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 10000,

  // Auto reconnect
  connectTimeout: 60000,
})

// Ping every 4 minutes to keep connections alive
setInterval(async () => {
  try {
    await pool.query('SELECT 1')
  } catch (err) {
    console.error('❌ DB ping failed:', err.message)
  }
}, 1000 * 60 * 4)

export const testConnection = async () => {
  try {
    await pool.query('SELECT 1')
    console.log(`✅  MySQL connected — database: "${env.db.name}"`)
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message)
    process.exit(1)
  }
}

export default pool