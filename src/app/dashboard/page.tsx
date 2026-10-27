'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { CalorieRing } from '@/components/CalorieRing';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/Toast';
import {
  Camera,
  Search,
  Activity,
  Sparkles,
  Utensils,
  Plus,
  Trash2,
  Clock,
  Flame,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { MealCategory } from '@/lib/supabase/types';

export default function DashboardPage() {
  const { user, profile, foodLogs, exerciseLogs, deleteFoodLog, deleteExerciseLog } = useAuth();
  const { showToast } = useToast();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'food' | 'exercise'; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [todayStr, setTodayStr] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setTodayStr(now.toISOString().split('T')[0]);
    setFormattedDate(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  // Compute today's logs
  const todayFoods = todayStr ? foodLogs.filter((f) => f.logged_at.startsWith(todayStr)) : [];
  const todayExercises = todayStr ? exerciseLogs.filter((e) => e.logged_at.startsWith(todayStr)) : [];

  const consumedCalories = todayFoods.reduce((sum, item) => sum + item.calories, 0);
  const burnedCalories = todayExercises.reduce((sum, item) => sum + item.calories_burned, 0);
  const totalProtein = todayFoods.reduce((sum, item) => sum + item.protein_g, 0);
  const totalCarbs = todayFoods.reduce((sum, item) => sum + item.carbs_g, 0);
  const totalFat = todayFoods.reduce((sum, item) => sum + item.fat_g, 0);

  const targetCalories = profile?.target_calories || 2200;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    if (deleteTarget.type === 'food') {
      const res = await deleteFoodLog(deleteTarget.id);
      if (res.error) showToast(res.error, 'error');
      else showToast(`Removed ${deleteTarget.name} from food log.`, 'info');
    } else {
      const res = await deleteExerciseLog(deleteTarget.id);
      if (res.error) showToast(res.error, 'error');
      else showToast(`Removed ${deleteTarget.name} from exercise log.`, 'info');
    }

    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const mealCategories: { key: MealCategory; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' },
    { key: 'snack', label: 'Snacks & Beverages', icon: '🍎' },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Daily Health Snapshot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hello, {profile?.full_name || user?.email?.split('@')[0] || 'Friend'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/food-logger"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Meal</span>
            </Link>
            <Link
              href="/food-search"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Log Food</span>
            </Link>
          </div>
        </div>

        {/* CALORIE RING COMPONENT */}
        <CalorieRing
          targetCalories={targetCalories}
          consumedCalories={consumedCalories}
          burnedCalories={burnedCalories}
          proteinG={Math.round(totalProtein)}
          carbsG={Math.round(totalCarbs)}
          fatG={Math.round(totalFat)}
        />

        {/* QUICK NAVIGATION ACTION CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/food-logger"
            className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white mb-0.5">AI Vision Scan</h2>
            <p className="text-[11px] text-slate-400">Photo meal analysis</p>
          </Link>

          <Link
            href="/food-search"
            className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white mb-0.5">Food Lookup</h2>
            <p className="text-[11px] text-slate-400">USDA & OpenFoodFacts</p>
          </Link>

          <Link
            href="/exercise"
            className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white mb-0.5">Exercise Ledger</h2>
            <p className="text-[11px] text-slate-400">MET burn calculations</p>
          </Link>

          <Link
            href="/recipes"
            className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white mb-0.5">AI Recipe Lab</h2>
            <p className="text-[11px] text-slate-400">Leftover meal synthesis</p>
          </Link>
        </div>

        {/* TODAY'S MEALS BREAKDOWN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Today&apos;s Nutrition Ledger</h2>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Full History</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealCategories.map((cat) => {
              const catFoods = todayFoods.filter((f) => f.meal_category === cat.key);
              const catCalories = catFoods.reduce((s, i) => s + i.calories, 0);

              return (
                <div key={cat.key} className="glass-card rounded-2xl p-5 border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <h3 className="text-sm font-bold text-white">{cat.label}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                      {catCalories} kcal
                    </span>
                  </div>

                  {catFoods.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-xs text-slate-500 mb-2">No items logged yet</p>
                      <Link
                        href={`/food-search?category=${cat.key}`}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add item</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {catFoods.map((food) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-colors"
                        >
                          <div className="overflow-hidden pr-2">
                            <p className="text-xs font-semibold text-slate-200 truncate">{food.food_name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>
                                {food.quantity} × {food.serving_unit}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-400">P: {food.protein_g}g</span>
                              <span className="text-cyan-400">C: {food.carbs_g}g</span>
                              <span className="text-amber-400">F: {food.fat_g}g</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-white">{food.calories} kcal</span>
                            <button
                              onClick={() => setDeleteTarget({ id: food.id, type: 'food', name: food.food_name })}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TODAY'S EXERCISE ACTIVITY */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Today&apos;s Exercise Sessions</h2>
            </div>
            <Link
              href="/exercise"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Exercise</span>
            </Link>
          </div>

          {todayExercises.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500">No workout sessions recorded for today.</p>
              <Link
                href="/exercise"
                className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <span>Record a session to update active calorie expenditure</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{ex.activity_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {ex.duration_minutes} mins
                      </span>
                      <span>•</span>
                      <span>MET: {ex.met_value}</span>
                      <span>•</span>
                      <span>Weight: {ex.weight_used_kg} kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {ex.calories_burned} kcal
                    </span>
                    <button
                      onClick={() => setDeleteTarget({ id: ex.id, type: 'exercise', name: ex.activity_name })}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                      title="Delete entry"
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

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Removal"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Item"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}
