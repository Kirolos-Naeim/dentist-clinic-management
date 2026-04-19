import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  dob: z.string().optional().nullable(),
});

export const visitSchema = z.object({
  visit_date: z.string().min(1),
  diagnosis: z.string().optional().nullable(),
  treatment: z.string().optional().nullable(),
  payment_status: z.enum(['pending', 'paid', 'partial']).default('pending'),
  notes: z.string().optional().nullable(),
});

export const serviceSchema = z.object({
  name: z.string().min(2),
  material_cost: z.coerce.number().min(0),
  labor_cost: z.coerce.number().min(0),
  overhead_cost: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
});

export const productSchema = z.object({
  name: z.string().min(2),
  unit_cost: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  reorder_level: z.coerce.number().int().min(0),
  expiry_date: z.string().optional().nullable(),
});

export const expenseSchema = z.object({
  name: z.string().min(2),
  amount: z.coerce.number().min(0),
  date: z.string().min(1),
  category: z.string().optional().nullable(),
});

export const invoiceSchema = z.object({
  patient_id: z.coerce.number().int().positive(),
  date: z.string().min(1),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    service_id: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
  })).min(1),
});
