import jwt        from 'jsonwebtoken'
import { env }    from '../config/env.js'
import { queryOne } from '../db/index.js'
import { unauthorized } from '../utils/AppError.js'

export const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      })
    }

    // 2. Verify token
    let decoded
    try {
      decoded = jwt.verify(token, env.jwt.secret)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError'
          ? 'Token expired'
          : 'Invalid token',
      })
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      })
    }

    // 3. Find user in DB
    const user = await queryOne(
      `SELECT UserID, Username, Email, AvatarURL, JoinDate
       FROM User WHERE UserID = ?`,
      [decoded.userId]
    )

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // 4. Attach user and continue
    req.user = user
    next()

  } catch (err) {
    console.error('❌ Auth middleware error:', err.message)
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null
      return next()
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      req.user = null
      return next()
    }

    let decoded
    try {
      decoded = jwt.verify(token, env.jwt.secret)
    } catch {
      req.user = null
      return next()
    }

    if (!decoded?.userId) {
      req.user = null
      return next()
    }

    const user = await queryOne(
      `SELECT UserID, Username, Email, AvatarURL FROM User WHERE UserID = ?`,
      [decoded.userId]
    )

    req.user = user || null
    next()

  } catch {
    req.user = null
    next()
  }
}