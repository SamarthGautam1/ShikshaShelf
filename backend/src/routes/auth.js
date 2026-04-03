const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = Router();

const VALID_ROLES = ['student', 'teacher', 'admin'];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(VALID_ROLES).withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}`),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Builds a signed JWT for the given user row.
 * @param {{ id: number, name: string, email: string, role: string }} user
 * @returns {string}
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

/**
 * POST /api/auth/register
 * Creates a new user and returns a JWT.
 */
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { name, email, password, role } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, role],
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT.
 */
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
