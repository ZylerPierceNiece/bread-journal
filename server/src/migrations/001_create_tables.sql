-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  profile_picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create breads table
CREATE TABLE IF NOT EXISTS breads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bread_type VARCHAR(100),
  image_url VARCHAR(500) NOT NULL,
  bake_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Rating aspects (1-10)
  crust_rating INTEGER CHECK(crust_rating >= 1 AND crust_rating <= 10),
  crumb_rating INTEGER CHECK(crumb_rating >= 1 AND crumb_rating <= 10),
  taste_rating INTEGER CHECK(taste_rating >= 1 AND taste_rating <= 10),
  texture_rating INTEGER CHECK(texture_rating >= 1 AND texture_rating <= 10),
  appearance_rating INTEGER CHECK(appearance_rating >= 1 AND appearance_rating <= 10),

  -- Privacy setting
  privacy VARCHAR(20) DEFAULT 'followers' CHECK(privacy IN ('public', 'followers', 'private')),

  -- Optional fields
  notes TEXT,
  recipe_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_breads_user_id ON breads(user_id);
CREATE INDEX IF NOT EXISTS idx_breads_created_at ON breads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_breads_privacy ON breads(privacy);

-- Create followers table
CREATE TABLE IF NOT EXISTS followers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, follower_id),
  CHECK(user_id != follower_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_user_id ON followers(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  bread_id INTEGER NOT NULL REFERENCES breads(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_bread_id ON likes(bread_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  bread_id INTEGER NOT NULL REFERENCES breads(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_bread_id ON comments(bread_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK(sender_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;
