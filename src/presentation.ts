export type InvestigationView = 'Graph' | 'Timeline' | 'Locations' | 'Table';

export function initialInvestigationView(): InvestigationView {
  return 'Graph';
}
