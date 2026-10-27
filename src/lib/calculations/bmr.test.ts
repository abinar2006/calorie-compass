import { describe, it, expect } from 'vitest';
import { calculateBMR, calculateTDEE } from './bmr';

describe('Mifflin-St Jeor BMR Calculations', () => {
  it('calculates male BMR correctly', () => {
    // Male: 70kg, 175cm, 25 years old
    // BMR = (10 * 70) + (6.25 * 175) - (5 * 25) + 5
    //     = 700 + 1093.75 - 125 + 5 = 1673.75 -> round to 1674
    const bmr = calculateBMR({
      gender: 'male',
      weightKg: 70,
      heightCm: 175,
      age: 25,
    });
    expect(bmr).toBe(1674);
  });

  it('calculates female BMR correctly', () => {
    // Female: 60kg, 165cm, 28 years old
    // BMR = (10 * 60) + (6.25 * 165) - (5 * 28) - 161
    //     = 600 + 1031.25 - 140 - 161 = 1330.25 -> round to 1330
    const bmr = calculateBMR({
      gender: 'female',
      weightKg: 60,
      heightCm: 165,
      age: 28,
    });
    expect(bmr).toBe(1330);
  });

  it('calculates TDEE and target calories for sedentary maintenance', () => {
    // Male: 70kg, 175cm, 25yo (BMR 1674), Sedentary (1.2)
    // TDEE = 1674 * 1.2 = 2008.8 -> 2009
    const result = calculateTDEE({
      gender: 'male',
      weightKg: 70,
      heightCm: 175,
      age: 25,
      activityLevel: 'sedentary',
      fitnessGoal: 'maintenance',
    });

    expect(result.bmr).toBe(1674);
    expect(result.tdee).toBe(2009);
    expect(result.targetCalories).toBe(2009);
    expect(result.adjustmentKcal).toBe(0);
  });

  it('calculates TDEE with conservative deficit for weight loss', () => {
    // Moderately active (1.55): 1674 * 1.55 = 2594.7 -> 2595
    // Deficit: -400 -> 2195
    const result = calculateTDEE({
      gender: 'male',
      weightKg: 70,
      heightCm: 175,
      age: 25,
      activityLevel: 'moderately_active',
      fitnessGoal: 'weight_loss',
    });

    expect(result.tdee).toBe(2595);
    expect(result.targetCalories).toBe(2195);
    expect(result.adjustmentKcal).toBe(-400);
  });

  it('respects safe floor limit for aggressive deficit', () => {
    // Female low weight & age
    const result = calculateTDEE({
      gender: 'female',
      weightKg: 42,
      heightCm: 150,
      age: 45,
      activityLevel: 'sedentary',
      fitnessGoal: 'weight_loss',
    });

    // Safe floor for females should never fall below 1200 kcal
    expect(result.targetCalories).toBeGreaterThanOrEqual(1200);
  });
});
