# Calorie Compass 🧭

**Calorie Compass** is an evidence-based, AI-powered health and nutrition web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)**.

The system integrates clinical metabolic equations, computer vision meal decomposition, metabolic equivalent of task (MET) exercise accounting, and generative culinary synthesis into a cohesive health ledger.

---

## 🎯 4 Core Architectural Modules

### 1. User Onboarding & Profile Engine
- **Mifflin–St Jeor Basal Metabolic Rate (BMR)**:
  - Male: $\text{BMR} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}) + 5$
  - Female: $\text{BMR} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}) - 161$
- **Total Daily Energy Expenditure (TDEE)**:
  - $\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$
  - Multipliers: Sedentary ($1.2\times$), Lightly Active ($1.375\times$), Moderately Active ($1.55\times$), Very Active ($1.725\times$), Extra Active ($1.9\times$).
- **Conservative Nutritional Target Strategy**:
  - Weight loss: conservative $-400\text{ kcal}$ deficit with protected physiological floors ($1,500\text{ kcal}$ male / $1,200\text{ kcal}$ female).
  - Maintenance: $100\%$ equilibrium.
  - Weight gain: $+350\text{ kcal}$ lean surplus.
- **Clinical Notice**: Estimates serve educational nutritional planning, not clinical diagnosis or medical therapy.

### 2. AI Vision-Based Food Logger
- **Visual Meal Decomposition**:
  - Upload JPEG, PNG, or WebP food images from device or capture directly on mobile.
  - Server-side validation enforcing file type verification and a $10\text{ MB}$ payload cap.
  - Primary candidate: **FoodBase API** (`https://api.foodbase.dev/v1/analyze/photo`).
  - Multimodal fallback: **Google Gemini Vision** (`gemini-1.5-flash`).
  - Intelligent heuristic fallback with zero dead ends when keys are pending.
- **Decomposed Plate Component Breakdown**:
  - Identifies distinct plate items, portion sizes, calories, and macronutrients ($\text{Protein}, \text{Carbs}, \text{Fat}$).
  - Full client-side correction interface allowing users to adjust portions and nutrient values before saving to the database.

### 3. Activity Ledger (Exercise Tracking)
- **Clinical MET Equation**:
  $$\text{Calories Burned} = \text{MET} \times 3.5 \times \frac{\text{weight}_{\text{kg}}}{200} \times \text{duration}_{\text{minutes}}$$
- **Documented Activity Catalog**:
  - Walking, running, cycling, swimming, jump rope, rowing, HIIT, resistance training, soccer, basketball, badminton, yoga, and custom user-defined MET entries.
  - Automatic expenditure calculation using profile weight or custom session weight.
  - Non-destructive calorie budget policy (exercise burns are tracked as expenditure rather than automatically inflating intake allowance).

### 4. Generative AI Recipe Engine
- **Culinary Synthesis**:
  - Leverages available pantry ingredients and leftovers to formulate high-protein, balanced, or low-carb meals.
  - Strict exclusion filters for common allergens (peanuts, tree nuts, dairy, gluten, shellfish, soy, eggs).
  - Generates step-by-step instructions, prep/cook times, and per-serving macronutrient breakdowns.
  - 1-click **Add to Food Log** button with duplicate submission prevention.
  - Personal recipe bookmarking into the user's private collection.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom glassmorphism tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security & Auth)
- **Nutrition APIs**:
  - [USDA FoodData Central](https://fdc.nal.usda.gov/) (Whole foods & clinical nutrition lookup)
  - [Open Food Facts](https://world.openfoodfacts.org/) (Packaged foods & barcode resolution)
- **AI Integrations**:
  - [FoodBase](https://foodbase.dev/) (Food photo analysis)
  - [Google Gemini API](https://aistudio.google.com/) (Multimodal vision & structured JSON recipe synthesis)
- **Testing**: [Vitest](https://vitest.dev/) (Unit tests for metabolic equations and MET calculations)

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/<your-username>/calorie-compass.git
cd calorie-compass
npm install
```

### 3. Run Unit Tests
Verify mathematical equations and business logic:
```bash
npm test
```

### 4. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Vision & Recipe Synthesis
FOODBASE_API_KEY=your_foodbase_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Nutrition Lookup
USDA_FDC_API_KEY=DEMO_KEY
```

> **Note**: If Supabase or AI keys are not yet configured, Calorie Compass runs in **Evaluation & Demo Mode** with persistent browser storage, allowing you to test every page and workflow immediately!

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Database Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase project dashboard.
3. Open `supabase/schema.sql` from this repository, copy its contents, paste them into the SQL editor, and click **Run**.
4. This will create:
   - `profiles` (demographic data, Mifflin-St Jeor calculated BMR/TDEE, and calorie targets)
   - `food_logs` (meal items, categories, macronutrients, and photo sources)
   - `exercise_logs` (activities, duration, MET values, and burned energy)
   - `saved_recipes` (AI-synthesized recipes and macronutrient specs)
   - Automated `updated_at` trigger
   - Row Level Security (RLS) policies guaranteeing multi-tenant isolation so users can access only their own records.
5. In **Authentication -> URL Configuration**, add your local (`http://localhost:3000`) and production Vercel URLs to **Redirect URLs**.

---

## 🚢 Public Deployment to Vercel

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Calorie Compass release"
   git branch -M main
   git remote add origin https://github.com/<username>/calorie-compass.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **Add New... -> Project**.
3. Import your `calorie-compass` repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `FOODBASE_API_KEY` (optional)
   - `USDA_FDC_API_KEY` (optional)
5. Click **Deploy**. Vercel will build the production Next.js application and provide your public production URL.

---

## 🧪 Testing Matrix

| Test Suite | Coverage | Status |
| :--- | :--- | :--- |
| **Mifflin-St Jeor Formula** | Male/Female BMR, TDEE, Deficit/Surplus, Safe Boundaries | ✅ Passed |
| **MET Exercise Equations** | Cardio, Running, Walking, Swimming, Custom MET calculations | ✅ Passed |
| **Food Recognition API** | Validation, Base64 handling, Payload size bounds, Fallbacks | ✅ Tested |
| **Nutrition Lookup** | USDA FoodData Central + Open Food Facts API | ✅ Tested |
| **AI Recipe Generator** | Dietary & allergen filtering, Structured JSON formatting | ✅ Tested |
| **Row Level Security** | Multi-user isolation via PostgreSQL RLS | ✅ Verified in Schema |

---

## 📄 License & Attribution
- Food nutritional data provided by **USDA FoodData Central** and **Open Food Facts** (ODbL).
- Built for educational and academic project presentation.
