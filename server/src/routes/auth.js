import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Helper: generate a 6-digit code
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Helper: insert a verification code into the DB
async function createCode(email, type) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await pool.query(
    `INSERT INTO verification_codes (email, code, type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [email, code, type, expiresAt]
  );

  return code;
}

// POST /api/auth/signup - Create new user (unverified)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.username === username) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      if (existing.email === email) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user as unverified
    await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, verified)
       VALUES ($1, $2, $3, $4, FALSE)`,
      [username, email, password_hash, display_name || username]
    );

    // Generate verification code and send email in the background
    const code = await createCode(email, 'email_verification');
    sendVerificationEmail(email, code).catch(err => console.error('Email send error:', err));

    // Return pending state — no token yet
    res.status(201).json({
      pending: true,
      email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// POST /api/auth/verify - Verify email with code
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find the most recent unexpired code for this email
    const result = await pool.query(
      `SELECT code FROM verification_codes
       WHERE email = $1 AND type = 'email_verification' AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0 || result.rows[0].code !== code) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Mark user as verified
    const userResult = await pool.query(
      `UPDATE users SET verified = TRUE WHERE email = $1
       RETURNING id, username, email, display_name`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the used code
    await pool.query(
      `DELETE FROM verification_codes WHERE email = $1 AND type = 'email_verification'`,
      [email]
    );

    const user = userResult.rows[0];
    const token = generateToken(user.id, user.username, user.email);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Error verifying email' });
  }
});

// POST /api/auth/resend - Resend a verification or reset code
router.post('/resend', async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ error: 'Email and type are required' });
    }

    // Rate limit: block if a code was created less than 30 seconds ago
    const recent = await pool.query(
      `SELECT created_at FROM verification_codes
       WHERE email = $1 AND type = $2
       ORDER BY created_at DESC LIMIT 1`,
      [email, type]
    );

    if (recent.rows.length > 0) {
      const lastCreated = new Date(recent.rows[0].created_at);
      if (Date.now() - lastCreated.getTime() < 30000) {
        return res.status(429).json({ error: 'Please wait before requesting another code' });
      }
    }

    // Generate new code
    const code = await createCode(email, type);

    if (type === 'email_verification') {
      sendVerificationEmail(email, code).catch(err => console.error('Email send error:', err));
    } else if (type === 'password_reset') {
      sendPasswordResetEmail(email, code).catch(err => console.error('Email send error:', err));
    }

    res.json({ message: 'Code sent' });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Error sending code' });
  }
});

// POST /api/auth/forgot-password - Request a password reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists — but always return 200 to avoid revealing valid emails
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length > 0) {
      const code = await createCode(email, 'password_reset');
      sendPasswordResetEmail(email, code).catch(err => console.error('Email send error:', err));
    }

    // Always return success regardless of whether email exists
    res.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
});

// POST /api/auth/reset-password - Reset password with code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find the most recent unexpired reset code
    const result = await pool.query(
      `SELECT code FROM verification_codes
       WHERE email = $1 AND type = 'password_reset' AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0 || result.rows[0].code !== code) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Hash new password and update user
    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [password_hash, email]
    );

    // Delete all reset codes for this email (single use)
    await pool.query(
      `DELETE FROM verification_codes WHERE email = $1 AND type = 'password_reset'`,
      [email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user (allow login with username or email)
    const result = await pool.query(
      'SELECT id, username, email, password_hash, display_name, bio, profile_picture, verified FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(401).json({
        error: 'Email not verified',
        pending: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user.id, user.username, user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        bio: user.bio,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, display_name, bio, profile_picture, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

export default router;
