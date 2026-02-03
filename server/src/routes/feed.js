import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/feed - Get breads from users you follow
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT
        b.*,
        u.username,
        u.display_name,
        u.profile_picture
       FROM breads b
       INNER JOIN users u ON b.user_id = u.id
       LEFT JOIN followers f ON f.user_id = b.user_id AND f.follower_id = $1
       WHERE (
         b.user_id = $1 OR
         (f.follower_id = $1 AND b.privacy IN ('public', 'followers'))
       )
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*)
       FROM breads b
       LEFT JOIN followers f ON f.user_id = b.user_id AND f.follower_id = $1
       WHERE (
         b.user_id = $1 OR
         (f.follower_id = $1 AND b.privacy IN ('public', 'followers'))
       )`,
      [req.user.userId]
    );

    res.json({
      breads: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Error fetching feed' });
  }
});

export default router;
