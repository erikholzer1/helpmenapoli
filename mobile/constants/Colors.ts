export const Colors = {
  dark:   '#1A1410',
  warm:   '#2C2118',
  warmer: '#3A2C20',
  gold:   '#D4A843',
  goldDim:'#C49A38',
  goldSoft:'#E7C56B',
  red:    '#C8392B',
  cream:  '#F5F0E8',
  light:  '#EDE8DE',
  surface:'#FFFFFF',
  surfaceTint:'#FBF8F2',
  mid:    '#6B5B4E',
  faint:  '#9A8B7D',
  white:  '#FFFFFF',

  tabBar:         '#15100C',
  tabBarActive:   '#D4A843',
  tabBarInactive: 'rgba(245,240,232,0.45)',

  cardBg:         '#FFFFFF',
  cardBorder:     'rgba(107,91,78,0.12)',
  sectionBg:      '#F5F0E8',
  divider:        'rgba(107,91,78,0.12)',
};

// ── Elevation system ──────────────────────────────────────────────
// Warm-toned shadows (not neutral grey) keep depth feeling premium and
// on-brand. Cross-platform: iOS/web read shadow*, Android reads elevation.
export const Shadow = {
  sm: {
    shadowColor: '#3A2A14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#3A2A14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  lg: {
    shadowColor: '#2A1C0C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export const Radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

// Reusable gradient stops
export const Gradients = {
  hero: ['#1A1410', '#2C2118', '#1A1410'] as const,
  goldStrip: ['#2C2118', '#1A1410'] as const,
};
