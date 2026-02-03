import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages/conversations - Get all conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (conversation_user_id)
        conversation_user_id as user_id,
        u.username,
        u.display_name,
        u.profile_picture,
        m.content as last_message,
        m.created_at as last_message_at,
        m.sender_id,
        m.is_read,
        unread_count
       FROM (
         SELECT
           CASE
             WHEN sender_id = $1 THEN recipient_id
             ELSE sender_id
           END as conversation_user_id,
           id,
           content,
           created_at,
           sender_id,
           is_read
         FROM messages
         WHERE sender_id = $1 OR recipient_id = $1
       ) m
       INNER JOIN users u ON u.id = m.conversation_user_id
       LEFT JOIN LATERAL (
         SELECT COUNT(*) as unread_count
         FROM messages
         WHERE recipient_id = $1
           AND sender_id = m.conversation_user_id
           AND is_read = FALSE
       ) unread ON true
       ORDER BY conversation_user_id, m.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Error fetching conversations' });
  }
});

// GET /api/messages/:userId - Get messages with a specific user
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT m.*,
        sender.username as sender_username,
        sender.display_name as sender_display_name,
        sender.profile_picture as sender_profile_picture,
        recipient.username as recipient_username,
        recipient.display_name as recipient_display_name,
        recipient.profile_picture as recipient_profile_picture
       FROM messages m
       INNER JOIN users sender ON m.sender_id = sender.id
       INNER JOIN users recipient ON m.recipient_id = recipient.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2)
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.userId, userId]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = FALSE`,
      [req.user.userId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// POST /api/messages - Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipient_id, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (recipient_id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Check if recipient exists
    const userCheck = await pool.query('SELECT 1 FROM users WHERE id = $1', [recipient_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.userId, recipient_id, content.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = FALSE',
      [req.user.userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Error fetching unread count' });
  }
});

export default router;
