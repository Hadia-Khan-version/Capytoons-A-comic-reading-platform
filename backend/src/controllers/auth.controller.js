import * as authService from '../services/auth.service.js'
import { sendSuccess }  from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body
  const result = await authService.registerUser({ username, email, password })

  sendSuccess(
    res,
    {
      user:         result.user,
      accessToken:  result.accessToken,
      refreshToken: result.refreshToken,
    },
    'Registration successful',
    201
  )
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await authService.loginUser({ email, password })

  sendSuccess(res, {
    user:         result.user,
    accessToken:  result.accessToken,
    refreshToken: result.refreshToken,
  }, 'Login successful')
})

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  const result = await authService.refreshAccessToken(refreshToken)

  sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed')
})

export const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached by protect middleware
  const user = await authService.getMe(req.user.UserID)
  sendSuccess(res, { user })
})

export const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client just deletes the token
  // If you add a token blacklist later, handle it here
  sendSuccess(res, {}, 'Logged out successfully')
})