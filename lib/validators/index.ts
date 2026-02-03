import { z } from 'zod';

export const reminderSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  notes: z.string().max(1000).optional(),
  dueAt: z.coerce.date(),
  priority: z.enum(['low', 'medium', 'high']),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']),
  status: z.enum(['pending', 'done', 'snoozed']).optional(),
});

export const updateReminderSchema = reminderSchema.partial();

export const goalSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().max(2000).optional(),
  targetDate: z.coerce.date().optional(),
  status: z.enum(['active', 'paused', 'done']).optional(),
  progressType: z.enum(['percent', 'count', 'checklist']),
  progressCurrent: z.number().min(0).optional(),
  progressTarget: z.number().min(1),
});

export const updateGoalSchema = goalSchema.partial();

export const milestoneSchema = z.object({
  goalId: z.number().int().positive(),
  title: z.string().min(1, 'Le titre est requis').max(200),
  done: z.boolean().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  done: z.boolean().optional(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
