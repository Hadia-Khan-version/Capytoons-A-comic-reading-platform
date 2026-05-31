import bcrypt          from 'bcryptjs'
import jwt             from 'jsonwebtoken'
import { env }         from '../config/env.js'
import { queryOne, insert } from '../db/index.js'
import {
  conflict,
  unauthorized,
  badRequest,
} from '../utils/AppError.js'

// ── Token Helpers ─────────────────────────────────

const signToken = (userId) =>
  jwt.sign({ userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn })

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  })

export const generateTokens = (userId) => ({
  accessToken:  signToken(userId),
  refreshToken: signRefreshToken(userId),
})

// ── Register ──────────────────────────────────────

export const registerUser = async ({ username, email, password }) => {
  // 1. Check email not already taken
  const existingEmail = await queryOne(
    'SELECT UserID FROM User WHERE Email = ?',
    [email]
  )
  if (existingEmail) throw conflict('Email is already registered')

  // 2. Check username not taken
  const existingUsername = await queryOne(
    'SELECT UserID FROM User WHERE Username = ?',
    [username]
  )
  if (existingUsername) throw conflict('Username is already taken')

  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, env.bcryptRounds)

  // 4. Insert user
  const userId = await insert(
    `INSERT INTO User (Username, Email, PasswordHash, JoinDate, AvatarURL)
     VALUES (?, ?, ?, NOW(), ?)`,
    [username, email, passwordHash, generateDefaultAvatar(username)]
  )

  // 5. Fetch the created user (never return passwordHash)
  const user = await queryOne(
    `SELECT UserID, Username, Email, AvatarURL, JoinDate
     FROM User WHERE UserID = ?`,
    [userId]
  )

  const tokens = generateTokens(userId)
  return { user, ...tokens }
}

// ── Login ─────────────────────────────────────────

export const loginUser = async ({ email, password }) => {
  // 1. Find user with password
  const user = await queryOne(
    `SELECT UserID, Username, Email, PasswordHash, AvatarURL, JoinDate
     FROM User WHERE Email = ?`,
    [email]
  )
  if (!user) throw unauthorized('Invalid email or password')

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.PasswordHash)
  if (!isMatch) throw unauthorized('Invalid email or password')

  // 3. Remove hash before returning
  const { PasswordHash, ...safeUser } = user

  const tokens = generateTokens(user.UserID)
  return { user: safeUser, ...tokens }
}

// ── Refresh Token ─────────────────────────────────

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw badRequest('Refresh token required')

  let decoded
  try {
    decoded = jwt.verify(refreshToken, env.jwt.refreshSecret)
  } catch {
    throw unauthorized('Invalid or expired refresh token')
  }

  const user = await queryOne(
    `SELECT UserID FROM User WHERE UserID = ?`,
    [decoded.userId]
  )
  if (!user) throw unauthorized('User not found')

  return { accessToken: signToken(user.UserID) }
}

// ── Get Profile ───────────────────────────────────

export const getMe = async (userId) => {
  const user = await queryOne(
    `SELECT UserID, Username, Email, AvatarURL, JoinDate
     FROM User WHERE UserID = ?`,
    [userId]
  )
  if (!user) throw unauthorized('User not found')
  return user
}

// ── Helpers ───────────────────────────────────────

/**
 * Generate a default avatar URL using DiceBear API
 */
const generateDefaultAvatar = (username) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`