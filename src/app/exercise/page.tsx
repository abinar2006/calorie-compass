'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/components/Toast';
import {
  Activity,
  Flame,
  Clock,
  Scale,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Info,
  Calendar,
} from 'lucide-react';
import {
  EXERCISE_LIBRARY,
  ExerciseActivity,
  calculateCaloriesBurned,
  searchActivities,
} from '@/lib/calculations/exercise';
import { ExerciseCategory } from '@/lib/supabase/types';

export default function ExerciseLedgerPage() {
  const { profile, exerciseLogs, addExerciseLog, deleteExerciseLog } = useAuth();
  const { showToast } = useToast();

  const userWeight = profile?.weight_kg || 70;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ExerciseActivity>(EXERCISE_LIBRARY[1]); // Default brisk walk
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(userWeight);
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  React.useEffect(() => {
    setLogDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Custom activity entry toggle
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ExerciseCategory>('cardio');
  const [customMET, setCustomMET] = useState<number>(6.0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredActivities = searchActivities(searchQuery);

  // Compute live estimated calorie burn
  const activeMET = isCustomMode ? customMET : selectedActivity.met;
  const estimatedBurn = calculateCaloriesBurned({
    met: Number(activeMET) || 1,
    weightKg: Number(weightKg) || userWeight,
    durationMinutes: Number(durationMinutes) || 0,
  });

  const handleLogExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    if (durationMinutes <= 0) {
      showToast('Duration must be greater than 0 minutes.', 'error');
      return;
    }

    const activityName = isCustomMode ? customName.trim() : selectedActivity.name;
    if (!activityName) {
      showToast('Activity name is required.', 'error');
      return;
    }

    setIsLogging(true);
    const res = await addExerciseLog({
      activity_name: activityName,
      category: isCustomMode ? customCategory : selectedActivity.category,
      met_value: Number(activeMET),
      duration_minutes: Number(durationMinutes),
      weight_used_kg: Number(weightKg),
      calories_burned: estimatedBurn,
      logged_at: `${logDate}T${new Date().toTimeString().split(' ')[0]}Z`,
      notes: notes.trim() || null,
    });
    setIsLogging(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast(`Logged "${activityName}" (${estimatedBurn} kcal burned)!`, 'success');
      setNotes('');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteExerciseLog(deleteTarget.id);
    setIsDeleting(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast(`Removed "${deleteTarget.name}" from exercise ledger.`, 'info');
      setDeleteTarget(null);
    }
  };

  // Total burned across all logs
  const totalBurnedAllTime = exerciseLogs.reduce((s, i) => s + i.calories_burned, 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Metabolic Equivalent Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Activity Ledger — Exercise Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Standard clinical MET energy expenditure: <code>Calories = MET × 3.5 × weight / 200 × minutes</code>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{totalBurnedAllTime} total kcal logged</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* EXERCISE SELECTION & LOGGING (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold text-white">Record Physical Activity</h2>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  {isCustomMode ? 'Choose from Catalog' : '+ Custom Activity / MET'}
                </button>
              </div>

              {!isCustomMode ? (
                /* Activity Search & Catalog */
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search activities (e.g. Running, Walking, Swimming, Badminton...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {filteredActivities.map((act) => {
                      const isSelected = selectedActivity.id === act.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => setSelectedActivity(act)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-500/50 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                          }`}
                        >
                          <div className="overflow-hidden pr-2">
                            <p className="text-xs font-bold text-white truncate">{act.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{act.description}</p>
                          </div>
                          <span className="text-xs font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">
                            {act.met} MET
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Custom Activity Form */
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Custom Activity Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mountain Hiking, Rock Climbing"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Category</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as ExerciseCategory)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="cardio">Cardio</option>
                        <option value="strength">Strength Training</option>
                        <option value="sports">Competitive Sports</option>
                        <option value="daily_life">Daily Work / Chores</option>
                        <option value="flexibility">Flexibility & Mind-Body</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Assigned MET Value</label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      max={25}
                      value={customMET}
                      onChange={(e) => setCustomMET(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Light: 2.0 - 3.5 | Moderate: 3.5 - 6.0 | Vigorous: 6.0 - 12.0+
                    </p>
                  </div>
                </div>
              )}

              {/* DURATION, WEIGHT & DATE INPUTS */}
              <form onSubmit={handleLogExercise} className="space-y-4 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Duration (minutes)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={480}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Weight Used (kg)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={25}
                      max={300}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Date</span>
                    </label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Workout Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunny weather, felt strong throughout"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* COMPUTED BURN CARD */}
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400">Calculated Energy Expenditure</span>
                    <p className="text-2xl font-black text-cyan-300">
                      {estimatedBurn} <span className="text-xs font-normal text-slate-400">kcal burned</span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLogging}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLogging ? 'Logging...' : 'Save to Ledger'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RECENT EXERCISE LOGS (1 COL) */}
          <div className="space-y-4">
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Exercise History</h3>
                <span className="text-xs text-slate-400">{exerciseLogs.length} sessions</span>
              </div>

              {exerciseLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No exercise sessions recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {exerciseLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{log.activity_name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{log.duration_minutes} mins</span>
                          <span>•</span>
                          <span>{log.met_value} MET</span>
                          <span>•</span>
                          <span>{new Date(log.logged_at).toLocaleDateString()}</span>
                        </div>
                        {log.notes && <p className="text-[10px] text-slate-500 italic mt-0.5">{log.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-cyan-300">{log.calories_burned} kcal</span>
                        <button
                          onClick={() => setDeleteTarget({ id: log.id, name: log.activity_name })}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
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

            {/* Scientific explanation card */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                1 MET represents resting metabolic rate (approx 3.5 ml O₂ / kg / min). Expenditure estimates are non-clinical approximations and do not automatically inflate calorie budgets unless configured.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Workout Entry"
        description={`Remove "${deleteTarget?.name}" from your activity ledger?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}
