import { Category } from '../types';

export const HARDCODED_CATEGORIES: Record<string, Partial<Category>> = {
  'cricket': {
    category_type: 'sport',
    team_size: '9 Players',
    duration: '5 Overs per Innings',
    special_rules: `• SPECIAL RULES FOR GIRLS: At least one over must be bowled by a girl. Every girl player must be given an opportunity to bat. Teams without a girl player will face a deduction of points.
• MONEY BALL RULE: When a girl is batting, she will be designated as the Money Ball Player. All runs scored by her will be doubled (1=2, 4=8, 6=12).`,
  },
  'cricket-mixed-team': {
    category_type: 'sport',
    team_size: '9 Players',
    duration: '5 Overs per Innings',
    special_rules: `• SPECIAL RULES FOR GIRLS: At least one over must be bowled by a girl. Every girl player must be given an opportunity to bat. Teams without a girl player will face a deduction of points.
• MONEY BALL RULE: When a girl is batting, she will be designated as the Money Ball Player. All runs scored by her will be doubled (1=2, 4=8, 6=12).`,
  },
  'football': {
    category_type: 'sport',
    team_size: '7 Players',
    duration: '10m + 2m + 10m',
    special_rules: `• RULES FOR SUBSTITUTION: Compulsory: One player must be substituted in the second half.
• INJURY RULES: In 1st half, injured player can be replaced by 7th player (cannot return). In 2nd half, no substitutions allowed (game continues 4 vs 5).
• TIE-BREAKER: If no winner, match proceeds directly to penalty shootout.`,
  },
  'football-girls-and-boys': {
    category_type: 'sport',
    team_size: '7 Players',
    duration: '10m + 2m + 10m',
    special_rules: `• RULES FOR SUBSTITUTION: Compulsory: One player must be substituted in the second half.
• INJURY RULES: In 1st half, injured player can be replaced by 7th player (cannot return). In 2nd half, no substitutions allowed (game continues 4 vs 5).
• TIE-BREAKER: If no winner, match proceeds directly to penalty shootout.`,
  },
  'basketball': {
    category_type: 'sport',
    team_size: '12 Players',
    duration: '4 Quarters of 5m each',
    special_rules: `• MONEY BALL ZONE: The final 1 minute of each quarter is designated as the Money Ball Zone. During this time, all players on the court become Money Players. Any basket scored in this zone counts as double points.`,
  },
  'basketball-girls-and-boys': {
    category_type: 'sport',
    team_size: '12 Players',
    duration: '4 Quarters of 5m each',
    special_rules: `• MONEY BALL ZONE: The final 1 minute of each quarter is designated as the Money Ball Zone. During this time, all players on the court become Money Players. Any basket scored in this zone counts as double points.`,
  },
  'throwball': {
    category_type: 'sport',
    team_size: '12 Players (Max)',
    duration: 'Single set of 11 points',
    special_rules: `• GAME RULES: Ball must be caught cleanly (no juggling). Throw within 2 seconds. No passing between teammates. Ball must cross net in a single throw.
• SERVICE RULES: Serve from behind end line. Must travel directly over net. Service rotates after each point won.`,
  },
  'throwball-girls-only-grades-11-and-12': {
    category_type: 'sport',
    team_size: '12 Players (Max)',
    duration: 'Single set of 11 points',
    special_rules: `• GAME RULES: Ball must be caught cleanly (no juggling). Throw within 2 seconds. No passing between teammates. Ball must cross net in a single throw.
• SERVICE RULES: Serve from behind end line. Must travel directly over net. Service rotates after each point won.`,
  },
  'chess': {
    category_type: 'sport',
    team_size: 'Individual',
    duration: 'Time limit applies',
    judging_criteria: [
      { criterion: 'Strategic Thinking', weight: '20%' },
      { criterion: 'Accuracy of Moves', weight: '20%' },
      { criterion: 'Time Management', weight: '20%' },
      { criterion: 'Tactical Awareness', weight: '20%' },
      { criterion: 'Overall Gameplay', weight: '20%' }
    ],
    special_rules: `• Standard international chess rules (FIDE) apply.
• Touch-move rule strictly enforced.
• Silence and discipline mandatory.
• No external assistance or electronic devices.`,
  },
  'dance': {
    category_type: 'cultural',
    team_size: 'Solo',
    duration: '3 Minutes',
    judging_criteria: [
      { criterion: 'Creativity', weight: '20%' },
      { criterion: 'Stage Presence', weight: '20%' },
      { criterion: 'Originality', weight: '20%' },
      { criterion: 'Confidence', weight: '20%' },
      { criterion: 'Overall Impact', weight: '20%' }
    ],
    special_rules: `• Props and music must be self-arranged.
• Song choices must be school-appropriate.
• Offensive language and unsafe acts are not permitted.`,
  },
  'music': {
    category_type: 'cultural',
    team_size: 'Duet/Solo',
    duration: '2 Minutes',
    judging_criteria: [
      { criterion: 'Harmony', weight: '20%' },
      { criterion: 'Rhythm', weight: '20%' },
      { criterion: 'Creativity', weight: '20%' },
      { criterion: 'Stage Presence', weight: '20%' },
      { criterion: 'Overall Effects', weight: '20%' }
    ],
    special_rules: `• Live singing and instruments allowed.
• Background track only via pen drive.
• Song choices must be school-appropriate.`,
  },
  'graffiti-art': {
    category_type: 'cultural',
    team_size: 'Group (5–6 members)',
    duration: '180 Minutes',
    judging_criteria: [
      { criterion: 'Concept Strength', weight: '25%' },
      { criterion: 'Theme Relevance', weight: '25%' },
      { criterion: 'Presentation', weight: '25%' },
      { criterion: 'Overall Impact', weight: '25%' }
    ],
    special_rules: `• MUST BRING OWN ART SUPPLIES.
• Use only recycled and school-safe materials.
• Idea must be original.
• Teams present concept in 2 minutes.`,
  },
  'cinematography': {
    category_type: 'cultural',
    team_size: 'Group',
    duration: '4–5 Minutes',
    judging_criteria: [
      { criterion: 'Creativity', weight: '20%' },
      { criterion: 'Theme Relevance', weight: '20%' },
      { criterion: 'Composition', weight: '20%' },
      { criterion: 'Technical Quality', weight: '20%' },
      { criterion: 'Originality', weight: '20%' }
    ],
    special_rules: `• Only original compositions (no stock/AI content).
• Minor editing (brightness, contrast, cropping) permitted.
• Films must be originally created by students.`,
  },
  'theatre': {
    category_type: 'cultural',
    team_size: 'Duet/Solo',
    duration: '2 Minutes',
    judging_criteria: [
      { criterion: 'Comic Timing', weight: '20%' },
      { criterion: 'Expression', weight: '20%' },
      { criterion: 'Originality', weight: '20%' },
      { criterion: 'Audience Appeal', weight: '20%' },
      { criterion: 'Confidence', weight: '20%' }
    ],
    special_rules: `• Format: Stand-up comedy, impressions, short plays/acts, or slam poetry.
• Content must remain respectful and free from offensive remarks.`,
  }
};
