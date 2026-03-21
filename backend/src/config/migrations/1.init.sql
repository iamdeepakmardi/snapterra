CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE screenshots (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  filename TEXT,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE
);

CREATE TABLE screenshot_tags (
  screenshot_id INT REFERENCES screenshots(id),
  tag_id INT REFERENCES tags(id),
  PRIMARY KEY (screenshot_id, tag_id)
);