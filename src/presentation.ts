// Kept for backward compatibility — no longer used by the new router-based app
export type InvestigationView = 'Graph' | 'Timeline' | 'Locations' | 'Table';
export function initialInvestigationView(): InvestigationView { return 'Graph'; }
