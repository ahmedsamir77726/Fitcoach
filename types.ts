
export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  DIET = 'DIET',
  WORKOUT = 'WORKOUT',
  CHAT = 'CHAT',
  MAPS = 'MAPS'
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female' | 'other';
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance';
  activityLevel: 'sedentary' | 'active' | 'athlete';
  workoutPreference: 'home' | 'gym';
  dietaryRestrictions: string;
  // New Fields
  language: 'en' | 'ar';
  budget: 'cheap' | 'moderate' | 'expensive';
  targetWeight: number;
  targetTimeline: number; // weeks
  cheatDay: 'none' | 'fri' | 'sat' | 'sun';
}

export interface DailyMetric {
  day: string;
  weight: number;
  calories: number;
  heartRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface DietMeal {
  name: string;
  calories: number;
  costEstimate: string; // e.g. "$"
  macros: { p: string; c: string; f: string };
  ingredients: string[];
  instructions: string;
}

export interface DietPlan {
  day?: string;
  isCheatDay?: boolean;
  breakfast: DietMeal;
  lunch: DietMeal;
  dinner: DietMeal;
  snacks: DietMeal[];
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes: string;
  benefits: string; // "What I will gain"
}

export interface WorkoutRoutine {
  period: 'daily' | 'weekly' | 'monthly';
  warmUp: string[];
  exercises: Exercise[];
  coolDown: string[];
  schedule?: { day: string; focus: string }[]; // For weekly/monthly views
}

export interface PlaceResult {
  title: string;
  uri: string;
  address?: string;
  rating?: number;
}
