/**
 * Calorie Compass - Activity Ledger (Exercise MET Calculation Engine)
 * 
 * Standard Clinical Formula:
 * Calories burned = MET × 3.5 × weight_kg / 200 × duration_minutes
 * (Equivalent to: MET × weight_kg × duration_hours × 1.05 or MET × 3.5 ml O2/kg/min × kg / 1000 × 5 kcal/L)
 */

export interface ExerciseActivity {
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'sports' | 'daily_life' | 'flexibility';
  met: number;
  description: string;
  commonIntensity?: 'light' | 'moderate' | 'vigorous';
}

export const EXERCISE_LIBRARY: ExerciseActivity[] = [
  // Cardio & Locomotion
  { id: 'walk_leisure', name: 'Walking (leisurely, 3.2 km/h / 2.0 mph)', category: 'cardio', met: 2.8, description: 'Slow pace on firm surface', commonIntensity: 'light' },
  { id: 'walk_brisk', name: 'Walking (brisk, 5.0 km/h / 3.0 mph)', category: 'cardio', met: 3.5, description: 'Moderate brisk walking for fitness', commonIntensity: 'moderate' },
  { id: 'walk_fast', name: 'Walking (very brisk, 6.4 km/h / 4.0 mph)', category: 'cardio', met: 5.0, description: 'Power walking, vigorous effort', commonIntensity: 'vigorous' },
  { id: 'run_jog', name: 'Jogging (8.0 km/h / 5.0 mph)', category: 'cardio', met: 7.0, description: 'Steady moderate jogging', commonIntensity: 'moderate' },
  { id: 'run_moderate', name: 'Running (9.6 km/h / 6.0 mph)', category: 'cardio', met: 9.8, description: 'Standard distance running pace', commonIntensity: 'vigorous' },
  { id: 'run_fast', name: 'Running (12.0 km/h / 7.5 mph)', category: 'cardio', met: 11.8, description: 'Fast pace, high cardiovascular demand', commonIntensity: 'vigorous' },
  { id: 'cycling_leisure', name: 'Cycling (leisure, < 16 km/h / 10 mph)', category: 'cardio', met: 4.0, description: 'Casual cycling, flat terrain', commonIntensity: 'light' },
  { id: 'cycling_moderate', name: 'Cycling (moderate, 19-22 km/h / 12-14 mph)', category: 'cardio', met: 8.0, description: 'Moderate commuting or road riding', commonIntensity: 'moderate' },
  { id: 'swimming_leisure', name: 'Swimming (leisurely freestyle/breaststroke)', category: 'cardio', met: 6.0, description: 'Recreational lap swimming', commonIntensity: 'moderate' },
  { id: 'swimming_vigorous', name: 'Swimming (vigorous laps / butterfly / crawl)', category: 'cardio', met: 10.0, description: 'Intense training swim laps', commonIntensity: 'vigorous' },
  { id: 'jump_rope_moderate', name: 'Jump Rope (moderate pace, 100-120 bpm)', category: 'cardio', met: 11.0, description: 'Continuous rhythmic skipping', commonIntensity: 'vigorous' },
  { id: 'rowing_machine', name: 'Rowing Machine (moderate effort, 100W)', category: 'cardio', met: 7.0, description: 'Ergometer indoor rowing', commonIntensity: 'moderate' },
  { id: 'elliptical', name: 'Elliptical Trainer (moderate effort)', category: 'cardio', met: 6.5, description: 'Cross-trainer gym workout', commonIntensity: 'moderate' },

  // Strength & Resistance
  { id: 'weight_lifting_light', name: 'Weight Training (light to moderate effort)', category: 'strength', met: 3.5, description: 'Circuit training or light dumbbell lifting with rests', commonIntensity: 'light' },
  { id: 'weight_lifting_vigorous', name: 'Weight Training (vigorous / powerlifting)', category: 'strength', met: 6.0, description: 'Heavy compounds (squats, deadlifts) with high exertion', commonIntensity: 'vigorous' },
  { id: 'calisthenics_moderate', name: 'Calisthenics (pushups, pullups, bodyweight)', category: 'strength', met: 5.0, description: 'Bodyweight resistance exercises', commonIntensity: 'moderate' },
  { id: 'hiit', name: 'HIIT (High Intensity Interval Training)', category: 'cardio', met: 8.5, description: 'Alternating bursts of max effort and brief rests', commonIntensity: 'vigorous' },

  // Sports
  { id: 'badminton', name: 'Badminton (recreational to competitive)', category: 'sports', met: 5.5, description: 'Singles or doubles match play', commonIntensity: 'moderate' },
  { id: 'football_soccer', name: 'Football / Soccer (competitive match)', category: 'sports', met: 10.0, description: 'Continuous active field running and sprinting', commonIntensity: 'vigorous' },
  { id: 'basketball', name: 'Basketball (game or vigorous drills)', category: 'sports', met: 8.0, description: 'Full court or half court match', commonIntensity: 'vigorous' },
  { id: 'tennis_singles', name: 'Tennis (singles)', category: 'sports', met: 7.3, description: 'Court play with rapid sprints', commonIntensity: 'vigorous' },

  // Flexibility & Mind-Body
  { id: 'yoga_hatha', name: 'Yoga (Hatha / Restorative)', category: 'flexibility', met: 2.5, description: 'Gentle stretching and breathing poses', commonIntensity: 'light' },
  { id: 'yoga_vinyasa', name: 'Yoga (Power / Vinyasa Flow)', category: 'flexibility', met: 4.0, description: 'Dynamic flow and core activation', commonIntensity: 'moderate' },
  { id: 'pilates', name: 'Pilates (mat exercises)', category: 'flexibility', met: 3.5, description: 'Core stability and postural strength', commonIntensity: 'light' },
];

export interface CalculateCaloriesBurnedInput {
  met: number;
  weightKg: number;
  durationMinutes: number;
}

/**
 * Calculates estimated energy expenditure using the standard MET equation.
 * Calories = MET × 3.5 × weight_kg / 200 × duration_minutes
 */
export function calculateCaloriesBurned(input: CalculateCaloriesBurnedInput): number {
  const { met, weightKg, durationMinutes } = input;

  if (met <= 0 || weightKg <= 0 || durationMinutes <= 0) {
    return 0;
  }

  // Formula: MET * 3.5 * weightKg / 200 * durationMinutes
  const calories = (met * 3.5 * weightKg / 200) * durationMinutes;
  return Math.round(calories);
}

/**
 * Find activity by ID or search by keyword
 */
export function findActivity(id: string): ExerciseActivity | undefined {
  return EXERCISE_LIBRARY.find((a) => a.id === id);
}

export function searchActivities(query: string): ExerciseActivity[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return EXERCISE_LIBRARY;
  return EXERCISE_LIBRARY.filter(
    (a) =>
      a.name.toLowerCase().includes(clean) ||
      a.description.toLowerCase().includes(clean) ||
      a.category.toLowerCase().includes(clean)
  );
}
