-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players/Users table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games/Match Types table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_scores_player_id ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_game_id ON scores(game_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_score_desc ON scores(game_id, score DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  s.id,
  s.game_id,
  g.name as game_name,
  s.player_id,
  p.name as player_name,
  p.avatar_url,
  s.score,
  s.created_at,
  ROW_NUMBER() OVER (PARTITION BY s.game_id ORDER BY s.score DESC, s.created_at ASC) as rank
FROM scores s
JOIN players p ON s.player_id = p.id
JOIN games g ON s.game_id = g.id
WHERE g.is_active = true
ORDER BY s.game_id, s.score DESC, s.created_at ASC;

-- Player statistics view
CREATE OR REPLACE VIEW player_stats AS
SELECT 
  p.id as player_id,
  p.name as player_name,
  COUNT(DISTINCT s.game_id) as games_played,
  COUNT(s.id) as total_scores,
  MAX(s.score) as highest_score,
  AVG(s.score)::NUMERIC(10,2) as average_score,
  MIN(s.created_at) as first_score_at,
  MAX(s.created_at) as latest_score_at
FROM players p
LEFT JOIN scores s ON p.id = s.player_id
GROUP BY p.id, p.name;

-- Game statistics view
CREATE OR REPLACE VIEW game_stats AS
SELECT 
  g.id as game_id,
  g.name as game_name,
  COUNT(DISTINCT s.player_id) as unique_players,
  COUNT(s.id) as total_scores,
  MAX(s.score) as highest_score,
  AVG(s.score)::NUMERIC(10,2) as average_score,
  MIN(s.created_at) as first_score_at,
  MAX(s.created_at) as latest_score_at
FROM games g
LEFT JOIN scores s ON g.id = s.game_id
WHERE g.is_active = true
GROUP BY g.id, g.name;

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Players policies
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create players"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON players FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Games policies
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Scores policies
CREATE POLICY "Anyone can view scores"
  ON scores FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create scores"
  ON scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update scores"
  ON scores FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete scores"
  ON scores FOR DELETE
  USING (true);

-- Insert sample games
INSERT INTO games (name, description) VALUES
  ('Arcade Classic', 'Classic arcade-style scoring'),
  ('Puzzle Challenge', 'Solve puzzles and score points'),
  ('Speed Run', 'Fast-paced action scoring')
ON CONFLICT DO NOTHING;

