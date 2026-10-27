'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/Toast';
import {
  Sparkles,
  Utensils,
  Clock,
  Flame,
  CheckCircle2,
  Bookmark,
  Plus,
  RefreshCw,
  AlertTriangle,
  Trash2,
  ChefHat,
  ChevronRight,
  Info,
} from 'lucide-react';
import { GeneratedRecipe } from '@/app/api/ai/recipe/route';
import { MealCategory } from '@/lib/supabase/types';

const DIETARY_OPTIONS = [
  'High Protein',
  'Low Carb',
  'Mediterranean',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Keto',
  'Balanced',
];

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Gluten / Wheat',
  'Shellfish',
  'Soy',
  'Eggs',
];

export default function RecipeEnginePage() {
  const router = useRouter();
  const { profile, savedRecipes, saveRecipe, deleteSavedRecipe, addFoodLog } = useAuth();
  const { showToast } = useToast();

  // Recipe generation input states
  const [ingredients, setIngredients] = useState('Chicken breast, quinoa, zucchini, olive oil');
  const [leftovers, setLeftovers] = useState('Cooked brown rice, bell pepper');
  const [selectedDiet, setSelectedDiet] = useState<string[]>(['High Protein']);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [avoidIngredients, setAvoidIngredients] = useState('');
  const [mealType, setMealType] = useState('dinner');
  const [calorieLimit, setCalorieLimit] = useState<number>(profile?.target_calories ? Math.round(profile.target_calories / 3) : 550);
  const [servings, setServings] = useState<number>(2);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<GeneratedRecipe | null>(null);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingMeal, setIsLoggingMeal] = useState(false);
  const [hasLoggedMeal, setHasLoggedMeal] = useState(false);

  // Recipe deletion modal state
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleDiet = (diet: string) => {
    setSelectedDiet((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleGenerate = async () => {
    if (!ingredients.trim() && !leftovers.trim()) {
      showToast('Please specify available ingredients or leftovers.', 'error');
      return;
    }

    setIsGenerating(true);
    setHasLoggedMeal(false);

    try {
      const res = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          leftovers,
          dietaryPreferences: selectedDiet,
          allergies: selectedAllergies,
          avoidIngredients,
          mealType,
          calorieLimit,
          servings,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Recipe synthesis failed');
      }

      const data = await res.json();
      setCurrentRecipe(data.recipe);
      showToast(`Generated: ${data.recipe.title}`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to generate recipe', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!currentRecipe) return;

    setIsSaving(true);
    const res = await saveRecipe({
      title: currentRecipe.title,
      description: currentRecipe.description,
      ingredients: currentRecipe.ingredients,
      instructions: currentRecipe.instructions,
      prep_time_mins: currentRecipe.prepTimeMinutes,
      cook_time_mins: currentRecipe.cookTimeMinutes,
      servings: currentRecipe.servings,
      calories_per_serving: currentRecipe.caloriesPerServing,
      total_calories: currentRecipe.totalCalories,
      protein_g: currentRecipe.proteinG,
      carbs_g: currentRecipe.carbsG,
      fat_g: currentRecipe.fatG,
      dietary_tags: currentRecipe.dietaryTags,
    });
    setIsSaving(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast(`Saved "${currentRecipe.title}" to your recipe book!`, 'success');
    }
  };

  const handleAddToFoodLog = async () => {
    if (!currentRecipe || hasLoggedMeal) return;

    setIsLoggingMeal(true);
    const category: MealCategory =
      mealType === 'breakfast'
        ? 'breakfast'
        : mealType === 'lunch'
        ? 'lunch'
        : mealType === 'snack'
        ? 'snack'
        : 'dinner';

    const res = await addFoodLog({
      food_name: currentRecipe.title,
      meal_category: category,
      serving_size: 1,
      serving_unit: 'portion (1 serving)',
      quantity: 1,
      calories: currentRecipe.caloriesPerServing,
      protein_g: currentRecipe.proteinG,
      carbs_g: currentRecipe.carbsG,
      fat_g: currentRecipe.fatG,
      source: 'ai_recipe',
      image_url: null,
      notes: `AI Chef Recipe (${currentRecipe.prepTimeMinutes + currentRecipe.cookTimeMinutes} mins)`,
      logged_at: new Date().toISOString(),
    });
    setIsLoggingMeal(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      setHasLoggedMeal(true);
      showToast(`Added 1 serving of "${currentRecipe.title}" (${currentRecipe.caloriesPerServing} kcal) to today's food log!`, 'success');
    }
  };

  const handleDeleteSavedConfirm = async () => {
    if (!recipeToDelete) return;
    setIsDeleting(true);
    const res = await deleteSavedRecipe(recipeToDelete.id);
    setIsDeleting(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast(`Removed "${recipeToDelete.title}" from saved recipes.`, 'info');
      setRecipeToDelete(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generative AI Culinary Synthesizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Recipe Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Turn pantry ingredients and leftovers into delicious, macro-balanced recipes tailored to your calorie target.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INPUT FORM (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <ChefHat className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Culinary Parameters</h2>
              </div>

              {/* Ingredients */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Available Ingredients & Pantry Staples
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chicken breast, eggs, spinach, olive oil, sweet potato"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Leftovers */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Leftovers to Repurpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cooked rice, roasted broccoli, half can chickpeas"
                  value={leftovers}
                  onChange={(e) => setLeftovers(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Dietary Focus</label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((diet) => {
                    const isSelected = selectedDiet.includes(diet);
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleDiet(diet)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {diet}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergies to Exclude */}
              <div>
                <label className="text-xs text-rose-300 font-medium block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Strict Allergies to Exclude</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ALLERGIES.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meal Type & Servings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack / Bite</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Servings</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Optional Calorie Target per Serving */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Target Calorie Cap per Serving (kcal)
                </label>
                <input
                  type="number"
                  min={150}
                  max={2000}
                  value={calorieLimit}
                  onChange={(e) => setCalorieLimit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Culinary AI Recipe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Recipe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RECIPE OUTPUT & SAVED RECIPES (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {currentRecipe ? (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {currentRecipe.dietaryTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{currentRecipe.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentRecipe.description}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start shrink-0">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRecipe}
                      disabled={isSaving}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Macro summary pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400">Calories / Serving</span>
                    <p className="text-lg font-black text-white mt-0.5">{currentRecipe.caloriesPerServing} kcal</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-emerald-400 font-semibold">Protein</span>
                    <p className="text-lg font-black text-emerald-300 mt-0.5">{currentRecipe.proteinG}g</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-cyan-400 font-semibold">Carbs</span>
                    <p className="text-lg font-black text-cyan-300 mt-0.5">{currentRecipe.carbsG}g</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-amber-400 font-semibold">Fat</span>
                    <p className="text-lg font-black text-amber-300 mt-0.5">{currentRecipe.fatG}g</p>
                  </div>
                </div>

                {/* Timing & Servings info */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Prep: {currentRecipe.prepTimeMinutes}m | Cook: {currentRecipe.cookTimeMinutes}m
                  </span>
                  <span>•</span>
                  <span>Servings: {currentRecipe.servings}</span>
                </div>

                {/* Ingredients List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Required Ingredients</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentRecipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <span className="text-slate-200 font-medium">{ing.name}</span>
                        <span className="text-purple-300 font-bold">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step by step Instructions */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Preparation Instructions</h4>
                  <ol className="space-y-2 text-xs text-slate-300">
                    {currentRecipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Allergen Notice */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>{currentRecipe.allergenWarning}</p>
                </div>

                {/* Direct Add to Food Log Button */}
                <button
                  type="button"
                  onClick={handleAddToFoodLog}
                  disabled={isLoggingMeal || hasLoggedMeal}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    hasLoggedMeal
                      ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {hasLoggedMeal
                      ? 'Logged to Today\'s Meals ✓'
                      : isLoggingMeal
                      ? 'Logging...'
                      : 'Add 1 Serving to Today\'s Food Log'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-10 border border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[320px]">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Awaiting Culinary Synthesis</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Configure your available ingredients and dietary goals on the left, then click &quot;Generate AI Recipe&quot; to synthesize a custom meal.
                </p>
              </div>
            )}

            {/* SAVED RECIPES SECTION */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Your Saved Recipes</h3>
                </div>
                <span className="text-xs text-slate-400">{savedRecipes.length} recipes</span>
              </div>

              {savedRecipes.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No saved recipes yet. Generate a recipe and click &quot;Save&quot; to bookmark it here.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedRecipes.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="overflow-hidden">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{rec.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{rec.calories_per_serving} kcal/serving</span>
                          <span>•</span>
                          <span className="text-emerald-400">P: {rec.protein_g}g</span>
                          <span className="text-cyan-400">C: {rec.carbs_g}g</span>
                          <span className="text-amber-400">F: {rec.fat_g}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentRecipe({
                              title: rec.title,
                              description: rec.description || '',
                              ingredients: Array.isArray(rec.ingredients) ? (rec.ingredients as any) : [],
                              instructions: Array.isArray(rec.instructions) ? (rec.instructions as any) : [],
                              prepTimeMinutes: rec.prep_time_mins,
                              cookTimeMinutes: rec.cook_time_mins,
                              servings: rec.servings,
                              caloriesPerServing: rec.calories_per_serving,
                              totalCalories: rec.total_calories,
                              proteinG: rec.protein_g,
                              carbsG: rec.carbs_g,
                              fatG: rec.fat_g,
                              dietaryTags: rec.dietary_tags || [],
                              allergenWarning: 'Saved verified culinary recipe.',
                              source: 'culinary_engine',
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecipeToDelete({ id: rec.id, title: rec.title })}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete saved recipe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete saved recipe modal */}
      <Modal
        isOpen={Boolean(recipeToDelete)}
        onClose={() => setRecipeToDelete(null)}
        title="Remove Saved Recipe"
        description={`Are you sure you want to delete "${recipeToDelete?.title}" from your saved recipe collection?`}
        confirmLabel="Delete Recipe"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleDeleteSavedConfirm}
      />
    </AppLayout>
  );
}
