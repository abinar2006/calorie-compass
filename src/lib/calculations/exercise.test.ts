import { describe, it, expect } from 'vitest';
import { calculateCaloriesBurned, findActivity, EXERCISE_LIBRARY } from './exercise';

describe('Exercise MET Calculations', () => {
  it('calculates calories burned correctly for running', () => {
    // Running moderate (MET 9.8), 70kg, 30 minutes
    // Formula: MET * 3.5 * weightKg / 200 * durationMinutes
    // 9.8 * 3.5 * 70 / 200 * 30
    // = 34.3 * 70 / 200 * 30
    // = 2401 / 200 * 30
    // = 12.005 * 30 = 360.15 -> round to 360 kcal
    const calories = calculateCaloriesBurned({
      met: 9.8,
      weightKg: 70,
      durationMinutes: 30,
    });
    expect(calories).toBe(360);
  });

  it('calculates calories burned for walking briskly for 45 minutes', () => {
    // Brisk walk (MET 3.5), 80kg, 45 mins
    // 3.5 * 3.5 * 80 / 200 * 45 = 12.25 * 80 / 200 * 45 = 980 / 200 * 45 = 4.9 * 45 = 220.5 -> 221
    const calories = calculateCaloriesBurned({
      met: 3.5,
      weightKg: 80,
      durationMinutes: 45,
    });
    expect(calories).toBe(221);
  });

  it('returns 0 for non-positive duration or weight', () => {
    expect(calculateCaloriesBurned({ met: 5, weightKg: 0, durationMinutes: 30 })).toBe(0);
    expect(calculateCaloriesBurned({ met: 5, weightKg: 70, durationMinutes: 0 })).toBe(0);
  });

  it('contains expected core activities in library', () => {
    const running = findActivity('run_moderate');
    expect(running).toBeDefined();
    expect(running?.met).toBe(9.8);

    const walking = findActivity('walk_brisk');
    expect(walking).toBeDefined();
    expect(walking?.met).toBe(3.5);

    expect(EXERCISE_LIBRARY.length).toBeGreaterThan(15);
  });
});
