import { readFile } from 'node:fs/promises';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Supabase URL and publishable key must be configured.');

const catalog = JSON.parse(await readFile(new URL('../src/catalog.json', import.meta.url), 'utf8'));
const expected = new Set(catalog.drinks.flatMap((drink) =>
  drink.recipe.filter((item) => !item.optional).map((item) => item.ingredient),
));

const endpoint = `${url.replace(/\/$/, '')}/rest/v1/ingredient_availability?select=ingredient_id,is_available`;
const response = await fetch(endpoint, { headers: { apikey: key } });
if (!response.ok) {
  throw new Error(`Supabase availability read failed: HTTP ${response.status} ${await response.text()}`);
}

const rows = await response.json();
if (!Array.isArray(rows)) throw new Error('Supabase availability response was not an array.');
const found = new Set(rows.map((row) => row.ingredient_id));
const missing = [...expected].filter((id) => !found.has(id));
if (missing.length) throw new Error(`Supabase is missing ingredient rows: ${missing.join(', ')}`);

console.log(`Supabase availability check passed: ${expected.size} menu ingredients readable.`);
