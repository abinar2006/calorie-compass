'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Camera,
  Activity,
  Sparkles,
  ArrowRight,
  Calculator,
  ChevronRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { calculateTDEE, Gender, ActivityLevel, FitnessGoal } from '@/lib/calculations/bmr';

export default function LandingPage() {
  // Live quick calculator preview state
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [activity, setActivity] = useState<ActivityLevel>('moderately_active');
  const [goal, setGoal] = useState<FitnessGoal>('weight_loss');

  const previewResult = calculateTDEE({
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel: activity,
    fitnessGoal: goal,
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Calorie Compass</span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                AI Health Suite
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Intelligent Nutrition & Activity Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none mb-6">
            Navigate Your Nutrition With <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Precision AI Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Decompose meals through computer vision, compute clinical Mifflin-St Jeor TDEE metrics, log MET exercise burns, and synthesize custom chef recipes tailored to your calorie target.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <span>Launch Live Dashboard</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/food-logger"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 text-emerald-400" />
              <span>Test AI Vision Logger</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 CORE MODULE SPOTLIGHTS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-900 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Complete Nutritional Clarity
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              The four foundational pillars of modern, evidence-based energy balance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Module 1 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Profile & Mifflin-St Jeor</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Calculates clinical Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) with activity multipliers and safe boundaries.
              </p>
            </div>

            {/* Module 2 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. AI Vision Food Logger</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Upload or snap meal photos to identify ingredients, estimate portions, calculate macros, and log with full manual editing fallbacks.
              </p>
            </div>

            {/* Module 3 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Activity Ledger (METs)</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Standard clinical MET calculation: calories burned = MET × 3.5 × weight / 200 × minutes with a comprehensive exercise catalog.
              </p>
            </div>

            {/* Module 4 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Generative AI Recipes</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Transforms remaining fridge ingredients into chef-quality recipes tailored to dietary preferences, allergies, and remaining calories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE PREVIEW CALCULATOR */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Interactive Calorie Engine</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Instant Mifflin-St Jeor calculation based on your biological parameters
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="male">Male (+5 constant)</option>
                      <option value="female">Female (-161 constant)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Age (years)</label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value) || 20)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      min={100}
                      max={250}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value) || 160)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      min={30}
                      max={300}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value) || 60)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Activity Level</label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="sedentary">Sedentary (1.2× multiplier)</option>
                    <option value="lightly_active">Lightly Active (1.375× multiplier)</option>
                    <option value="moderately_active">Moderately Active (1.55× multiplier)</option>
                    <option value="very_active">Very Active (1.725× multiplier)</option>
                    <option value="extra_active">Extra Active (1.9× multiplier)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="weight_loss">Weight Loss (-400 kcal deficit)</option>
                    <option value="maintenance">Maintenance (0 kcal adjustment)</option>
                    <option value="weight_gain">Weight Gain (+350 kcal surplus)</option>
                  </select>
                </div>
              </div>

              {/* Output Display */}
              <div className="flex flex-col justify-between bg-slate-950/60 rounded-2xl p-6 border border-slate-800/80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">Basal Metabolic Rate (BMR)</span>
                    <span className="text-lg font-bold text-white">{previewResult.bmr} kcal</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">Daily Energy Need (TDEE)</span>
                    <span className="text-lg font-bold text-cyan-400">{previewResult.tdee} kcal</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                        Target Calorie Budget
                      </span>
                      <span className="text-2xl font-black text-emerald-300">
                        {previewResult.targetCalories} kcal
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {goal === 'weight_loss' ? 'Healthy conservative deficit' : goal === 'weight_gain' ? 'Lean mass building' : 'Maintenance balance'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-slate-400 text-[10px]">Protein</p>
                      <p className="font-bold text-emerald-400">{previewResult.macroRecommendations.proteinGrams}g</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-slate-400 text-[10px]">Carbs</p>
                      <p className="font-bold text-cyan-400">{previewResult.macroRecommendations.carbsGrams}g</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-slate-400 text-[10px]">Fat</p>
                      <p className="font-bold text-amber-400">{previewResult.macroRecommendations.fatGrams}g</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 rounded-xl text-center text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  Save Profile & Begin Tracking →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-slate-400">
            <strong>Calorie Compass</strong> — Evidence-based nutrition & physical expenditure platform.
          </p>
          <p className="max-w-2xl mx-auto text-[11px] text-slate-600">
            Clinical Disclaimer: BMR and TDEE figures are mathematical estimates derived from the Mifflin–St Jeor formula and standard physical activity multipliers. They do not constitute clinical or medical diagnosis. Consult a licensed healthcare physician for personalized medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
