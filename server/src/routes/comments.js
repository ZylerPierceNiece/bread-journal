import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/breads/:breadId/comments - Get comments for a bread
router.get('/:breadId/comments', authenticateToken, async (req, res) => {
  try {
    const { breadId } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.username, u.display_name, u.profile_picture
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.bread_id = $1
       ORDER BY c.created_at ASC`,
      [breadId]
    );

    res.json({
      comments: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// POST /api/breads/:breadId/comments - Add a comment
router.post('/:breadId/comments', authenticateToken, async (req, res) => {
  try {
    const { breadId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const result = await pool.query(
      `INSERT INTO comments (bread_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [breadId, req.user.userId, content.trim()]
    );

    // Get user info for the comment
    const commentWithUser = await pool.query(
      `SELECT c.*, u.username, u.display_name, u.profile_picture
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(commentWithUser.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// DELETE /api/breads/:breadId/comments/:commentId - Delete a comment
router.delete('/:breadId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if comment exists and belongs to user
    const comment = await pool.query(
      'SELECT * FROM comments WHERE id = $1',
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Error deleting comment' });
  }
});

export default router;
