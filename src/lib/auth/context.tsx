'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ProfileRow, FoodLogRow, ExerciseLogRow, SavedRecipeRow } from '@/lib/supabase/types';
import { calculateTDEE } from '@/lib/calculations/bmr';

export interface AppUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileRow>) => Promise<{ error: string | null }>;
  
  // Data actions
  foodLogs: FoodLogRow[];
  exerciseLogs: ExerciseLogRow[];
  savedRecipes: SavedRecipeRow[];
  refreshData: () => Promise<void>;
  addFoodLog: (item: Omit<FoodLogRow, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>;
  deleteFoodLog: (id: string) => Promise<{ error: string | null }>;
  addExerciseLog: (item: Omit<ExerciseLogRow, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>;
  deleteExerciseLog: (id: string) => Promise<{ error: string | null }>;
  saveRecipe: (recipe: Omit<SavedRecipeRow, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>;
  deleteSavedRecipe: (id: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'calorie_compass_';

// Default initial demo profile
const DEFAULT_DEMO_PROFILE: ProfileRow = {
  id: 'demo-user-id',
  email: 'explorer@caloriecompass.io',
  full_name: 'Alex Mercer',
  age: 26,
  gender: 'male',
  height_cm: 178,
  weight_kg: 74,
  activity_level: 'moderately_active',
  fitness_goal: 'weight_loss',
  bmr: 1738,
  tdee: 2694,
  target_calories: 2294,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [foodLogs, setFoodLogs] = useState<FoodLogRow[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogRow[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipeRow[]>([]);
  
  const configured = isSupabaseConfigured();

  // Load active data
  const loadSupabaseData = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData as ProfileRow);
      }

      // 2. Fetch Food Logs
      const { data: foods } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });
      
      if (foods) setFoodLogs(foods as FoodLogRow[]);

      // 3. Fetch Exercise Logs
      const { data: exercises } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });
      
      if (exercises) setExerciseLogs(exercises as ExerciseLogRow[]);

      // 4. Fetch Saved Recipes
      const { data: recipes } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (recipes) setSavedRecipes(recipes as SavedRecipeRow[]);
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    }
  }, []);

  const loadLocalData = useCallback((userId: string) => {
    try {
      const localProfileStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}profile_${userId}`);
      if (localProfileStr) {
        setProfile(JSON.parse(localProfileStr));
      } else {
        // Initialize default profile for demo user
        const initialProfile = { ...DEFAULT_DEMO_PROFILE, id: userId };
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile_${userId}`, JSON.stringify(initialProfile));
        setProfile(initialProfile);
      }

      const foodsStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}foods_${userId}`);
      if (foodsStr) {
        setFoodLogs(JSON.parse(foodsStr));
      } else {
        // Seed helpful initial samples so the user immediately sees a rich dashboard
        const sampleFoods: FoodLogRow[] = [
          {
            id: 'sample-food-1',
            user_id: userId,
            food_name: 'Oatmeal with Blueberries & Chia Seeds',
            meal_category: 'breakfast',
            serving_size: 1,
            serving_unit: 'bowl (300g)',
            quantity: 1,
            calories: 380,
            protein_g: 13,
            carbs_g: 62,
            fat_g: 8,
            source: 'manual',
            image_url: null,
            notes: 'High fiber morning bowl',
            logged_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: 'sample-food-2',
            user_id: userId,
            food_name: 'Grilled Chicken Breast with Brown Rice & Broccoli',
            meal_category: 'lunch',
            serving_size: 1,
            serving_unit: 'plate',
            quantity: 1,
            calories: 540,
            protein_g: 48,
            carbs_g: 52,
            fat_g: 12,
            source: 'usda',
            image_url: null,
            notes: 'Lean protein lunch',
            logged_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ];
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}foods_${userId}`, JSON.stringify(sampleFoods));
        setFoodLogs(sampleFoods);
      }

      const exerciseStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}exercises_${userId}`);
      if (exerciseStr) {
        setExerciseLogs(JSON.parse(exerciseStr));
      } else {
        const sampleExercises: ExerciseLogRow[] = [
          {
            id: 'sample-ex-1',
            user_id: userId,
            activity_name: 'Jogging (8.0 km/h / 5.0 mph)',
            category: 'cardio',
            met_value: 7.0,
            duration_minutes: 30,
            weight_used_kg: 74,
            calories_burned: 272,
            logged_at: new Date().toISOString(),
            notes: 'Morning park run',
            created_at: new Date().toISOString(),
          },
        ];
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}exercises_${userId}`, JSON.stringify(sampleExercises));
        setExerciseLogs(sampleExercises);
      }

      const recipesStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}recipes_${userId}`);
      if (recipesStr) {
        setSavedRecipes(JSON.parse(recipesStr));
      } else {
        const sampleRecipes: SavedRecipeRow[] = [
          {
            id: 'sample-recipe-1',
            user_id: userId,
            title: 'Mediterranean Lemon Herb Salmon Bowl',
            description: 'Fresh grilled Atlantic salmon paired with warm quinoa, roasted zucchini, and Greek tzatziki.',
            ingredients: [
              { name: 'Salmon fillet', amount: '200g' },
              { name: 'Cooked quinoa', amount: '1 cup' },
              { name: 'Zucchini', amount: '1 medium sliced' },
              { name: 'Olive oil', amount: '1 tbsp' },
              { name: 'Lemon juice & oregano', amount: 'to taste' },
            ],
            instructions: [
              'Season salmon with olive oil, lemon, salt, and oregano.',
              'Pan-sear salmon skin-side down for 4-5 mins, flip and cook 3 mins.',
              'Roast or sauté zucchini until tender.',
              'Assemble over warm quinoa and serve fresh.',
            ],
            prep_time_mins: 10,
            cook_time_mins: 15,
            servings: 1,
            calories_per_serving: 520,
            total_calories: 520,
            protein_g: 42,
            carbs_g: 38,
            fat_g: 22,
            dietary_tags: ['High Protein', 'Omega 3', 'Gluten Free'],
            created_at: new Date().toISOString(),
          },
        ];
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}recipes_${userId}`, JSON.stringify(sampleRecipes));
        setSavedRecipes(sampleRecipes);
      }
    } catch (err) {
      console.error('Error loading local data:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) return;
    if (configured) {
      await loadSupabaseData(user.id);
    } else {
      loadLocalData(user.id);
    }
  }, [user, configured, loadSupabaseData, loadLocalData]);

  // Initial Auth Session Check
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      if (configured) {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const u: AppUser = {
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata,
            };
            setUser(u);
            await loadSupabaseData(u.id);
          } else {
            setUser(null);
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const u: AppUser = {
                id: session.user.id,
                email: session.user.email || '',
                user_metadata: session.user.user_metadata,
              };
              setUser(u);
              await loadSupabaseData(u.id);
            } else {
              setUser(null);
              setProfile(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } catch (e) {
          console.error('Supabase auth init error:', e);
        }
      } else {
        // Fallback demo/local session
        const storedUser = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}current_user`);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            loadLocalData(parsed.id);
          } catch {
            setUser(null);
          }
        } else {
          // Auto-sign in default demo user for seamless preview
          const defaultUser: AppUser = {
            id: 'demo-user-id',
            email: 'explorer@caloriecompass.io',
            user_metadata: { full_name: 'Alex Mercer' },
          };
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user`, JSON.stringify(defaultUser));
          setUser(defaultUser);
          loadLocalData(defaultUser.id);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, [configured, loadSupabaseData, loadLocalData]);

  // Sign In
  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (configured && password) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        if (data.user) {
          const u: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: data.user.user_metadata,
          };
          setUser(u);
          await loadSupabaseData(u.id);
        }
      } else {
        // Local mode sign in
        const userId = 'user_' + btoa(email.toLowerCase()).replace(/=/g, '').slice(0, 16);
        const u: AppUser = {
          id: userId,
          email: email.trim().toLowerCase(),
          user_metadata: { full_name: email.split('@')[0] },
        };
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user`, JSON.stringify(u));
        setUser(u);
        loadLocalData(u.id);
      }
      setIsLoading(false);
      return { error: null };
    } catch (err: unknown) {
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
    }
  };

  // Sign Up
  const signUp = async (email: string, password?: string, fullName?: string) => {
    setIsLoading(true);
    try {
      if (configured && password) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || email.split('@')[0] },
          },
        });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        if (data.user) {
          const u: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: { full_name: fullName },
          };
          setUser(u);
        }
      } else {
        const userId = 'user_' + btoa(email.toLowerCase()).replace(/=/g, '').slice(0, 16);
        const u: AppUser = {
          id: userId,
          email: email.trim().toLowerCase(),
          user_metadata: { full_name: fullName || email.split('@')[0] },
        };
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}current_user`, JSON.stringify(u));
        setUser(u);
        loadLocalData(u.id);
      }
      setIsLoading(false);
      return { error: null };
    } catch (err: unknown) {
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : 'Sign up failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    if (configured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}current_user`);
    }
    setUser(null);
    setProfile(null);
    setFoodLogs([]);
    setExerciseLogs([]);
    setSavedRecipes([]);
    setIsLoading(false);
  };

  // Update Profile
  const updateProfile = async (profileData: Partial<ProfileRow>) => {
    if (!user) return { error: 'No authenticated user' };

    try {
      // Recalculate BMR and TDEE if biological parameters are updated
      const merged = { ...(profile || DEFAULT_DEMO_PROFILE), ...profileData, id: user.id };
      
      const calcResult = calculateTDEE({
        age: merged.age,
        gender: merged.gender,
        heightCm: merged.height_cm,
        weightKg: merged.weight_kg,
        activityLevel: merged.activity_level,
        fitnessGoal: merged.fitness_goal,
      });

      const updatedRow: ProfileRow = {
        ...merged,
        bmr: calcResult.bmr,
        tdee: calcResult.tdee,
        target_calories: calcResult.targetCalories,
        updated_at: new Date().toISOString(),
      };

      if (configured) {
        const supabase = createClient();
        const { error } = await supabase.from('profiles').upsert(updatedRow as any);
        if (error) return { error: error.message };
      } else {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}profile_${user.id}`, JSON.stringify(updatedRow));
      }

      setProfile(updatedRow);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
  };

  // Add Food Log
  const addFoodLog = async (item: Omit<FoodLogRow, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Please log in to track meals.' };

    const newId = 'food_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const newEntry: FoodLogRow = {
      ...item,
      id: newId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    if (configured) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('food_logs').insert(newEntry as any);
        if (error) return { error: error.message };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Database error' };
      }
    } else {
      const updated = [newEntry, ...foodLogs];
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}foods_${user.id}`, JSON.stringify(updated));
    }

    setFoodLogs((prev) => [newEntry, ...prev]);
    return { error: null };
  };

  // Delete Food Log
  const deleteFoodLog = async (id: string) => {
    if (!user) return { error: 'Unauthorized' };

    if (configured) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('food_logs').delete().eq('id', id);
        if (error) return { error: error.message };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Database error' };
      }
    } else {
      const updated = foodLogs.filter((f) => f.id !== id);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}foods_${user.id}`, JSON.stringify(updated));
    }

    setFoodLogs((prev) => prev.filter((f) => f.id !== id));
    return { error: null };
  };

  // Add Exercise Log
  const addExerciseLog = async (item: Omit<ExerciseLogRow, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Please log in to record exercise.' };

    const newId = 'ex_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const newEntry: ExerciseLogRow = {
      ...item,
      id: newId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    if (configured) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('exercise_logs').insert(newEntry as any);
        if (error) return { error: error.message };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Database error' };
      }
    } else {
      const updated = [newEntry, ...exerciseLogs];
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}exercises_${user.id}`, JSON.stringify(updated));
    }

    setExerciseLogs((prev) => [newEntry, ...prev]);
    return { error: null };
  };

  // Delete Exercise Log
  const deleteExerciseLog = async (id: string) => {
    if (!user) return { error: 'Unauthorized' };

    if (configured) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('exercise_logs').delete().eq('id', id);
        if (error) return { error: error.message };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Database error' };
      }
    } else {
      const updated = exerciseLogs.filter((e) => e.id !== id);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}exercises_${user.id}`, JSON.stringify(updated));
    }

    setExerciseLogs((prev) => prev.filter((e) => e.id !== id));
    return { error: null };
  };

  // Save Recipe
  const saveRecipe = async (recipe: Omit<SavedRecipeRow, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Please log in to save recipes.' };

    const newId = 'rec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const newEntry: SavedRecipeRow = {
      ...recipe,
      id: newId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    if (configured) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('saved_recipes').insert(newEntry as any);
        if (error) return { error: error.message };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Database error' };
      }
    } else {
      const updated = [newEntry, ...savedRecipes];
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}recipes_${user.id}`, JSON.stringify(updated));
    }

    setSavedRecipes((prev) => [newEntry, ...prev]);
    return { error: null };
  };

  // Delete Saved Recipe
  const deleteSavedRecipe = async (id: string) => {
    if (!user) return { error: 'Unauthorized' };

    if (configured) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('saved_recipes').delete().eq('id', id);
        if (error) return { error: error.message };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Database error' };
      }
    } else {
      const updated = savedRecipes.filter((r) => r.id !== id);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}recipes_${user.id}`, JSON.stringify(updated));
    }

    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        foodLogs,
        exerciseLogs,
        savedRecipes,
        refreshData,
        addFoodLog,
        deleteFoodLog,
        addExerciseLog,
        deleteExerciseLog,
        saveRecipe,
        deleteSavedRecipe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
