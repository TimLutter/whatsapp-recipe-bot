import type { Device, Diet, Category } from '../types/recipe.js';

export function generateHashtags(
  device: Device,
  diets: Diet[],
  categories: Category[],
  customTags: string[] = []
): string[] {
  const tags: string[] = [];

  // Device tags
  const deviceMap: Record<Device, string> = {
    airfryer: '#Airfryer',
    thermomix: '#Thermomix',
    microwave: '#Mikrowelle',
    oven: '#Backofen',
    stovetop: '#Herd',
  };
  tags.push(deviceMap[device]);

  // Diet tags
  const dietMap: Record<Diet, string> = {
    'high-protein': '#HighProtein',
    'low-carb': '#LowCarb',
    'keto': '#Keto',
    'vegan': '#Vegan',
    'vegetarian': '#Vegetarisch',
    'paleo': '#Paleo',
  };
  diets.forEach((diet) => tags.push(dietMap[diet]));

  // Category tags
  const categoryMap: Record<Category, string> = {
    '5-ingredients': '#5Zutaten',
    'one-pot': '#OnePot',
    'sheet-pan': '#Ofengericht',
    'quick': '#Schnell',
    'meal-prep': '#MealPrep',
  };
  categories.forEach((cat) => tags.push(categoryMap[cat]));

  // Custom tags
  customTags.forEach((tag) => {
    const formatted = tag.startsWith('#') ? tag : `#${tag}`;
    tags.push(formatted);
  });

  // Common tags
  tags.push('#Rezept', '#Kochen', '#FamFood');

  return Array.from(new Set(tags)); // Remove duplicates
}