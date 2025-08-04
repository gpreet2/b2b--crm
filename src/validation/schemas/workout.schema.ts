import { z } from 'zod';

import { commonSchemas } from './common.schema';

// Exercise muscle groups
export const muscleGroupEnum = z.enum([
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'glutes',
  'quadriceps',
  'hamstrings',
  'calves',
  'full_body',
]);

// Exercise categories
export const exerciseCategoryEnum = z.enum([
  'strength',
  'cardio',
  'flexibility',
  'balance',
  'plyometric',
  'rehabilitation',
]);

// Equipment types
export const equipmentEnum = z.enum([
  'none',
  'barbell',
  'dumbbell',
  'kettlebell',
  'resistance_band',
  'cable',
  'machine',
  'bodyweight',
  'medicine_ball',
  'stability_ball',
  'other',
]);

// Exercise schema
export const exerciseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: exerciseCategoryEnum,
  muscle_groups: z.array(muscleGroupEnum).min(1),
  equipment: z.array(equipmentEnum).default(['none']),
  instructions: z.array(z.string()).optional(),
  video_url: z.string().url().optional(),
  image_urls: z.array(z.string().url()).optional(),
  difficulty: z.number().int().min(1).max(5).default(3),
  is_compound: z.boolean().default(false),
  organization_id: z.string().uuid().optional(),
});

// Workout set schema
export const workoutSetSchema = z.object({
  set_number: z.number().int().positive(),
  target_reps: z.number().int().positive().optional(),
  target_weight: z.number().positive().optional(),
  target_duration_seconds: z.number().int().positive().optional(),
  target_distance_meters: z.number().positive().optional(),
  rest_seconds: z.number().int().min(0).default(60),
  notes: z.string().max(500).optional(),
});

// Workout exercise schema
export const workoutExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  order: z.number().int().positive(),
  sets: z.array(workoutSetSchema).min(1),
  superset_with: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

// Workout template schema
export const workoutTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['strength', 'cardio', 'hiit', 'mobility', 'mixed']),
  difficulty: z.number().int().min(1).max(5).default(3),
  estimated_duration_minutes: z.number().int().positive(),
  exercises: z.array(workoutExerciseSchema).min(1),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
  created_by: z.string().uuid(),
  organization_id: z.string().uuid(),
});

// Workout session schema (actual workout performed)
export const workoutSessionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  template_id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  location_id: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  mood_before: z.number().int().min(1).max(5).optional(),
  mood_after: z.number().int().min(1).max(5).optional(),
  energy_level: z.number().int().min(1).max(5).optional(),
});

// Performed set schema (actual performance)
export const performedSetSchema = z.object({
  set_number: z.number().int().positive(),
  actual_reps: z.number().int().min(0).optional(),
  actual_weight: z.number().min(0).optional(),
  actual_duration_seconds: z.number().int().min(0).optional(),
  actual_distance_meters: z.number().min(0).optional(),
  rpe: z.number().min(1).max(10).optional(), // Rate of Perceived Exertion
  notes: z.string().max(500).optional(),
});

// Performed exercise schema
export const performedExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  order: z.number().int().positive(),
  sets: z.array(performedSetSchema).min(1),
  skipped: z.boolean().default(false),
  substituted_with: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

// Workout progress tracking schema
export const workoutProgressSchema = z.object({
  user_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  date: z.string().datetime(),
  personal_record: z
    .object({
      type: z.enum(['weight', 'reps', 'time', 'distance']),
      value: z.number().positive(),
      previous_value: z.number().positive().optional(),
      improvement_percentage: z.number().optional(),
    })
    .optional(),
  total_volume: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

// Workout plan schema (multi-week program)
export const workoutPlanSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  duration_weeks: z.number().int().positive(),
  workouts_per_week: z.number().int().positive().max(7),
  goal: z.enum(['strength', 'muscle_gain', 'fat_loss', 'endurance', 'general_fitness']),
  difficulty: z.number().int().min(1).max(5).default(3),
  template_schedule: z
    .array(
      z.object({
        week: z.number().int().positive(),
        day: z.number().int().min(1).max(7),
        template_id: z.string().uuid(),
        notes: z.string().max(500).optional(),
      })
    )
    .min(1),
  created_by: z.string().uuid(),
  is_public: z.boolean().default(false),
  price: commonSchemas.money.optional(),
  organization_id: z.string().uuid(),
});

// User workout plan assignment
export const userWorkoutPlanSchema = z.object({
  user_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  assigned_by: z.string().uuid(),
  progress: z
    .object({
      completed_workouts: z.number().int().min(0).default(0),
      total_workouts: z.number().int().positive(),
      current_week: z.number().int().positive().default(1),
      adherence_percentage: z.number().min(0).max(100).default(0),
    })
    .optional(),
  notes: z.string().max(1000).optional(),
});
