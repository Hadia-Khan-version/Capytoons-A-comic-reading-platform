import { Router }   from 'express'
import { body }     from 'express-validator'
import * as ctrl    from '../controllers/auth.controller.js'
import { protect }  from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = Router()

// ── Validation Rules ──────────────────────────────

const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
]

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
]

// ── Routes ────────────────────────────────────────

// POST /api/auth/register
router.post('/register', registerRules, validate, ctrl.register)

// POST /api/auth/login
router.post('/login', loginRules, validate, ctrl.login)

// POST /api/auth/refresh
router.post('/refresh', ctrl.refresh)

// POST /api/auth/logout  (protected)
router.post('/logout', protect, ctrl.logout)

// GET  /api/auth/me  (protected)
router.get('/me', protect, ctrl.getMe)

export default router