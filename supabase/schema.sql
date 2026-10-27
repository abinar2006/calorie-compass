-- ==============================================================================
-- CALORIE COMPASS - SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Instructions: Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- This creates all required tables, constraints, indexes, triggers, and secure RLS policies.
-- ==============================================================================

-- 1. EXTENSIONS
create extension if -- Enable UUID generation if not present
not exists "pgcrypto";

-- ==============================================================================
-- 2. PROFILES TABLE
-- Stores user demographic and physiological inputs, calculated BMR, TDEE, and calorie target
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  age integer not null check (age >= 10 and age <= 120),
  gender text not null check (gender in ('male', 'female')),
  height_cm numeric(5, 2) not null check (height_cm >= 50 and height_cm <= 260),
  weight_kg numeric(5, 2) not null check (weight_kg >= 25 and weight_kg <= 400),
  activity_level text not null check (
    activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')
  ),
  fitness_goal text not null check (
    fitness_goal in ('weight_loss', 'maintenance', 'weight_gain')
  ),
  bmr integer not null,
  tdee integer not null,
  target_calories integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. FOOD LOGS TABLE
-- Tracks daily intake meals, macros, source (manual, USDA, Open Food Facts, AI Vision, AI Recipe)
-- ==============================================================================
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_name text not null,
  meal_category text not null check (meal_category in ('breakfast', 'lunch', 'dinner', 'snack')),
  serving_size numeric(6, 2) not null default 1.0,
  serving_unit text not null default 'serving',
  quantity numeric(6, 2) not null default 1.0,
  calories integer not null check (calories >= 0),
  protein_g numeric(6, 1) not null default 0 check (protein_g >= 0),
  carbs_g numeric(6, 1) not null default 0 check (carbs_g >= 0),
  fat_g numeric(6, 1) not null default 0 check (fat_g >= 0),
  source text not null default 'manual' check (
    source in ('manual', 'usda', 'openfoodfacts', 'ai_vision', 'ai_recipe')
  ),
  image_url text,
  notes text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 4. EXERCISE LOGS TABLE
-- Tracks activity ledger, MET value, duration, weight used, and calories burned
-- ==============================================================================
create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_name text not null,
  category text not null check (
    category in ('cardio', 'strength', 'sports', 'daily_life', 'flexibility')
  ),
  met_value numeric(4, 1) not null check (met_value > 0),
  duration_minutes integer not null check (duration_minutes > 0),
  weight_used_kg numeric(5, 2) not null check (weight_used_kg > 0),
  calories_burned integer not null check (calories_burned >= 0),
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 5. SAVED RECIPES TABLE
-- Stores AI-generated and customized culinary recipes
-- ==============================================================================
create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  prep_time_mins integer default 0 check (prep_time_mins >= 0),
  cook_time_mins integer default 0 check (cook_time_mins >= 0),
  servings integer not null default 1 check (servings > 0),
  calories_per_serving integer not null check (calories_per_serving >= 0),
  total_calories integer not null check (total_calories >= 0),
  protein_g numeric(6, 1) not null default 0 check (protein_g >= 0),
  carbs_g numeric(6, 1) not null default 0 check (carbs_g >= 0),
  fat_g numeric(6, 1) not null default 0 check (fat_g >= 0),
  dietary_tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 6. PERFORMANCE & QUERY INDEXES
-- Optimize user-specific date queries for dashboards and history ledgers
-- ==============================================================================
create index if not exists idx_food_logs_user_date on public.food_logs (user_id, logged_at desc);
create index if not exists idx_exercise_logs_user_date on public.exercise_logs (user_id, logged_at desc);
create index if not exists idx_saved_recipes_user_created on public.saved_recipes (user_id, created_at desc);

-- ==============================================================================
-- 7. AUTOMATED UPDATED_AT TRIGGER
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user isolation: authenticated users can only access their own records
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.food_logs enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.saved_recipes enable row level security;

-- PROFILES POLICIES
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- FOOD LOGS POLICIES
drop policy if exists "Users can view their own food logs" on public.food_logs;
create policy "Users can view their own food logs"
  on public.food_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own food logs" on public.food_logs;
create policy "Users can insert their own food logs"
  on public.food_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own food logs" on public.food_logs;
create policy "Users can update their own food logs"
  on public.food_logs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own food logs" on public.food_logs;
create policy "Users can delete their own food logs"
  on public.food_logs for delete
  using (auth.uid() = user_id);

-- EXERCISE LOGS POLICIES
drop policy if exists "Users can view their own exercise logs" on public.exercise_logs;
create policy "Users can view their own exercise logs"
  on public.exercise_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own exercise logs" on public.exercise_logs;
create policy "Users can insert their own exercise logs"
  on public.exercise_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own exercise logs" on public.exercise_logs;
create policy "Users can update their own exercise logs"
  on public.exercise_logs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own exercise logs" on public.exercise_logs;
create policy "Users can delete their own exercise logs"
  on public.exercise_logs for delete
  using (auth.uid() = user_id);

-- SAVED RECIPES POLICIES
drop policy if exists "Users can view their own saved recipes" on public.saved_recipes;
create policy "Users can view their own saved recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own saved recipes" on public.saved_recipes;
create policy "Users can insert their own saved recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own saved recipes" on public.saved_recipes;
create policy "Users can update their own saved recipes"
  on public.saved_recipes for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own saved recipes" on public.saved_recipes;
create policy "Users can delete their own saved recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);
