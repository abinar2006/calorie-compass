'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/Toast';
import {
  History,
  Calendar,
  Utensils,
  Activity,
  Flame,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { MealCategory } from '@/lib/supabase/types';

export default function HistoryPage() {
  const { profile, foodLogs, exerciseLogs, deleteFoodLog, deleteExerciseLog } = useAuth();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'foods' | 'exercise'>('all');

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'food' | 'exercise'; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter logs by selected date
  const filteredFoods = foodLogs.filter((f) => f.logged_at.startsWith(selectedDate));
  const filteredExercises = exerciseLogs.filter((e) => e.logged_at.startsWith(selectedDate));

  const totalCaloriesConsumed = filteredFoods.reduce((s, i) => s + i.calories, 0);
  const totalCaloriesBurned = filteredExercises.reduce((s, i) => s + i.calories_burned, 0);
  const totalProtein = filteredFoods.reduce((s, i) => s + i.protein_g, 0);
  const totalCarbs = filteredFoods.reduce((s, i) => s + i.carbs_g, 0);
  const totalFat = filteredFoods.reduce((s, i) => s + i.fat_g, 0);

  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
  const targetCalories = profile?.target_calories || 2200;

  // Day navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    if (deleteTarget.type === 'food') {
      const res = await deleteFoodLog(deleteTarget.id);
      if (res.error) showToast(res.error, 'error');
      else showToast(`Removed ${deleteTarget.name} from food history.`, 'info');
    } else {
      const res = await deleteExerciseLog(deleteTarget.id);
      if (res.error) showToast(res.error, 'error');
      else showToast(`Removed ${deleteTarget.name} from exercise history.`, 'info');
    }

    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const mealCategories: { key: MealCategory; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' },
    { key: 'snack', label: 'Snacks', icon: '🍎' },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <History className="w-3.5 h-3.5" />
              <span>Historical Ledgers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Food & Exercise History
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Review, filter, and audit nutritional consumption and exercise expenditure over time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/food-search"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Meal</span>
            </Link>
            <Link
              href="/exercise"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Exercise</span>
            </Link>
          </div>
        </div>

        {/* DATE PICKER & QUICK CONTROLS BAR */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium"
            >
              Today
            </button>
          </div>

          {/* VIEW FILTER TABS */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('foods')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'foods'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meals ({filteredFoods.length})
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'exercise'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Exercise ({filteredExercises.length})
            </button>
          </div>
        </div>

        {/* DAY SUMMARY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span>Intake</span>
            </div>
            <p className="text-xl font-bold text-white">{totalCaloriesConsumed} kcal</p>
            <p className="text-[10px] text-slate-500">{filteredFoods.length} logged items</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Burned</span>
            </div>
            <p className="text-xl font-bold text-white">{totalCaloriesBurned} kcal</p>
            <p className="text-[10px] text-slate-500">{filteredExercises.length} sessions</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Net Energy</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{netCalories} kcal</p>
            <p className="text-[10px] text-slate-500">Consumed - Burned</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Macros</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold mt-1">
              <span className="text-emerald-400">P:{Math.round(totalProtein)}g</span>
              <span className="text-cyan-400">C:{Math.round(totalCarbs)}g</span>
              <span className="text-amber-400">F:{Math.round(totalFat)}g</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Daily totals</p>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="space-y-6">
          {/* FOOD LOGS SECTION */}
          {(activeTab === 'all' || activeTab === 'foods') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Logged Meals for {selectedDate}</h2>
                </div>
                <span className="text-xs text-slate-400">{filteredFoods.length} items</span>
              </div>

              {filteredFoods.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500 mb-2">No meals logged for this date.</p>
                  <Link
                    href={`/food-search?date=${selectedDate}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    + Add a food entry for this date
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealCategories.map((cat) => {
                    const catFoods = filteredFoods.filter((f) => f.meal_category === cat.key);
                    if (catFoods.length === 0) return null;

                    return (
                      <div key={cat.key} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{cat.label}</h3>
                          </div>
                          <span className="text-xs text-slate-400 font-semibold">
                            {catFoods.reduce((s, i) => s + i.calories, 0)} kcal
                          </span>
                        </div>

                        <div className="space-y-2">
                          {catFoods.map((food) => (
                            <div
                              key={food.id}
                              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-4"
                            >
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-white truncate">{food.food_name}</p>
                                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                                    {food.source}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  <span>{food.quantity} × {food.serving_unit}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400">P: {food.protein_g}g</span>
                                  <span className="text-cyan-400">C: {food.carbs_g}g</span>
                                  <span className="text-amber-400">F: {food.fat_g}g</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs font-black text-white">{food.calories} kcal</span>
                                <button
                                  onClick={() => setDeleteTarget({ id: food.id, type: 'food', name: food.food_name })}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* EXERCISE LOGS SECTION */}
          {(activeTab === 'all' || activeTab === 'exercise') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">Exercise Sessions for {selectedDate}</h2>
                </div>
                <span className="text-xs text-slate-400">{filteredExercises.length} sessions</span>
              </div>

              {filteredExercises.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500 mb-2">No exercise recorded for this date.</p>
                  <Link
                    href="/exercise"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    + Log an activity session
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{ex.activity_name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {ex.duration_minutes} mins
                          </span>
                          <span>•</span>
                          <span>MET: {ex.met_value}</span>
                          <span>•</span>
                          <span>Weight: {ex.weight_used_kg}kg</span>
                        </div>
                        {ex.notes && <p className="text-[10px] text-slate-500 italic mt-1">{ex.notes}</p>}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-black text-cyan-300">{ex.calories_burned} kcal</span>
                        <button
                          onClick={() => setDeleteTarget({ id: ex.id, type: 'exercise', name: ex.activity_name })}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete workout"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
        description={`Permanently remove "${deleteTarget?.name}" from your historical log?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}
