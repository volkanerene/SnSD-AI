// ========================================
// Common Types
// ========================================

export type UUID = string;
export type Timestamp = string; // ISO 8601 format
export type JsonObject = Record<string, any>;

// ========================================
// Tenant Types
// ========================================

export type LicensePlan = 'basic' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'inactive' | 'suspended';

export interface Tenant {
  id: UUID;
  name: string;
  slug: string;
  logo_url: string | null;
  subdomain: string;
  license_plan: LicensePlan;
  modules_enabled: string[];
  max_users: number;
  max_contractors: number;
  max_video_requests_monthly: number;
  settings: JsonObject;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  status: TenantStatus;
  trial_ends_at: Timestamp | null;
  subscription_ends_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: UUID | null;
}

export interface TenantCreate {
  name: string;
  slug: string;
  subdomain: string;
  license_plan: LicensePlan;
  contact_email: string;
  contact_phone?: string;
  logo_url?: string;
  modules_enabled?: string | string[];
  max_users?: number;
  max_contractors?: number;
  max_video_requests_monthly?: number;
  settings?: JsonObject;
  status?: TenantStatus;
}

export interface TenantUpdate extends Partial<TenantCreate> {
  status?: TenantStatus;
  trial_ends_at?: Timestamp | null;
  subscription_ends_at?: Timestamp | null;
}

// ========================================
// Role Types
// ========================================

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  level: number;
  permissions: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type RoleLevel = 0 | 1 | 2 | 3 | 4;

export const ROLE_LEVELS = {
  SNSD_ADMIN: 0,
  COMPANY_ADMIN: 1,
  HSE_MANAGER: 2,
  HSE_SPECIALIST: 3,
  CONTRACTOR: 4
} as const;

// ========================================
// Profile Types
// ========================================

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface Profile {
  id: UUID;
  tenant_id: UUID;
  full_name: string;
  username: string;
  avatar_url: string | null;
  phone: string | null;
  locale: string;
  timezone: string;
  role_id: number;
  contractor_id: UUID | null;
  department: string | null;
  job_title: string | null;
  notification_preferences: NotificationPreferences;
  is_active: boolean;
  last_login_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  metadata?: JsonObject;
}

// ========================================
// Contractor Types
// ========================================

export type ContractorStatus = 'active' | 'inactive' | 'blacklisted';
export type RiskLevel = 'green' | 'yellow' | 'red';

export interface Contractor {
  id: UUID;
  tenant_id: UUID;
  tenant_name?: string; // Tenant name for display purposes
  name: string;
  legal_name: string;
  company_type?: 'bireysel' | 'limited'; // Bireysel (Individual) or Limited Company
  tax_number: string;
  trade_registry_number: string | null;
  contact_person: string;
  contact_email: string;
  country_code?: string; // Phone country code (e.g., +90)
  contact_phone: string;
  address: string | null;
  city: string;
  country: string;
  documents: JsonObject[];
  status: ContractorStatus;
  risk_level: RiskLevel | null;
  last_evaluation_score: number | null;
  last_evaluation_date: Timestamp | null;
  metadata: JsonObject;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: UUID | null;
}

export interface ContractorCreate {
  name: string;
  legal_name: string;
  company_type: 'bireysel' | 'limited';
  tax_number: string;
  contact_person: string;
  contact_email: string;
  country_code: string; // Phone country code (e.g., +90)
  contact_phone: string;
  city: string;
  country?: string;
  trade_registry_number?: string;
  address?: string;
  documents?: JsonObject[];
  status?: ContractorStatus;
  metadata?: JsonObject;
}

export interface ContractorUpdate extends Partial<ContractorCreate> {
  risk_level?: RiskLevel;
  last_evaluation_score?: number;
  last_evaluation_date?: Timestamp;
}

// ========================================
// FRM-32 Question Types
// ========================================

export type QuestionType =
  | 'yes_no'
  | 'number'
  | 'multiple_choice'
  | 'text'
  | 'file_upload';

export interface FRM32Question {
  id: UUID;
  question_code: string;
  question_text_tr: string;
  question_text_en: string | null;
  k2_category: string;
  k2_weight: number;
  question_type: QuestionType;
  options: string[] | null;
  scoring_rules: JsonObject;
  max_score: number;
  is_required: boolean;
  is_active: boolean;
  position: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ========================================
// FRM-32 Submission Types
// ========================================

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'completed'
  | 'rejected';
export type EvaluationType = 'periodic' | 'incident' | 'audit';

export interface FRM32Submission {
  id: UUID;
  tenant_id: UUID;
  contractor_id: UUID;
  evaluation_period: string;
  evaluation_type: EvaluationType;
  status: SubmissionStatus;
  progress_percentage: number;
  submitted_at: Timestamp | null;
  completed_at: Timestamp | null;
  final_score: number | null;
  risk_classification: RiskLevel | null;
  ai_summary: string | null;
  attachments: JsonObject[];
  notes: string | null;
  metadata: JsonObject;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: UUID | null;
  reviewed_by: UUID | null;
}

export interface FRM32SubmissionCreate {
  contractor_id: UUID;
  evaluation_period: string;
  evaluation_type?: EvaluationType;
  status?: SubmissionStatus;
}

export interface FRM32SubmissionUpdate {
  progress_percentage?: number;
  notes?: string;
  status?: SubmissionStatus;
  final_score?: number;
  risk_classification?: RiskLevel;
  ai_summary?: string;
  reviewed_by?: UUID;
}

// ========================================
// FRM-32 Answer Types
// ========================================

export interface FRM32Answer {
  id: UUID;
  submission_id: UUID;
  question_id: UUID;
  answer_value: any;
  score: number | null;
  attachments: JsonObject[] | null;
  notes: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FRM32AnswerCreate {
  submission_id: UUID;
  question_id: UUID;
  answer_value: any;
  attachments?: JsonObject[];
  notes?: string;
}

// ========================================
// Payment Types
// ========================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod =
  | 'credit_card'
  | 'bank_transfer'
  | 'paypal'
  | 'wire_transfer';
export type PaymentProvider = 'stripe' | 'paytr' | 'iyzico' | 'bank';
export type SubscriptionPeriod = 'monthly' | 'yearly';

export interface Payment {
  id: UUID;
  tenant_id: UUID;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  provider: PaymentProvider | null;
  provider_transaction_id: string | null;
  provider_response: JsonObject | null;
  status: PaymentStatus;
  subscription_period: SubscriptionPeriod | null;
  subscription_starts_at: Timestamp | null;
  subscription_ends_at: Timestamp | null;
  invoice_number: string | null;
  invoice_url: string | null;
  metadata: JsonObject;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: UUID | null;
}

export interface PaymentCreate {
  amount: number;
  currency?: string;
  payment_method: PaymentMethod;
  provider?: PaymentProvider;
  subscription_period?: SubscriptionPeriod;
  subscription_starts_at?: Timestamp;
  subscription_ends_at?: Timestamp;
}

// ========================================
// API Response Types
// ========================================

export interface ApiError {
  detail: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ContractorFilters extends PaginationParams {
  status?: ContractorStatus;
}

export interface SubmissionFilters extends PaginationParams {
  status?: SubmissionStatus;
  contractor_id?: UUID;
}

export interface PaymentFilters extends PaginationParams {
  status?: PaymentStatus;
}

// ========================================
// Auth Types
// ========================================

export interface AuthUser {
  id: UUID;
  email: string;
  user_metadata?: JsonObject;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}
