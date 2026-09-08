import { describe, expect, it } from 'vitest';
import { initialInvestigationView } from './presentation';

describe('mobile presentation layout', () => {
  it('opens the investigation presentation on the graph', () => {
    expect(initialInvestigationView()).toBe('Graph');
  });
});
