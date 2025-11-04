// Database types matching the Supabase schema

export interface Player {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  player_id: string;
  game_id: string;
  score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  game_id: string;
  game_name: string;
  player_id: string;
  player_name: string;
  avatar_url: string | null;
  score: number;
  created_at: string;
  rank: number;
}

export interface PlayerStats {
  player_id: string;
  player_name: string;
  games_played: number;
  total_scores: number;
  highest_score: number | null;
  average_score: number | null;
  first_score_at: string | null;
  latest_score_at: string | null;
}

export interface GameStats {
  game_id: string;
  game_name: string;
  unique_players: number;
  total_scores: number;
  highest_score: number | null;
  average_score: number | null;
  first_score_at: string | null;
  latest_score_at: string | null;
}

