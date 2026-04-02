export type House = {
  id: string;
  name: string;
  color: string;
  mascot: string | null;
  mascot_name: string | null;
  points: number;
  rank_pos: number;
  motto: string | null;
};

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  gender: string | null;
  eligible_years: string | null;
};

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export type Match = {
  id: number;
  category_id: string;
  match_no: number;
  team1_id: string;
  team2_id: string;
  score1: number | null;
  score2: number | null;
  winner_id: string | null;
  status: MatchStatus;
  venue: string | null;
  match_time: string | null;
  // Joined fields
  category?: Category;
  team1?: House;
  team2?: House;
  winner?: House;
};

export type ScheduleItem = {
  id: number;
  day_label: string;
  day_date: string;
  time_start: string;
  time_end: string | null;
  title: string;
  subtitle: string | null;
  category: string | null;
  venue: string | null;
  house_ids: string | null; // comma separated
  status: MatchStatus;
  sort_order: number;
};

export type Setting = {
  key_name: string;
  val: string;
};
