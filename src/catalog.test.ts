import { describe, expect, it } from 'vitest';
import { drinks, trackedIngredients, visibleDrinks } from './catalog';

describe('ingredient availability', () => {
  it('removes every drink that needs an unavailable ingredient', () => {
    const hidden = new Set(['vodka']);
    const shown = visibleDrinks(hidden);
    expect(shown.map((drink) => drink.id)).not.toContain('lemon-drop');
    expect(shown.map((drink) => drink.id)).not.toContain('moscow-mule');
    expect(shown.map((drink) => drink.id)).not.toContain('vodka-red-bull');
    expect(shown.map((drink) => drink.id)).toContain('whiskey-sour');
  });

  it('does not hide a drink when only an optional garnish is unavailable', () => {
    const shown = visibleDrinks(new Set(['maraschino-cherry', 'chocolate-syrup', 'whipped-cream']));
    expect(shown).toHaveLength(drinks.length);
    expect(trackedIngredients.map((ingredient) => ingredient.id)).not.toContain('maraschino-cherry');
  });

  it('shows drinks again when their required ingredients return', () => {
    expect(visibleDrinks(new Set(['margarita-mix'])).some((drink) => drink.id === 'margarita')).toBe(false);
    expect(visibleDrinks(new Set()).some((drink) => drink.id === 'margarita')).toBe(true);
  });

  it('uses a shared coconut stock item for both coconut cocktails', () => {
    const shown = visibleDrinks(new Set(['coconut-cream']));
    expect(shown.map((drink) => drink.id)).not.toContain('pina-colada');
    expect(shown.map((drink) => drink.id)).not.toContain('blue-hawaiian');
  });
});
