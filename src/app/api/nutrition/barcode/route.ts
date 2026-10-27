import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('code')?.trim();

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`, {
      headers: {
        'User-Agent': 'CalorieCompass - Web - Version 1.0 (academic/student project)',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Product not found on Open Food Facts' }, { status: 404 });
    }

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ error: 'Product not found in Open Food Facts database' }, { status: 404 });
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const calories = Math.round(
      nutriments['energy-kcal_100g'] ??
      nutriments['energy-kcal'] ??
      (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)
    );

    return NextResponse.json({
      product: {
        id: `off_barcode_${p.code}`,
        name: p.product_name || p.generic_name || 'Scanned Product',
        brand: p.brands || undefined,
        servingSize: 100,
        servingUnit: p.serving_size || '100g',
        calories,
        proteinG: Number((nutriments.proteins_100g ?? 0).toFixed(1)),
        carbsG: Number((nutriments.carbohydrates_100g ?? 0).toFixed(1)),
        fatG: Number((nutriments.fat_100g ?? 0).toFixed(1)),
        source: 'openfoodfacts',
        imageUrl: p.image_front_small_url || p.image_front_thumb_url || undefined,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Barcode lookup failed' },
      { status: 500 }
    );
  }
}
