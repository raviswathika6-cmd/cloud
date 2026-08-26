import { Router, Response } from 'express';
import Joi from 'joi';
import { query } from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticate,
  AuthRequest
} from '../middleware/auth';
import { ValidationError, UnauthorizedError } from '../middleware/errorHandler';

export const authRoutes = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register
authRoutes.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) throw new ValidationError(error.details[0].message);

    const { email, password, first_name, last_name } = value;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      [email, passwordHash, first_name, last_name]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name,
        last_name,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }
});

// Login
authRoutes.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) throw new ValidationError(error.details[0].message);

    const { email, password } = value;

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = generateToken(user.id, user.email, user.role);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof UnauthorizedError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }
});

// Get current user profile
authRoutes.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_email_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    res.status(200).json({
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Logout (client-side, just return success)
authRoutes.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json({ message: 'Logged out successfully' });
});
