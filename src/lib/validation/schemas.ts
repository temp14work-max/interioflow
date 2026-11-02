/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const ConsultationRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  project_type: z.enum([
    'residential',
    'commercial',
    'apartment',
    'renovation',
    'single_room',
    'full_villa',
  ]),
  area_sqft: z.number().int().positive('Area must be greater than 0').max(100000),
  budget_min_paise: z.number().int().nonnegative('Minimum budget must be positive'),
  budget_max_paise: z.number().int().positive('Maximum budget must be greater than 0'),
  city: z.string().min(2, 'City name is required').max(60),
  requirements: z.string().min(15, 'Please provide detailed requirements (at least 15 characters)'),
  style_preferences: z.array(z.string()).min(1, 'Please select at least one preferred design style'),
  preferred_contact: z.string().email('Valid email is required'),
  customer_phone: z.string().min(10, 'Valid 10-digit phone number is required'),
}).refine(data => data.budget_max_paise >= data.budget_min_paise, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budget_max_paise'],
});

export const ProposalSchema = z.object({
  design_request_id: z.string().uuid().or(z.string().min(1)),
  title: z.string().min(5, 'Proposal title must be at least 5 characters').max(120),
  scope: z.string().min(20, 'Scope description must be at least 20 characters'),
  deliverables: z.array(z.string().min(2)).min(1, 'Please specify at least one deliverable'),
  price_paise: z.number().int().positive('Quotation price must be greater than 0'),
  estimated_duration_weeks: z.number().int().positive('Duration must be at least 1 week').max(104),
  valid_until_days: z.number().int().min(7).max(90).default(30),
  notes: z.string().optional(),
});

export const TaskUpdateSchema = z.object({
  task_id: z.string().min(1),
  status: z.enum(['todo', 'in_progress', 'blocked', 'completed']),
  progress_percent: z.number().int().min(0).max(100),
  notes: z.string().optional(),
});

export const CreateTaskSchema = z.object({
  project_id: z.string().min(1),
  assigned_contractor_id: z.string().min(1, 'Please assign a contractor'),
  title: z.string().min(3, 'Task title must be at least 3 characters'),
  description: z.string().min(5, 'Description is required'),
  category: z.enum(['electrical', 'carpentry', 'painting', 'flooring', 'plumbing', 'general']),
  due_date: z.string().min(1, 'Due date is required'),
});

export const ShippingAddressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(6, 'Valid 6-digit postal PIN code is required'),
});

export const ProductSchema = z.object({
  sku: z.string().min(3).max(30),
  name: z.string().min(3, 'Product name is required').max(120),
  slug: z.string().min(3).max(120),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['lighting', 'furniture', 'rugs', 'wall_decor', 'accessories']),
  price_paise: z.number().int().positive('Price must be greater than 0'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  is_active: z.boolean().default(true),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
});
