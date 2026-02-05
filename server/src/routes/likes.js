import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/breads/:breadId/like - Like a bread
router.post('/:breadId/like', authenticateToken, async (req, res) => {
  try {
    const { breadId } = req.params;

    // Check if already liked
    const existing = await pool.query(
      'SELECT 1 FROM likes WHERE bread_id = $1 AND user_id = $2',
      [breadId, req.user.userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already liked' });
    }

    await pool.query(
      'INSERT INTO likes (bread_id, user_id) VALUES ($1, $2)',
      [breadId, req.user.userId]
    );

    // Get updated like count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE bread_id = $1',
      [breadId]
    );

    res.json({
      message: 'Liked successfully',
      likes_count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Error liking bread' });
  }
});

// DELETE /api/breads/:breadId/like - Unlike a bread
router.delete('/:breadId/like', authenticateToken, async (req, res) => {
  try {
    const { breadId } = req.params;

    const result = await pool.query(
      'DELETE FROM likes WHERE bread_id = $1 AND user_id = $2 RETURNING id',
      [breadId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }

    // Get updated like count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE bread_id = $1',
      [breadId]
    );

    res.json({
      message: 'Unliked successfully',
      likes_count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Error unliking bread' });
  }
});

// GET /api/breads/:breadId/likes - Get likes for a bread
router.get('/:breadId/likes', authenticateToken, async (req, res) => {
  try {
    const { breadId } = req.params;

    const result = await pool.query(
      `SELECT l.*, u.username, u.display_name, u.profile_picture
       FROM likes l
       INNER JOIN users u ON l.user_id = u.id
       WHERE l.bread_id = $1
       ORDER BY l.created_at DESC`,
      [breadId]
    );

    res.json({
      likes: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Error fetching likes' });
  }
});

export default router;
