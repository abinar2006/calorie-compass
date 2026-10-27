export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type FitnessGoal = 'weight_loss' | 'maintenance' | 'weight_gain';
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ExerciseCategory = 'cardio' | 'strength' | 'sports' | 'daily_life' | 'flexibility';
export type FoodSource = 'manual' | 'usda' | 'openfoodfacts' | 'ai_vision' | 'ai_recipe';

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  fitness_goal: FitnessGoal;
  bmr: number;
  tdee: number;
  target_calories: number;
  created_at: string;
  updated_at: string;
}

export interface FoodLogRow {
  id: string;
  user_id: string;
  food_name: string;
  meal_category: MealCategory;
  serving_size: number;
  serving_unit: string;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: FoodSource;
  image_url: string | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface ExerciseLogRow {
  id: string;
  user_id: string;
  activity_name: string;
  category: ExerciseCategory;
  met_value: number;
  duration_minutes: number;
  weight_used_kg: number;
  calories_burned: number;
  logged_at: string;
  notes: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  notes?: string;
}

export interface SavedRecipeRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: RecipeIngredient[] | Json;
  instructions: string[] | Json;
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  calories_per_serving: number;
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  dietary_tags: string[];
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; age: number; gender: Gender; height_cm: number; weight_kg: number; activity_level: ActivityLevel; fitness_goal: FitnessGoal; bmr: number; tdee: number; target_calories: number };
        Update: Partial<ProfileRow>;
      };
      food_logs: {
        Row: FoodLogRow;
        Insert: Omit<FoodLogRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<FoodLogRow>;
      };
      exercise_logs: {
        Row: ExerciseLogRow;
        Insert: Omit<ExerciseLogRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<ExerciseLogRow>;
      };
      saved_recipes: {
        Row: SavedRecipeRow;
        Insert: Omit<SavedRecipeRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<SavedRecipeRow>;
      };
    };
  };
}
