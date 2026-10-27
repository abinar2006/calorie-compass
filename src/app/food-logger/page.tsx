'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/Toast';
import {
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowRight,
  RefreshCw,
  Search,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { MealCategory } from '@/lib/supabase/types';
import { VisionAnalysisResponse, DetectedFoodItem } from '@/app/api/ai/vision/route';

export default function FoodLoggerPage() {
  const router = useRouter();
  const { addFoodLog } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResponse | null>(null);

  // Editable fields before saving
  const [mealCategory, setMealCategory] = useState<MealCategory>('lunch');
  const [customMealName, setCustomMealName] = useState('');
  const [editableItems, setEditableItems] = useState<DetectedFoodItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      showToast('Please select a valid image (JPEG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB.', 'error');
      return;
    }

    setFileObject(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setAnalysisResult(null);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setFileObject(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let res: Response;

      if (fileObject) {
        const formData = new FormData();
        formData.append('image', fileObject);
        res = await fetch('/api/ai/vision', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/ai/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: selectedImage,
            mimeType: 'image/jpeg',
          }),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Vision analysis failed');
      }

      const data: VisionAnalysisResponse = await res.json();
      setAnalysisResult(data);
      setCustomMealName(data.mealName);
      setEditableItems(data.items);
      showToast(`Detected: ${data.mealName}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(msg);
      showToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update item field
  const handleItemChange = (index: number, field: keyof DetectedFoodItem, value: any) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditableItems(editableItems.filter((_, idx) => idx !== index));
  };

  // Recalculate totals from editable items
  const totalCalories = editableItems.reduce((s, i) => s + (Number(i.calories) || 0), 0);
  const totalProtein = editableItems.reduce((s, i) => s + (Number(i.proteinG) || 0), 0);
  const totalCarbs = editableItems.reduce((s, i) => s + (Number(i.carbsG) || 0), 0);
  const totalFat = editableItems.reduce((s, i) => s + (Number(i.fatG) || 0), 0);

  const handleSaveToLog = async () => {
    if (!customMealName.trim()) {
      showToast('Please provide a meal title.', 'error');
      return;
    }
    if (editableItems.length === 0) {
      showToast('At least one food item is required.', 'error');
      return;
    }

    setIsSaving(true);
    const res = await addFoodLog({
      food_name: customMealName,
      meal_category: mealCategory,
      serving_size: 1,
      serving_unit: 'plate / serving',
      quantity: 1,
      calories: totalCalories,
      protein_g: Number(totalProtein.toFixed(1)),
      carbs_g: Number(totalCarbs.toFixed(1)),
      fat_g: Number(totalFat.toFixed(1)),
      source: 'ai_vision',
      image_url: selectedImage && selectedImage.length < 50000 ? selectedImage : null,
      notes: `Decomposed from: ${editableItems.map((i) => `${i.name} (${i.servingSize})`).join(', ')}`,
      logged_at: new Date().toISOString(),
    });
    setIsSaving(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast(`Logged "${customMealName}" (${totalCalories} kcal) to today's ledger!`, 'success');
      router.push('/dashboard');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Computer Vision Nutrition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Vision Food Logger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Capture or upload a food photograph to decompose ingredients, portions, and estimated macronutrients.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* UPLOAD & PREVIEW COLUMN */}
          <div className="space-y-4">
            <div className="glass-card rounded-3xl p-6 border border-slate-800">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700/80 hover:border-teal-500/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-900/60 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Take Photo or Upload Image</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                    Supports JPEG, PNG, and WebP from your mobile camera or device storage (Max 10MB)
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors">
                    <Upload className="w-4 h-4 text-teal-400" />
                    <span>Select Food Photo</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-80 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Food preview"
                      className="w-full h-full object-cover max-h-80"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-xs text-slate-200 font-medium transition-colors border border-white/10"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 backdrop-blur-md text-rose-300 transition-colors border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Decomposing Meal through Vision AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Meal Nutrition</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Sample Photo Helper */}
              {!selectedImage && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <p className="text-[11px] text-slate-400 mb-2">Want to try a quick test sample without taking a photo?</p>
                  <button
                    type="button"
                    onClick={() => {
                      // Demo base64 sample
                      setSelectedImage(
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230f172a"/><circle cx="200" cy="150" r="100" fill="%23064e3b"/><text x="200" y="150" fill="%23a7f3d0" font-size="16" text-anchor="middle" alignment-baseline="middle">Sample Grilled Chicken &amp; Salad</text></svg>'
                      );
                    }}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium underline"
                  >
                    Load Sample Mediterranean Plate
                  </button>
                </div>
              )}
            </div>

            {/* Fallback to manual search link */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Prefer entering food text or barcode?</span>
              <Link
                href="/food-search"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>Manual Food Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RESULTS & REVIEW COLUMN */}
          <div className="space-y-4">
            {analysisResult ? (
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wide">
                      AI Analysis Detected
                    </span>
                    <h3 className="text-lg font-bold text-white">Review & Correct Meal</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                    {analysisResult.confidenceScore}% Confidence
                  </span>
                </div>

                {/* Meal Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Meal Title</label>
                    <input
                      type="text"
                      value={customMealName}
                      onChange={(e) => setCustomMealName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Meal Category</label>
                    <select
                      value={mealCategory}
                      onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack / Beverage</option>
                    </select>
                  </div>
                </div>

                {/* Decomposed Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Identified Plate Components</span>
                    <span className="text-[11px] text-slate-500">Edit portions or values as needed</span>
                  </div>

                  <div className="space-y-2.5">
                    {editableItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            className="bg-transparent text-xs font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-teal-500 focus:outline-none flex-1 mr-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Serving</span>
                            <input
                              type="text"
                              value={item.servingSize}
                              onChange={(e) => handleItemChange(idx, 'servingSize', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-[11px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Calories</span>
                            <input
                              type="number"
                              value={item.calories}
                              onChange={(e) => handleItemChange(idx, 'calories', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-[11px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-400 block">Protein (g)</span>
                            <input
                              type="number"
                              step="0.1"
                              value={item.proteinG}
                              onChange={(e) => handleItemChange(idx, 'proteinG', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-[11px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-cyan-400 block">Carbs (g)</span>
                            <input
                              type="number"
                              step="0.1"
                              value={item.carbsG}
                              onChange={(e) => handleItemChange(idx, 'carbsG', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Macro summary banner */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Plate Energy</span>
                    <p className="text-2xl font-black text-emerald-300">{totalCalories} kcal</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400 font-semibold">P: {totalProtein.toFixed(1)}g</span>
                    <span className="text-cyan-400 font-semibold">C: {totalCarbs.toFixed(1)}g</span>
                    <span className="text-amber-400 font-semibold">F: {totalFat.toFixed(1)}g</span>
                  </div>
                </div>

                {/* Uncertainty Disclaimer */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>{analysisResult.disclaimer}</p>
                </div>

                {/* Confirm Save Button */}
                <button
                  type="button"
                  onClick={handleSaveToLog}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Logging Meal...' : 'Save to Today\'s Food Log'}</span>
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Awaiting Food Photo</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Upload an image of your meal to decompose foods, serving sizes, and macronutrients automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
