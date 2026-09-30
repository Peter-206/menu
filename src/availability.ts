import { createClient } from '@supabase/supabase-js';
import { trackedIngredients } from './catalog';

const previewKey = 'the-bar-preview-unavailable-v1';
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isPreview = !url || !publishableKey;
const client = !isPreview ? createClient(url, publishableKey) : null;

function previewRead(): Set<string> {
  try {
    const saved = JSON.parse(localStorage.getItem(previewKey) ?? '[]') as unknown;
    return new Set(Array.isArray(saved) ? saved.filter((value): value is string => typeof value === 'string') : []);
  } catch {
    return new Set();
  }
}

export async function loadUnavailable(): Promise<Set<string>> {
  if (!client) return previewRead();

  const { data, error } = await client
    .from('ingredient_availability')
    .select('ingredient_id,is_available');
  if (error) throw new Error(error.message);

  const expected = new Set(trackedIngredients.map((ingredient) => ingredient.id));
  const found = new Set((data ?? []).map((row) => row.ingredient_id as string));
  if ([...expected].some((id) => !found.has(id))) {
    throw new Error('The ingredient database is missing menu ingredients. Run the current seed SQL.');
  }

  return new Set((data ?? [])
    .filter((row) => row.is_available === false)
    .map((row) => row.ingredient_id as string));
}

export async function setIngredientUnavailable(ingredientId: string, unavailable: boolean): Promise<void> {
  if (!trackedIngredients.some((ingredient) => ingredient.id === ingredientId)) {
    throw new Error('Unknown ingredient.');
  }

  if (!client) {
    const next = previewRead();
    if (unavailable) next.add(ingredientId);
    else next.delete(ingredientId);
    localStorage.setItem(previewKey, JSON.stringify([...next]));
    return;
  }

  const { data, error } = await client
    .from('ingredient_availability')
    .update({ is_available: !unavailable })
    .eq('ingredient_id', ingredientId)
    .select('ingredient_id');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('The ingredient was not updated. Check database permissions.');
}
