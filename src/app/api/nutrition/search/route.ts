import { NextRequest, NextResponse } from 'next/server';

export interface NormalizedFoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: 'usda' | 'openfoodfacts' | 'verified_catalog';
  imageUrl?: string;
}

// Curated verified foundational foods fallback
const CURATED_FOODS: NormalizedFoodItem[] = [
  { id: 'cur_1', name: 'Boiled Egg (Large)', servingSize: 1, servingUnit: 'large egg (50g)', calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, source: 'verified_catalog' },
  { id: 'cur_2', name: 'Chicken Breast (Skinless, Cooked)', servingSize: 100, servingUnit: 'grams', calories: 165, proteinG: 31.0, carbsG: 0.0, fatG: 3.6, source: 'verified_catalog' },
  { id: 'cur_3', name: 'Brown Rice (Cooked)', servingSize: 1, servingUnit: 'cup (195g)', calories: 218, proteinG: 4.5, carbsG: 45.8, fatG: 1.6, source: 'verified_catalog' },
  { id: 'cur_4', name: 'Rolled Oats (Raw)', servingSize: 50, servingUnit: 'grams (1/2 cup)', calories: 190, proteinG: 6.5, carbsG: 34.0, fatG: 3.0, source: 'verified_catalog' },
  { id: 'cur_5', name: 'Greek Yogurt (Plain, Non-fat)', servingSize: 170, servingUnit: 'container (170g)', calories: 100, proteinG: 17.0, carbsG: 6.0, fatG: 0.7, source: 'verified_catalog' },
  { id: 'cur_6', name: 'Banana (Medium)', servingSize: 1, servingUnit: 'medium (118g)', calories: 105, proteinG: 1.3, carbsG: 27.0, fatG: 0.3, source: 'verified_catalog' },
  { id: 'cur_7', name: 'Avocado (Fresh)', servingSize: 100, servingUnit: 'grams (approx 1/2)', calories: 160, proteinG: 2.0, carbsG: 8.5, fatG: 14.7, source: 'verified_catalog' },
  { id: 'cur_8', name: 'Salmon (Wild Atlantic, Baked)', servingSize: 100, servingUnit: 'grams', calories: 182, proteinG: 25.4, carbsG: 0.0, fatG: 8.1, source: 'verified_catalog' },
  { id: 'cur_9', name: 'Broccoli (Steamed)', servingSize: 1, servingUnit: 'cup chopped (156g)', calories: 55, proteinG: 3.7, carbsG: 11.2, fatG: 0.6, source: 'verified_catalog' },
  { id: 'cur_10', name: 'Peanut Butter (Natural)', servingSize: 2, servingUnit: 'tbsp (32g)', calories: 190, proteinG: 8.0, carbsG: 7.0, fatG: 16.0, source: 'verified_catalog' },
  { id: 'cur_11', name: 'Whole Milk', servingSize: 1, servingUnit: 'cup (244ml)', calories: 149, proteinG: 7.7, carbsG: 11.7, fatG: 8.0, source: 'verified_catalog' },
  { id: 'cur_12', name: 'Almonds (Raw)', servingSize: 28, servingUnit: 'grams (1 oz / ~23 nuts)', calories: 164, proteinG: 6.0, carbsG: 6.1, fatG: 14.2, source: 'verified_catalog' },
  { id: 'cur_13', name: 'Apple (Medium)', servingSize: 1, servingUnit: 'medium (182g)', calories: 95, proteinG: 0.5, carbsG: 25.1, fatG: 0.3, source: 'verified_catalog' },
  { id: 'cur_14', name: 'Sweet Potato (Baked)', servingSize: 1, servingUnit: 'medium (114g)', calories: 103, proteinG: 2.3, carbsG: 23.6, fatG: 0.2, source: 'verified_catalog' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';

  if (!query) {
    return NextResponse.json({ items: CURATED_FOODS.slice(0, 10) });
  }

  const results: NormalizedFoodItem[] = [];

  // 1. Search Open Food Facts (Free public API, ideal for packaged foods and global brands)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=8`;

    const offRes = await fetch(offUrl, {
      headers: {
        'User-Agent': 'CalorieCompass - Web - Version 1.0 (academic/student project)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (offRes.ok) {
      const data = await offRes.json();
      if (Array.isArray(data.products)) {
        for (const p of data.products) {
          const name = p.product_name || p.generic_name;
          if (!name) continue;

          const nutriments = p.nutriments || {};
          const calories = Math.round(
            nutriments['energy-kcal_100g'] ??
            nutriments['energy-kcal'] ??
            (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)
          );
          const protein = Number((nutriments.proteins_100g ?? 0).toFixed(1));
          const carbs = Number((nutriments.carbohydrates_100g ?? 0).toFixed(1));
          const fat = Number((nutriments.fat_100g ?? 0).toFixed(1));

          results.push({
            id: `off_${p.code || Math.random().toString(36).slice(2)}`,
            name: name,
            brand: p.brands || undefined,
            servingSize: 100,
            servingUnit: p.serving_size || '100g',
            calories,
            proteinG: protein,
            carbsG: carbs,
            fatG: fat,
            source: 'openfoodfacts',
            imageUrl: p.image_front_small_url || p.image_front_thumb_url || undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Open Food Facts search error or timeout:', err);
  }

  // 2. Search USDA FoodData Central if API key is present or using DEMO_KEY
  const usdaKey = process.env.USDA_FDC_API_KEY || 'DEMO_KEY';
  if (results.length < 10) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
        query
      )}&pageSize=8&api_key=${usdaKey}`;

      const usdaRes = await fetch(usdaUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (usdaRes.ok) {
        const data = await usdaRes.json();
        if (Array.isArray(data.foods)) {
          for (const f of data.foods) {
            let calories = 0;
            let protein = 0;
            let carbs = 0;
            let fat = 0;

            if (Array.isArray(f.foodNutrients)) {
              for (const n of f.foodNutrients) {
                const nName = (n.nutrientName || '').toLowerCase();
                const val = Number(n.value) || 0;
                if (nName.includes('energy') && (n.unitName === 'KCAL' || !calories)) {
                  calories = Math.round(val);
                } else if (nName.includes('protein')) {
                  protein = Number(val.toFixed(1));
                } else if (nName.includes('carbohydrate')) {
                  carbs = Number(val.toFixed(1));
                } else if (nName.includes('total lipid') || nName === 'fat') {
                  fat = Number(val.toFixed(1));
                }
              }
            }

            results.push({
              id: `usda_${f.fdcId}`,
              name: f.description,
              brand: f.brandOwner || undefined,
              servingSize: f.servingSize || 100,
              servingUnit: f.servingSizeUnit || 'g',
              calories,
              proteinG: protein,
              carbsG: carbs,
              fatG: fat,
              source: 'usda',
            });
          }
        }
      }
    } catch (err) {
      console.warn('USDA API search error or timeout:', err);
    }
  }

  // 3. Fallback matching from curated catalog
  const lowerQuery = query.toLowerCase();
  const catalogMatches = CURATED_FOODS.filter((item) =>
    item.name.toLowerCase().includes(lowerQuery)
  );

  const combined = [...results, ...catalogMatches];

  // Deduplicate by normalized name
  const seen = new Set<string>();
  const uniqueResults: NormalizedFoodItem[] = [];
  for (const item of combined) {
    const key = item.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  return NextResponse.json({
    query,
    count: uniqueResults.length,
    items: uniqueResults.slice(0, 20),
  });
}
