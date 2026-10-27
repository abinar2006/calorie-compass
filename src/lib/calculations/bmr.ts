/**
 * Calorie Compass - Mifflin-St Jeor BMR and TDEE Calculation Engine
 * 
 * Clinical Formulas:
 * Male: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 * Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 * 
 * TDEE = BMR × Activity Multiplier
 */

export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export type FitnessGoal = 'weight_loss' | 'maintenance' | 'weight_gain';

export interface BMRInput {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
}

export interface TDEEInput extends BMRInput {
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  customAdjustment?: number;
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  adjustmentKcal: number;
  activityMultiplier: number;
  macroRecommendations: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    proteinKcal: number;
    carbsKcal: number;
    fatKcal: number;
  };
  disclaimer: string;
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { multiplier: number; label: string; description: string }> = {
  sedentary: {
    multiplier: 1.2,
    label: 'Sedentary',
    description: 'Little or no exercise, desk job',
  },
  lightly_active: {
    multiplier: 1.375,
    label: 'Lightly Active',
    description: 'Light exercise / sports 1-3 days/week',
  },
  moderately_active: {
    multiplier: 1.55,
    label: 'Moderately Active',
    description: 'Moderate exercise / sports 3-5 days/week',
  },
  very_active: {
    multiplier: 1.725,
    label: 'Very Active',
    description: 'Hard exercise / sports 6-7 days/week',
  },
  extra_active: {
    multiplier: 1.9,
    label: 'Extra Active',
    description: 'Very hard exercise, physical job or 2x training',
  },
};

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 */
export function calculateBMR(input: BMRInput): number {
  const { age, gender, heightCm, weightKg } = input;

  if (age <= 0 || heightCm <= 0 || weightKg <= 0) {
    throw new Error('Age, height, and weight must be positive numbers.');
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;

  return Math.round(bmr);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) and conservative suggested calorie targets.
 */
export function calculateTDEE(input: TDEEInput): CalculationResult {
  const bmr = calculateBMR(input);
  const activityConfig = ACTIVITY_MULTIPLIERS[input.activityLevel];
  const activityMultiplier = activityConfig ? activityConfig.multiplier : 1.2;
  const tdee = Math.round(bmr * activityMultiplier);

  // Conservative, non-aggressive adjustments
  let adjustmentKcal = 0;
  if (input.customAdjustment !== undefined) {
    adjustmentKcal = input.customAdjustment;
  } else {
    switch (input.fitnessGoal) {
      case 'weight_loss':
        // Conservative moderate deficit: -400 kcal (approx 0.35kg - 0.5kg/week)
        adjustmentKcal = -400;
        break;
      case 'weight_gain':
        // Conservative lean surplus: +350 kcal
        adjustmentKcal = 350;
        break;
      case 'maintenance':
      default:
        adjustmentKcal = 0;
        break;
    }
  }

  let targetCalories = tdee + adjustmentKcal;

  // Safe lower boundaries to protect health
  const safeMinimum = input.gender === 'male' ? 1500 : 1200;
  if (targetCalories < safeMinimum) {
    targetCalories = safeMinimum;
  }

  // Balanced healthy macronutrient breakdown:
  // Protein: ~25-30% of energy
  // Fat: ~25-30% of energy (9 kcal/g)
  // Carbs: Remaining ~45-50% (4 kcal/g)
  const proteinKcal = Math.round(targetCalories * 0.25);
  const fatKcal = Math.round(targetCalories * 0.25);
  const carbsKcal = Math.round(targetCalories * 0.50);

  const proteinGrams = Math.round(proteinKcal / 4);
  const fatGrams = Math.round(fatKcal / 9);
  const carbsGrams = Math.round(carbsKcal / 4);

  return {
    bmr,
    tdee,
    targetCalories,
    adjustmentKcal,
    activityMultiplier,
    macroRecommendations: {
      proteinGrams,
      carbsGrams,
      fatGrams,
      proteinKcal,
      carbsKcal,
      fatKcal,
    },
    disclaimer:
      'Estimates are derived from the Mifflin–St Jeor formula and documented physical activity coefficients. They serve for educational and personal nutritional planning, not clinical diagnosis or medical therapy. Individuals with medical conditions, pregnancy, or eating disorders should consult a licensed healthcare practitioner.',
  };
}
