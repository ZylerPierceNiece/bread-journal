import express from 'express';
import multer from 'multer';
import pool from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { cloudinaryStorage } from '../config/cloudinary.js';

const router = express.Router();

// Configure multer to use Cloudinary storage
const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET all breads (user's own breads)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM breads WHERE user_id = $1 ORDER BY bake_date DESC, created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get breads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single bread by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM breads WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bread not found' });
    }

    const bread = result.rows[0];
    res.json(bread);
  } catch (error) {
    console.error('Get bread error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET breads by user ID
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // All breads are public now - show all for any user
    const query = 'SELECT * FROM breads WHERE user_id = $1 ORDER BY bake_date DESC, created_at DESC';
    const params = [userId];

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get user breads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new bread
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const {
      name,
      bread_type,
      bake_date,
      crust_rating,
      crumb_rating,
      taste_rating,
      texture_rating,
      appearance_rating,
      notes,
      recipe_notes,
      privacy
    } = req.body;

    if (!name || !bake_date) {
      return res.status(400).json({ error: 'Name and bake date are required' });
    }

    // Build images array from uploaded files (Cloudinary URLs)
    const images = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      order: index
    }));

    // Keep first image as image_url for backwards compatibility
    const image_url = images[0].url;

    const result = await pool.query(
      `INSERT INTO breads (
        user_id, name, bread_type, image_url, images, bake_date,
        crust_rating, crumb_rating, taste_rating, texture_rating, appearance_rating,
        notes, recipe_notes, privacy
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        req.user.userId,
        name,
        bread_type || null,
        image_url,
        JSON.stringify(images),
        bake_date,
        crust_rating ? parseInt(crust_rating) : null,
        crumb_rating ? parseInt(crumb_rating) : null,
        taste_rating ? parseInt(taste_rating) : null,
        texture_rating ? parseInt(texture_rating) : null,
        appearance_rating ? parseInt(appearance_rating) : null,
        notes || null,
        recipe_notes || null,
        'public'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create bread error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update bread
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Check if bread exists and belongs to user
    const existingResult = await pool.query(
      'SELECT * FROM breads WHERE id = $1',
      [req.params.id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bread not found' });
    }

    const existingBread = existingResult.rows[0];

    if (existingBread.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only edit your own breads' });
    }

    const {
      name,
      bread_type,
      bake_date,
      crust_rating,
      crumb_rating,
      taste_rating,
      texture_rating,
      appearance_rating,
      notes,
      recipe_notes,
      privacy
    } = req.body;

    // Use new image if uploaded, otherwise keep existing
    let image_url = existingBread.image_url;
    if (req.file) {
      image_url = req.file.path; // Cloudinary URL
    }

    const result = await pool.query(
      `UPDATE breads SET
        name = $1,
        bread_type = $2,
        image_url = $3,
        bake_date = $4,
        crust_rating = $5,
        crumb_rating = $6,
        taste_rating = $7,
        texture_rating = $8,
        appearance_rating = $9,
        notes = $10,
        recipe_notes = $11,
        privacy = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        name || existingBread.name,
        bread_type !== undefined ? bread_type : existingBread.bread_type,
        image_url,
        bake_date || existingBread.bake_date,
        crust_rating !== undefined ? parseInt(crust_rating) : existingBread.crust_rating,
        crumb_rating !== undefined ? parseInt(crumb_rating) : existingBread.crumb_rating,
        taste_rating !== undefined ? parseInt(taste_rating) : existingBread.taste_rating,
        texture_rating !== undefined ? parseInt(texture_rating) : existingBread.texture_rating,
        appearance_rating !== undefined ? parseInt(appearance_rating) : existingBread.appearance_rating,
        notes !== undefined ? notes : existingBread.notes,
        recipe_notes !== undefined ? recipe_notes : existingBread.recipe_notes,
        'public',
        req.params.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update bread error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE bread
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM breads WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bread not found' });
    }

    const bread = result.rows[0];

    if (bread.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own breads' });
    }

    // Images are stored in Cloudinary, no local deletion needed
    await pool.query('DELETE FROM breads WHERE id = $1', [req.params.id]);
    res.json({ message: 'Bread deleted successfully' });
  } catch (error) {
    console.error('Delete bread error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
