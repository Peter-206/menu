import rawCatalog from './catalog.json';

export type Category = 'Real Cocktails' | 'College Cocktails';
export type Ingredient = { id: string; name: string };
export type RecipeItem = { ingredient: string; amount: string; optional?: boolean };
export type Drink = {
  id: string;
  name: string;
  category: Category;
  description: string;
  recipe: RecipeItem[];
  method?: string;
};

export const categories: Category[] = ['Real Cocktails', 'College Cocktails'];
export const ingredients = rawCatalog.ingredients as Ingredient[];
export const drinks = rawCatalog.drinks as Drink[];
export const trackedIngredients = ingredients.filter((ingredient) =>
  drinks.some((drink) => drink.recipe.some((item) =>
    item.ingredient === ingredient.id && !item.optional,
  )),
);

export function requiredIngredientIds(drink: Drink): string[] {
  return drink.recipe.filter((item) => !item.optional).map((item) => item.ingredient);
}

export function visibleDrinks(unavailable: ReadonlySet<string>): Drink[] {
  return drinks.filter((drink) =>
    requiredIngredientIds(drink).every((ingredient) => !unavailable.has(ingredient)),
  );
}

export function affectedDrinkCount(ingredientId: string): number {
  return drinks.filter((drink) => requiredIngredientIds(drink).includes(ingredientId)).length;
}
