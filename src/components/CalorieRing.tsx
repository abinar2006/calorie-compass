'use client';

import React from 'react';
import { Flame, Utensils, Zap } from 'lucide-react';

interface CalorieRingProps {
  targetCalories: number;
  consumedCalories: number;
  burnedCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function CalorieRing({
  targetCalories,
  consumedCalories,
  burnedCalories,
  proteinG,
  carbsG,
  fatG,
}: CalorieRingProps) {
  const netCalories = Math.max(0, consumedCalories - burnedCalories);
  const remaining = targetCalories - consumedCalories;
  const percentage = targetCalories > 0 ? Math.min(100, Math.round((consumedCalories / targetCalories) * 100)) : 0;

  // SVG parameters
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* CIRCULAR PROGRESS */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />
          {/* Animated progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#calorieGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
          <defs>
            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {remaining >= 0 ? remaining : 0}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {remaining >= 0 ? 'kcal left' : 'kcal over'}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium mt-0.5">
            {percentage}% of daily goal
          </span>
        </div>
      </div>

      {/* METRIC BREAKDOWN */}
      <div className="flex-1 w-full space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consumed</span>
            </div>
            <p className="text-xl font-bold text-white">{consumedCalories}</p>
            <p className="text-[10px] text-slate-500">kcal intake</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Burned</span>
            </div>
            <p className="text-xl font-bold text-white">{burnedCalories}</p>
            <p className="text-[10px] text-slate-500">exercise kcal</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Budget</span>
            </div>
            <p className="text-xl font-bold text-white">{targetCalories}</p>
            <p className="text-[10px] text-slate-500">target kcal</p>
          </div>
        </div>

        {/* MACRONUTRIENT BARS */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Macronutrient Breakdown</span>
            <span className="text-slate-400">Total: {proteinG + carbsG + fatG}g</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Protein</span>
                <span className="font-semibold text-emerald-400">{proteinG}g</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (proteinG / 140) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Carbs</span>
                <span className="font-semibold text-cyan-400">{carbsG}g</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (carbsG / 220) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Fat</span>
                <span className="font-semibold text-amber-400">{fatG}g</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (fatG / 70) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
