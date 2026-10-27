'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/Toast';
import {
  Gender,
  ActivityLevel,
  FitnessGoal,
  calculateTDEE,
  ACTIVITY_MULTIPLIERS,
} from '@/lib/calculations/bmr';
import {
  User,
  Calculator,
  Save,
  CheckCircle2,
  Info,
  Flame,
  Scale,
  Ruler,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [age, setAge] = useState<number>(profile?.age || 26);
  const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(profile?.height_cm || 178);
  const [weightKg, setWeightKg] = useState<number>(profile?.weight_kg || 74);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activity_level || 'moderately_active'
  );
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(
    profile?.fitness_goal || 'weight_loss'
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAge(profile.age);
      setGender(profile.gender);
      setHeightCm(profile.height_cm);
      setWeightKg(profile.weight_kg);
      setActivityLevel(profile.activity_level);
      setFitnessGoal(profile.fitness_goal);
    }
  }, [profile]);

  // Dynamic live calculation
  const liveCalc = calculateTDEE({
    age: Number(age) || 20,
    gender,
    heightCm: Number(heightCm) || 160,
    weightKg: Number(weightKg) || 60,
    activityLevel,
    fitnessGoal,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (age < 10 || age > 120) {
      showToast('Please enter a valid age between 10 and 120.', 'error');
      return;
    }
    if (heightCm < 50 || heightCm > 260) {
      showToast('Please enter a valid height between 50cm and 260cm.', 'error');
      return;
    }
    if (weightKg < 25 || weightKg > 400) {
      showToast('Please enter a valid weight between 25kg and 400kg.', 'error');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim() || undefined,
      age: Number(age),
      gender,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      activity_level: activityLevel,
      fitness_goal: fitnessGoal,
      bmr: liveCalc.bmr,
      tdee: liveCalc.tdee,
      target_calories: liveCalc.targetCalories,
    });
    setIsSaving(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Profile and calorie targets successfully updated!', 'success');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>Mifflin-St Jeor Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profile & Calorie Goal Setup
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Personal physiological metrics and clinical energy expenditure configuration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM (2 COLS) */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-slate-800">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Account Information */}
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Personal Identity</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Email</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || 'demo@caloriecompass.io'}
                      className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Physiological Metrics */}
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <span>Physiological Inputs</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Biological Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="male">Male (Mifflin +5 constant)</option>
                      <option value="female">Female (Mifflin -161 constant)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Determines the metabolic base constant in the Mifflin-St Jeor equation.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Age (years)</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-slate-400" />
                      <span>Height (cm)</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      max={260}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>Weight (kg)</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min={25}
                      max={400}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lifestyle & Goal */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Activity & Nutritional Strategy</span>
                </h2>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Physical Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label} ({config.multiplier}×) — {config.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Fitness Goal</label>
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="weight_loss">Weight Loss — Conservative -400 kcal deficit</option>
                    <option value="maintenance">Maintenance — 100% TDEE equilibrium</option>
                    <option value="weight_gain">Weight Gain — Conservative +350 kcal lean surplus</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Recalculating & Saving...' : 'Save Profile & Recalculate'}</span>
              </button>
            </form>
          </div>

          {/* REAL-TIME CALCULATION SUMMARY (1 COL) */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>Computed Results</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <p className="text-xs text-slate-400">Basal Metabolic Rate (BMR)</p>
                  <p className="text-2xl font-black text-white mt-0.5">{liveCalc.bmr} <span className="text-xs font-medium text-slate-400">kcal/day</span></p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Energy expended at complete physiological rest.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <p className="text-xs text-slate-400">Total Energy Expenditure (TDEE)</p>
                  <p className="text-2xl font-black text-cyan-400 mt-0.5">{liveCalc.tdee} <span className="text-xs font-medium text-slate-400">kcal/day</span></p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    BMR × {liveCalc.activityMultiplier} activity multiplier.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs font-semibold text-emerald-400 uppercase">Target Daily Calorie Intake</p>
                  <p className="text-3xl font-black text-emerald-300 mt-0.5">{liveCalc.targetCalories} <span className="text-xs font-medium text-slate-400">kcal</span></p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Adjustment: {liveCalc.adjustmentKcal >= 0 ? `+${liveCalc.adjustmentKcal}` : liveCalc.adjustmentKcal} kcal
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Suggested Daily Macros</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Protein</p>
                      <p className="text-base font-bold text-emerald-400">{liveCalc.macroRecommendations.proteinGrams}g</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Carbs</p>
                      <p className="text-base font-bold text-cyan-400">{liveCalc.macroRecommendations.carbsGrams}g</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Fat</p>
                      <p className="text-base font-bold text-amber-400">{liveCalc.macroRecommendations.fatGrams}g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Disclaimer Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Clinical & Physiological Notice</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {liveCalc.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
