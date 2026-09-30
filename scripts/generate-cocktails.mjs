import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(resolve(root, 'src/catalog.json'), 'utf8'));
const checking = process.argv.includes('--check');
const ids = new Set();
const ingredientNames = new Map();

for (const ingredient of catalog.ingredients) {
  if (ids.has(ingredient.id)) throw new Error(`Duplicate ingredient: ${ingredient.id}`);
  ids.add(ingredient.id);
  ingredientNames.set(ingredient.id, ingredient.name);
}
const drinkIds = new Set();
for (const drink of catalog.drinks) {
  if (drinkIds.has(drink.id)) throw new Error(`Duplicate drink: ${drink.id}`);
  drinkIds.add(drink.id);
  if (!['Real Cocktails', 'College Cocktails'].includes(drink.category)) throw new Error(`Bad category: ${drink.id}`);
  if (!drink.recipe.length) throw new Error(`Empty recipe: ${drink.id}`);
  for (const item of drink.recipe) {
    if (!ingredientNames.has(item.ingredient)) throw new Error(`Unknown ingredient ${item.ingredient} in ${drink.id}`);
  }
}

const lines = [
  '# The Bar — Cocktail List',
  '',
  'Open bar · No prices',
  '',
  'Recipes are in serving amounts. Items marked *optional garnish* do not affect menu availability.',
  '',
];
for (const category of ['Real Cocktails', 'College Cocktails']) {
  lines.push(`## ${category}`, '');
  for (const drink of catalog.drinks.filter((item) => item.category === category)) {
    lines.push(`### ${drink.name}`, '', drink.description, '');
    for (const item of drink.recipe) {
      lines.push(`- ${item.amount} ${ingredientNames.get(item.ingredient)}${item.optional ? ' — optional garnish' : ''}`);
    }
    if (drink.method) lines.push('', `Method: ${drink.method}`);
    lines.push('');
  }
}

const tracked = catalog.ingredients.filter((ingredient) =>
  catalog.drinks.some((drink) => drink.recipe.some((item) => item.ingredient === ingredient.id && !item.optional)),
);
const sql = [
  '-- Generated from src/catalog.json. Run after 001_ingredient_availability.sql.',
  '-- New ingredients start in stock. Existing availability is preserved.',
  'insert into public.ingredient_availability (ingredient_id, is_available) values',
  tracked.map((ingredient) => `  ('${ingredient.id}', true)`).join(',\n'),
  'on conflict (ingredient_id) do nothing;',
  '',
].join('\n');

const outputs = [
  ['COCKTAILS.md', `${lines.join('\n').trimEnd()}\n`],
  ['supabase/seed.sql', sql],
];
for (const [name, content] of outputs) {
  const path = resolve(root, name);
  if (checking) {
    if (readFileSync(path, 'utf8') !== content) throw new Error(`${name} is out of date. Run npm run generate:catalog.`);
  } else {
    writeFileSync(path, content);
    process.stdout.write(`Wrote ${name}\n`);
  }
}
