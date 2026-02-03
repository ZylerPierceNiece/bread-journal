-- Breads table for storing bread entries with ratings
CREATE TABLE IF NOT EXISTS breads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bread_type TEXT,
  image_filename TEXT NOT NULL,
  bake_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Rating aspects (1-10)
  crust_rating INTEGER CHECK(crust_rating >= 1 AND crust_rating <= 10),
  crumb_rating INTEGER CHECK(crumb_rating >= 1 AND crumb_rating <= 10),
  taste_rating INTEGER CHECK(taste_rating >= 1 AND taste_rating <= 10),
  texture_rating INTEGER CHECK(texture_rating >= 1 AND texture_rating <= 10),
  appearance_rating INTEGER CHECK(appearance_rating >= 1 AND appearance_rating <= 10),

  -- Optional fields
  notes TEXT,
  recipe_notes TEXT
);
