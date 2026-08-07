import { z } from 'zod';

import { apiTypeSchema, entityTypeSchema, laneSchema } from './enums.js';

/** NIB (Nomor Induk Berusaha) is 13 digits, issued by OSS. */
export const nibSchema = z.string().regex(/^\d{13}$/, 'NIB harus 13 angka / NIB must be 13 digits');

/**
 * NPWP: 15 digits historically, 16 since the NIK-as-NPWP transition. Accept
 * both, store digits only — display formatting is a UI concern.
 */
export const npwpSchema = z
  .string()
  .regex(/^\d{15,16}$/, 'NPWP harus 15 atau 16 angka / NPWP must be 15 or 16 digits');

/** NIK Kepabeanan (customs access number) is 8 digits. */
export const customsNikSchema = z.string().regex(/^\d{8}$/);

export const slugSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers and hyphens');

export const companySummarySchema = z.object({
  id: z.string(),
  slug: slugSchema,
  brandName: z.string(),
  legalName: z.string(),
  entityType: entityTypeSchema.nullable(),
  province: z.string().nullable(),
  city: z.string().nullable(),
  verificationLane: laneSchema,
  verifiedAt: z.string().nullable(),
});
export type CompanySummary = z.infer<typeof companySummarySchema>;

export const companyDetailSchema = companySummarySchema.extend({
  nib: nibSchema.nullable(),
  npwp: npwpSchema.nullable(),
  apiType: apiTypeSchema.nullable(),
  customsNik: customsNikSchema.nullable(),
  address: z.string().nullable(),
  website: z.string().url().nullable(),
  aboutId: z.string().nullable(),
  aboutEn: z.string().nullable(),
  employeeRange: z.string().nullable(),
  yearEstablished: z.number().int().nullable(),
  createdAt: z.string(),
});
export type CompanyDetail = z.infer<typeof companyDetailSchema>;

export const createCompanyBodySchema = z.object({
  legalName: z.string().min(3).max(200),
  brandName: z.string().min(2).max(120),
  entityType: entityTypeSchema,
  nib: nibSchema.optional(),
  npwp: npwpSchema.optional(),
  apiType: apiTypeSchema.optional(),
  province: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  address: z.string().max(400).optional(),
  website: z.string().url().optional(),
  phone: z.string().min(6).max(32).optional(),
  aboutId: z.string().max(2000).optional(),
  aboutEn: z.string().max(2000).optional(),
  yearEstablished: z.number().int().min(1900).max(2100).optional(),
});
export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;
