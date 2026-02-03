import express from 'express';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/users/search - Search users by username
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await pool.query(
      `SELECT id, username, display_name, bio, profile_picture, created_at
       FROM users
       WHERE username ILIKE $1 OR display_name ILIKE $1
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Error searching users' });
  }
});

// GET /api/users/:id - Get user profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, display_name, bio, profile_picture, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get follower and following counts
    const followersResult = await pool.query(
      'SELECT COUNT(*) FROM followers WHERE user_id = $1',
      [req.params.id]
    );

    const followingResult = await pool.query(
      'SELECT COUNT(*) FROM followers WHERE follower_id = $1',
      [req.params.id]
    );

    user.followers_count = parseInt(followersResult.rows[0].count);
    user.following_count = parseInt(followingResult.rows[0].count);

    // Check if current user follows this user
    if (req.user) {
      const isFollowingResult = await pool.query(
        'SELECT 1 FROM followers WHERE user_id = $1 AND follower_id = $2',
        [req.params.id, req.user.userId]
      );
      user.is_following = isFollowingResult.rows.length > 0;
    } else {
      user.is_following = false;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// POST /api/users/:id/follow - Follow a user
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);

    if (targetUserId === req.user.userId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if target user exists
    const userCheck = await pool.query('SELECT 1 FROM users WHERE id = $1', [targetUserId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await pool.query(
      'SELECT 1 FROM followers WHERE user_id = $1 AND follower_id = $2',
      [targetUserId, req.user.userId]
    );

    if (existingFollow.rows.length > 0) {
      return res.status(409).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    await pool.query(
      'INSERT INTO followers (user_id, follower_id) VALUES ($1, $2)',
      [targetUserId, req.user.userId]
    );

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Error following user' });
  }
});

// DELETE /api/users/:id/follow - Unfollow a user
router.delete('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);

    const result = await pool.query(
      'DELETE FROM followers WHERE user_id = $1 AND follower_id = $2 RETURNING *',
      [targetUserId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Error unfollowing user' });
  }
});

// GET /api/users/:id/followers - Get user's followers
router.get('/:id/followers', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.bio, u.profile_picture
       FROM users u
       INNER JOIN followers f ON u.id = f.follower_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Error fetching followers' });
  }
});

// GET /api/users/:id/following - Get users this user follows
router.get('/:id/following', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.bio, u.profile_picture
       FROM users u
       INNER JOIN followers f ON u.id = f.user_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Error fetching following' });
  }
});

// PUT /api/users/profile - Update current user's profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { display_name, bio } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        display_name = $1,
        bio = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, username, email, display_name, bio, profile_picture, created_at`,
      [display_name, bio, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// POST /api/users/profile-picture - Upload profile picture
router.post('/profile-picture', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const profile_picture = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE users SET
        profile_picture = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, email, display_name, bio, profile_picture, created_at`,
      [profile_picture, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
});

export default router;
