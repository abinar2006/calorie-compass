'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/Toast';
import {
  Search,
  Barcode,
  Plus,
  Utensils,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Flame,
  Clock,
  Layers,
} from 'lucide-react';
import { MealCategory } from '@/lib/supabase/types';
import { NormalizedFoodItem } from '@/app/api/nutrition/search/route';

function FoodSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams?.get('category') as MealCategory) || 'breakfast';

  const { addFoodLog } = useAuth();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NormalizedFoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<NormalizedFoodItem | null>(null);

  // Selected meal details
  const [quantity, setQuantity] = useState(1);
  const [mealCategory, setMealCategory] = useState<MealCategory>(initialCategory);
  const [customServingUnit, setCustomServingUnit] = useState('');
  const [logDate, setLogDate] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Manual Custom Entry Form State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(200);
  const [customProtein, setCustomProtein] = useState<number>(10);
  const [customCarbs, setCustomCarbs] = useState<number>(25);
  const [customFat, setCustomFat] = useState<number>(5);

  // Initial load with curated items
  useEffect(() => {
    setLogDate(new Date().toISOString().split('T')[0]);
    fetchResults('');
  }, []);

  const fetchResults = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.items || []);
      }
    } catch (err) {
      console.warn('Food search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(query);
  };

  const handleBarcodeLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/nutrition/barcode?code=${encodeURIComponent(barcode.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setSelectedFood(data.product);
          setCustomServingUnit(data.product.servingUnit);
          showToast(`Found: ${data.product.name}`, 'success');
        }
      } else {
        showToast('Barcode not found in Open Food Facts database.', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Barcode scan failed', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (item: NormalizedFoodItem) => {
    setSelectedFood(item);
    setCustomServingUnit(item.servingUnit);
    setIsCustomMode(false);
  };

  const handleLogFood = async () => {
    if (isCustomMode) {
      if (!customName.trim()) {
        showToast('Please provide a name for the custom food.', 'error');
        return;
      }

      setIsLogging(true);
      const res = await addFoodLog({
        food_name: customName,
        meal_category: mealCategory,
        serving_size: 1,
        serving_unit: customServingUnit || 'serving',
        quantity: Number(quantity) || 1,
        calories: Math.round(customCalories * (Number(quantity) || 1)),
        protein_g: Number((customProtein * (Number(quantity) || 1)).toFixed(1)),
        carbs_g: Number((customCarbs * (Number(quantity) || 1)).toFixed(1)),
        fat_g: Number((customFat * (Number(quantity) || 1)).toFixed(1)),
        source: 'manual',
        image_url: null,
        notes: 'Custom manual entry',
        logged_at: `${logDate}T${new Date().toTimeString().split(' ')[0]}Z`,
      });
      setIsLogging(false);

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast(`Logged "${customName}" to ${mealCategory}!`, 'success');
        router.push('/dashboard');
      }
    } else if (selectedFood) {
      setIsLogging(true);
      const totalKcal = Math.round(selectedFood.calories * (Number(quantity) || 1));
      const totalProt = Number((selectedFood.proteinG * (Number(quantity) || 1)).toFixed(1));
      const totalCarb = Number((selectedFood.carbsG * (Number(quantity) || 1)).toFixed(1));
      const totalF = Number((selectedFood.fatG * (Number(quantity) || 1)).toFixed(1));

      const res = await addFoodLog({
        food_name: selectedFood.name,
        meal_category: mealCategory,
        serving_size: selectedFood.servingSize,
        serving_unit: customServingUnit || selectedFood.servingUnit,
        quantity: Number(quantity) || 1,
        calories: totalKcal,
        protein_g: totalProt,
        carbs_g: totalCarb,
        fat_g: totalF,
        source: selectedFood.source === 'openfoodfacts' ? 'openfoodfacts' : 'usda',
        image_url: selectedFood.imageUrl || null,
        notes: selectedFood.brand ? `Brand: ${selectedFood.brand}` : null,
        logged_at: `${logDate}T${new Date().toTimeString().split(' ')[0]}Z`,
      });
      setIsLogging(false);

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast(`Logged "${selectedFood.name}" to ${mealCategory}!`, 'success');
        router.push('/dashboard');
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Search className="w-3.5 h-3.5" />
              <span>Nutrition Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Food Lookup & Manual Logger
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified nutritional database querying USDA FoodData Central and Open Food Facts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              setSelectedFood(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{isCustomMode ? 'Return to Search' : 'Create Custom Food'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SEARCH & RESULTS (2 COLS) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Search inputs */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search whole foods or packaged items (e.g. Oatmeal, Chicken breast, Chobani...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </button>
              </form>

              {/* Barcode scanner input */}
              <form onSubmit={handleBarcodeLookup} className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Enter packaging barcode (EAN / UPC)"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors shrink-0"
                >
                  Lookup Code
                </button>
              </form>
            </div>

            {/* Results list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Database Results ({searchResults.length})</span>
                <span className="text-[11px] text-slate-500">USDA + Open Food Facts verified</span>
              </div>

              {isSearching ? (
                <div className="py-12 text-center glass-card rounded-2xl border border-slate-800">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Searching global nutrition databases...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center glass-card rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400 mb-2">No matching items found for &quot;{query}&quot;.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMode(true);
                      setCustomName(query);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    + Enter custom nutritional info for &quot;{query}&quot;
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {searchResults.map((item) => {
                    const isSelected = selectedFood?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectFood(item)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                            : 'glass-card hover:bg-slate-900/80 border-slate-800/80'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</h3>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {item.source}
                            </span>
                          </div>
                          {item.brand && <p className="text-[11px] text-slate-400">{item.brand}</p>}
                          <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1">
                            <span>Serving: {item.servingUnit}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">P: {item.proteinG}g</span>
                            <span className="text-cyan-400 font-medium">C: {item.carbsG}g</span>
                            <span className="text-amber-400 font-medium">F: {item.fatG}g</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-white">{item.calories} <span className="text-[10px] text-slate-400 font-normal">kcal</span></p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 inline-block ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* LOGGING DETAILS SIDEBAR (1 COL) */}
          <div className="space-y-4">
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 sticky top-20">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                  Log Entry Details
                </span>
                <h3 className="text-base font-bold text-white">
                  {isCustomMode
                    ? 'Custom Nutritional Entry'
                    : selectedFood
                    ? selectedFood.name
                    : 'Select a Food Item'}
                </h3>
              </div>

              {isCustomMode ? (
                /* Custom Entry Form */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Food Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grandma's Lentil Soup"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Serving Unit</label>
                      <input
                        type="text"
                        placeholder="bowl / slice"
                        value={customServingUnit}
                        onChange={(e) => setCustomServingUnit(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-emerald-400 font-medium block mb-1">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-cyan-400 font-medium block mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-amber-400 font-medium block mb-1">Fat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customFat}
                        onChange={(e) => setCustomFat(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : selectedFood ? (
                /* Selected Item Macro Preview */
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Base Energy:</span>
                    <span className="font-bold text-white">
                      {selectedFood.calories * quantity} kcal
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500">Protein</span>
                      <p className="text-xs font-bold text-emerald-400">
                        {(selectedFood.proteinG * quantity).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Carbs</span>
                      <p className="text-xs font-bold text-cyan-400">
                        {(selectedFood.carbsG * quantity).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Fat</span>
                      <p className="text-xs font-bold text-amber-400">
                        {(selectedFood.fatG * quantity).toFixed(1)}g
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Select an item from the search list or click &quot;Create Custom Food&quot; above.
                </p>
              )}

              {/* Meal Category & Servings Input */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Meal Category</label>
                  <select
                    value={mealCategory}
                    onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack / Beverage</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Number of Servings</label>
                    <input
                      type="number"
                      min={0.25}
                      step={0.25}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Date</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Log Button */}
              <button
                type="button"
                onClick={handleLogFood}
                disabled={(!selectedFood && !isCustomMode) || isLogging}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLogging ? 'Recording...' : 'Add to Food Log'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function FoodSearchPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="py-20 text-center text-slate-400">Loading food database...</div>
        </AppLayout>
      }
    >
      <FoodSearchContent />
    </Suspense>
  );
}
